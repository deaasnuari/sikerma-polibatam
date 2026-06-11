import { apiRequest } from '@/lib/api';
import type { RekapDokumen } from '@/services/adminRekapDataService';

const REKAP_CACHE_TTL_MS = 60 * 1000;
let rekapDokumenCache: { data: RekapDokumen[]; expiresAt: number } | null = null;
let rekapDokumenInFlight: Promise<RekapDokumen[]> | null = null;

type ApiPaginatedResponse<T> = {
  success: boolean;
  message: string;
  data: {
    data: T[];
  };
};

type ApiDokumenRow = {
  id: number;
  nomor_dokumen?: string | null;
  no_dokumen?: string | null;
  nama_dokumen?: string | null;
  jenis_dokumen: string;
  tanggal_mulai?: string | null;
  tanggal_berakhir?: string | null;
  status_siklus?: 'active' | 'expiring' | 'archived' | null;
  mitra?: { id: number; nama_mitra: string } | null;
  unit_prodi?: { id: number; nama: string } | null;
  file?: string | null;
  alasan_arsip?: string | null;
  pengajuan?: { id: number; nomor_pengajuan: string; nama_pengusul: string; whatsapp_pengusul?: string } | null;
  // Sudah difilter oleh controller ke peran_berkas = 'dokumen_final' saja
  dokumen_files?: Array<{
    id: number;
    nama_file: string;
    path_file: string;
    peran_berkas?: string | null;
    mime_type?: string | null;
    ukuran_file_bytes?: number | null;
  }> | null;
};

function mapJenis(value?: string | null): 'MoA' | 'MoU' | 'IA' {
  const upper = (value || '').toUpperCase();
  if (upper === 'MOA') return 'MoA';
  if (upper === 'IA') return 'IA';
  return 'MoU';
}

function mapStatus(value: ApiDokumenRow['status_siklus']): RekapDokumen['status'] {
  if (value === 'archived') return 'Kadaluarsa';
  if (value === 'expiring') return 'Akan Berakhir';
  return 'Aktif';
}

function toDisplayDate(value?: string | null): string {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  return parsed.toLocaleDateString('en-GB');
}

export async function fetchRekapDokumenFromApi(options?: { forceRefresh?: boolean }): Promise<RekapDokumen[]> {
  const shouldUseCache = !options?.forceRefresh;
  const now = Date.now();

  if (shouldUseCache && rekapDokumenCache && rekapDokumenCache.expiresAt > now) {
    return rekapDokumenCache.data;
  }

  if (rekapDokumenInFlight) {
    return rekapDokumenInFlight;
  }

  rekapDokumenInFlight = (async () => {
    const response = await apiRequest<ApiPaginatedResponse<ApiDokumenRow & { sumber_pengajuan_id?: number | null; keterangan?: string | null }>>('/dokumen-kerjasama?per_page=2000');
    const mapped = (response.data?.data ?? []).map((row) => {
    const nomor = row.nomor_dokumen || row.no_dokumen || `DOK-${row.id}`;
    const tanggalMulaiRaw = row.tanggal_mulai || '';
    
    // Parse legacy Mitra from keterangan if mitra object is not present
    let namaMitra = row.mitra?.nama_mitra;
    if (!namaMitra && row.keterangan && row.keterangan.includes('Mitra:')) {
      const match = row.keterangan.match(/Mitra:\s*(.*?)(?:\s*\|\s*Bidang:|$)/i);
      if (match && match[1]) {
        namaMitra = match[1].trim();
      }
    }
    
    if (!namaMitra && row.file) {
      // e.g. "49 MOU Solustar Pte Ltd 2017 (1).pdf..."
      const cleanedFile = row.file.replace(/^\d+\s*(MOU|MOA|IA)\s*/i, '').replace(/\.pdf.*$/i, '').trim();
      if (cleanedFile && cleanedFile.length > 2) {
        namaMitra = cleanedFile;
      }
    }

    // Gunakan dokumen_files (sudah difilter ke peran_berkas='dokumen_final' oleh controller).
    // Fallback ke kolom 'file' hanya untuk record lama yang belum punya dokumen_files.
    let dokumenTerkait: any[] = [];
    const finalFiles = row.dokumen_files ?? [];
    if (finalFiles.length > 0) {
      dokumenTerkait = finalFiles.map((f) => {
        const rawPath = f.path_file || '';
        const fileUrl = rawPath.startsWith('http')
          ? rawPath
          : `http://localhost:8000/storage/${rawPath.replace(/^\/+/, '')}`;
        const sizeLabel = f.ukuran_file_bytes
          ? `${Math.round(f.ukuran_file_bytes / 1024)} KB`
          : 'Dokumen Final';
        return {
          nama: f.nama_file,
          url: fileUrl,
          tipe: f.mime_type || (f.nama_file.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'),
          ukuran: sizeLabel,
          tanggal: toDisplayDate(tanggalMulaiRaw),
        };
      });
    } else if (row.file) {
      // Legacy: record lama yang hanya punya kolom 'file'
      dokumenTerkait.push({
        nama: row.file.split('/').pop() || row.file,
        url: row.file.startsWith('http') ? row.file : `http://localhost:8000/storage/uploads/${row.file}`,
        tipe: row.file.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
        ukuran: 'File System',
        tanggal: toDisplayDate(tanggalMulaiRaw),
      });
    }

      return {
      id: row.id,
      sourcePengajuanId: row.sumber_pengajuan_id || undefined,
      noDokumen: nomor,
      namaMitra: namaMitra || '-',
      jenis: mapJenis(row.jenis_dokumen),
      unit: row.unit_prodi?.nama || '-',
      tanggalMulai: toDisplayDate(tanggalMulaiRaw),
      berlakuHingga: toDisplayDate(row.tanggal_berakhir),
      tahun: (tanggalMulaiRaw || new Date().toISOString()).slice(0, 4),
      status: mapStatus(row.status_siklus),
      whatsappNumber: row.pengajuan?.whatsapp_pengusul || undefined,
      dokumenTerkait,
      alasanArsip: row.alasan_arsip || null,
      buktiPdf: dokumenTerkait.length > 0 ? dokumenTerkait[0].url : null,
    };
  });

    rekapDokumenCache = {
      data: mapped,
      expiresAt: Date.now() + REKAP_CACHE_TTL_MS,
    };

    return mapped;
  })();

  try {
    return await rekapDokumenInFlight;
  } finally {
    rekapDokumenInFlight = null;
  }
}

export async function deleteDokumenKerjasamaById(id: number): Promise<void> {
  await apiRequest(`/dokumen-kerjasama/${id}`, {
    method: 'DELETE',
  });

  rekapDokumenCache = null;
}

export type ArsipDokumenApiItem = {
  id: number;
  noDokumen: string;
  namaMitra: string;
  jenis: 'MoA' | 'MoU' | 'IA';
  tanggalMulai: string;
  berlakuHingga: string;
  alasanArsip: string | null;
  buktiPdf: string | null;
};

export async function fetchArsipDokumenFromApi(): Promise<ArsipDokumenApiItem[]> {
  const items = await fetchRekapDokumenFromApi();
  return items
    .filter((item) => item.status === 'Akan Berakhir' || item.status === 'Kadaluarsa')
    .map((item, index) => ({
      id: index + 1,
      noDokumen: item.noDokumen,
      namaMitra: item.namaMitra,
      jenis: item.jenis,
      tanggalMulai: item.tanggalMulai,
      berlakuHingga: item.berlakuHingga,
      alasanArsip: (item as any).alasanArsip || null,
      buktiPdf: (item as any).buktiPdf || null,
    }));
}
