import { apiRequest } from '@/lib/api';
import type { RekapDokumen } from '@/services/adminRekapDataService';

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
};

function mapJenis(value: string): 'MoA' | 'MoU' | 'IA' {
  const upper = value.toUpperCase();
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

export async function fetchRekapDokumenFromApi(): Promise<RekapDokumen[]> {
  const response = await apiRequest<ApiPaginatedResponse<ApiDokumenRow>>('/dokumen-kerjasama?per_page=500');
  return (response.data?.data ?? []).map((row) => {
    const nomor = row.nomor_dokumen || row.no_dokumen || `DOK-${row.id}`;
    const tanggalMulaiRaw = row.tanggal_mulai || '';

    return {
      sourcePengajuanId: undefined,
      noDokumen: nomor,
      namaMitra: row.mitra?.nama_mitra || '-',
      jenis: mapJenis(row.jenis_dokumen),
      unit: row.unit_prodi?.nama || '-',
      tanggalMulai: toDisplayDate(tanggalMulaiRaw),
      berlakuHingga: toDisplayDate(row.tanggal_berakhir),
      tahun: (tanggalMulaiRaw || new Date().toISOString()).slice(0, 4),
      status: mapStatus(row.status_siklus),
      whatsappNumber: undefined,
      dokumenTerkait: [],
    };
  });
}

export type ArsipDokumenApiItem = {
  id: number;
  noDokumen: string;
  namaMitra: string;
  jenis: 'MoA' | 'MoU' | 'IA';
  tanggalMulai: string;
  berlakuHingga: string;
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
    }));
}
