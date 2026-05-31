import { addAdminNotification } from '@/services/adminService';
import { removeMonitoringByPengajuanId, upsertMonitoringFromPengajuan } from '@/services/adminMonitoringService';
import { removeRekapByPengajuanId, upsertRekapFromPengajuan } from '@/services/adminRekapDataService';
import { hideStoryByPengajuanId, initAktivitasOnApproval } from '@/services/adminStoryAktivitasService';
import { apiRequest } from '@/lib/api';

export type PengajuanStatus = 'Menunggu' | 'Diproses' | 'Disetujui' | 'Ditolak';

export type PengajuanFileAttachment = {
  name: string;
  url: string;
  type?: string;
  size?: number;
};

// Tipe utama untuk satu data pengajuan kerjasama (Struktur Baru).
export interface PengajuanItem {
  id: number;
  nomorPengajuan: string;
  judulPengajuan: string;
  deskripsiPengajuan?: string;
  namaPengusul: string;
  jabatanPengusul?: string;
  diajukanPada: string;
  mitraId?: number;
  namaMitra: string;
  jenisDokumen: string;
  mitraKategori?: string;
  mitraNegara?: string;
  mitraAlamat?: string;
  mitraEmail?: string;
  mitraTelepon?: string;
  unitProdiId?: number;
  namaUnitProdi: string;
  kategoriPengajuan?: 'Internal' | 'Eksternal';
  tanggalMulai?: string;
  tanggalBerakhir?: string;
  emailPengusul?: string;
  whatsappPengusul?: string;
  emailTerverifikasiPada?: string;
  ruangLingkupIds: number[];
  ruangLingkup: string[]; // For display fallback
  statusPengajuan: PengajuanStatus;
  fileName?: string;
  fileAttachments?: PengajuanFileAttachment[];
  reviewComment?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  isFromAdmin?: boolean;
}

// Key localStorage untuk menyimpan seluruh data pengajuan di sisi frontend.
const STORAGE_KEY = 'pengajuanKerjasamaData';

// Mapping warna badge berdasarkan jenis dokumen.
export const pengajuanDokumenBadge: Record<string, string> = {
  MoA: 'bg-[#1E376C] text-white',
  MoU: 'bg-purple-700 text-white',
  PKS: 'bg-teal-700 text-white',
};

export interface PengajuanFilterOptions {
  filterStatus: string;
  filterJurusan: string;
  filterTahun: string;
  search: string;
}

export const pengajuanJurusanOptions = [
  'Manajemen dan Bisnis',
  'Teknik Elektro',
  'Teknik Informatika',
  'Teknik Mesin',
];

export const pengajuanUnitOptions = [
  'SHILAU (Satuan Hilirisasi Inovasi dan Layanan Usaha)',
  'P4M (Pusat Penjaminan Mutu dan Pengembangan Pembelajaran)',
  'P3M (Pusat Penelitian dan Pengabdian Kepada Masyarakat)',
  'SPI (Satuan Pengawas Internal)',
  'Akademik (Subag Akademik)',
  'SBUM (Sub Bagian Umum)',
  'UPA PKK (Pengembangan Karier dan Kewirausahaan)',
  'UPA Perpustakaan',
  'UPA PP (Perbaikan dan Perawatan)',
  'UPA TIK (Teknologi Informasi dan Komunikasi)',
  'Pokja OSDM (Organisasi dan SDM)',
  'Pokja Perencanaan',
  'Pokja Kemahasiswaan',
  'Pokja BMN & Pengadaan',
  'Pokja Keuangan',
  'Pokja Humas dan Kerjasama',
];

export const pengajuanJurusanUnitOptions = [...pengajuanJurusanOptions, ...pengajuanUnitOptions];

type ApiListResponse<T> = {
  success: boolean;
  message: string;
  data: T[] | { data: T[] };
};

type ApiSingleResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type ApiPengajuanRow = {
  id: number;
  // New schema keys
  nomor_pengajuan: string;
  nama_pengusul: string;
  jabatan_pengusul?: string | null;
  email_pengusul?: string | null;
  whatsapp_pengusul?: string | null;
  unit_prodi_id?: number | null;
  mitra_id?: number | null;
  judul_pengajuan: string;
  deskripsi_pengajuan?: string | null;
  jenis_dokumen: string;
  kategori_pengajuan?: 'internal' | 'eksternal' | null;
  ruang_lingkup_ids?: number[] | null;
  tanggal_mulai?: string | null;
  tanggal_berakhir?: string | null;
  status_pengajuan: 'menunggu' | 'diproses' | 'disetujui' | 'ditolak';
  diajukan_pada?: string | null;
  unit_prodi?: { id: number; nama: string } | null;
  mitra?: { id: number; nama_mitra: string; kategori_mitra?: string | null; negara?: string | null; alamat?: string | null; email_mitra?: string | null; telepon_mitra?: string | null; } | string | null;
  // Legacy schema keys (from recent pulled backend)
  judul?: string;
  deskripsi?: string | null;
  pengusul?: string;
  tanggal?: string | null;
  mitra_nama?: string | null;
  nama_mitra?: string | null;
  jurusan?: string | null;
  kategori?: 'Internal' | 'Eksternal' | null;
  ruang_lingkup?: string[] | null;
  status?: 'menunggu' | 'diproses' | 'disetujui' | 'ditolak';
};

function extractApiRows(response: ApiListResponse<ApiPengajuanRow>): ApiPengajuanRow[] {
  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data?.data ?? [];
}

function mapJenisDokumenFromApi(value: string): string {
  const upper = value.toUpperCase();
  if (upper === 'MOA') return 'MoA';
  if (upper === 'IA') return 'IA';
  return 'MoU';
}

function mapJenisDokumenToApi(value: string): 'MOU' | 'MOA' | 'IA' {
  const upper = value.toUpperCase();
  if (upper === 'MOA') return 'MOA';
  if (upper === 'IA') return 'IA';
  return 'MOU';
}

function mapStatusFromApi(value: ApiPengajuanRow['status_pengajuan']): PengajuanStatus {
  if (value === 'diproses') return 'Diproses';
  if (value === 'disetujui') return 'Disetujui';
  if (value === 'ditolak') return 'Ditolak';
  return 'Menunggu';
}

function mapStatusToApi(value: PengajuanStatus): 'menunggu' | 'diproses' | 'disetujui' | 'ditolak' {
  if (value === 'Diproses') return 'diproses';
  if (value === 'Disetujui') return 'disetujui';
  if (value === 'Ditolak') return 'ditolak';
  return 'menunggu';
}

function mapApiPengajuanToItem(row: ApiPengajuanRow): PengajuanItem {
  const tanggalRaw = row.diajukan_pada || row.tanggal;
  const diajukanPada = tanggalRaw ? tanggalRaw.slice(0, 10) : new Date().toISOString().slice(0, 10);
  const statusApi = row.status_pengajuan || row.status || 'menunggu';

  const mitraNama =
    (typeof row.mitra === 'string' ? row.mitra : row.mitra?.nama_mitra) ||
    row.mitra_nama ||
    row.nama_mitra ||
    '-';

  let resolvedRuangLingkup: string[] = [];
  if (Array.isArray(row.ruang_lingkup) && row.ruang_lingkup.length > 0) {
    resolvedRuangLingkup = row.ruang_lingkup;
  } else if (Array.isArray(row.ruang_lingkup_ids) && row.ruang_lingkup_ids.length > 0) {
    let cachedMaster: any[] = [];
    try {
      const module = require('@/services/masterRuangLingkupService');
      cachedMaster = module.getCachedMasterRuangLingkup() || [];
    } catch (e) {
      // Ignored
    }
    resolvedRuangLingkup = row.ruang_lingkup_ids.map((id) => {
      const found = cachedMaster.find((m: any) => m.id === id);
      return found ? found.nama_ruang_lingkup : `RL-${id}`;
    });
  }

  return {
    id: row.id,
    nomorPengajuan: row.nomor_pengajuan || `PGJ-LEGACY-${row.id}`,
    judulPengajuan: row.judul_pengajuan || row.judul || '-',
    deskripsiPengajuan: (row.deskripsi_pengajuan ?? row.deskripsi) || undefined,
    namaPengusul: row.nama_pengusul || row.pengusul || '-',
    jabatanPengusul: row.jabatan_pengusul || undefined,
    diajukanPada,
    mitraId: row.mitra_id ?? undefined,
    namaMitra: mitraNama,
    mitraKategori: typeof row.mitra === 'object' && row.mitra !== null && 'kategori_mitra' in row.mitra ? row.mitra.kategori_mitra || undefined : undefined,
    mitraNegara: typeof row.mitra === 'object' && row.mitra !== null && 'negara' in row.mitra ? row.mitra.negara || undefined : undefined,
    mitraAlamat: typeof row.mitra === 'object' && row.mitra !== null && 'alamat' in row.mitra ? row.mitra.alamat || undefined : undefined,
    mitraEmail: typeof row.mitra === 'object' && row.mitra !== null && 'email_mitra' in row.mitra ? row.mitra.email_mitra || undefined : undefined,
    mitraTelepon: typeof row.mitra === 'object' && row.mitra !== null && 'telepon_mitra' in row.mitra ? row.mitra.telepon_mitra || undefined : undefined,
    jenisDokumen: mapJenisDokumenFromApi(row.jenis_dokumen),
    unitProdiId: row.unit_prodi_id ?? undefined,
    namaUnitProdi: row.unit_prodi?.nama || row.jurusan || '-',
    kategoriPengajuan:
      row.kategori_pengajuan === 'internal' || row.kategori === 'Internal'
        ? 'Internal'
        : 'Eksternal',
    tanggalMulai: row.tanggal_mulai ?? undefined,
    tanggalBerakhir: row.tanggal_berakhir ?? undefined,
    emailPengusul: row.email_pengusul ?? undefined,
    whatsappPengusul: row.whatsapp_pengusul ?? undefined,
    ruangLingkupIds: row.ruang_lingkup_ids ?? [],
    ruangLingkup: resolvedRuangLingkup,
    statusPengajuan: mapStatusFromApi(statusApi),
  };
}

export async function fetchPengajuanDataFromApi(filters?: {
  search?: string;
  status?: string;
  jenisDokumen?: string;
  perPage?: number;
}): Promise<PengajuanItem[]> {
  const params = new URLSearchParams();
  params.set('per_page', String(filters?.perPage ?? 2000));
  if (filters?.search) params.set('search', filters.search);
  if (filters?.status && filters.status !== 'Semua Status') {
    const mappedStatus = mapStatusToApi(filters.status as PengajuanStatus);
    params.set('status', mappedStatus);
    params.set('status_pengajuan', mappedStatus);
  }
  if (filters?.jenisDokumen && filters.jenisDokumen !== 'Semua Jenis') {
    params.set('jenis_dokumen', mapJenisDokumenToApi(filters.jenisDokumen));
  }

  const endpoint = `/pengajuan?${params.toString()}`;
  const response = await apiRequest<ApiListResponse<ApiPengajuanRow>>(endpoint);
  const mapped = extractApiRows(response).map(mapApiPengajuanToItem);
  savePengajuanData(mapped);
  return mapped;
}

// Backward-compatible wrapper used by several pages after recent pull.
export async function refreshPengajuanDataFromApi(_force = false): Promise<PengajuanItem[]> {
  try {
    return await fetchPengajuanDataFromApi({ perPage: 500 });
  } catch {
    return getPengajuanData();
  }
}

export async function savePengajuanReviewApi(id: number, status: PengajuanStatus, comment?: string): Promise<PengajuanItem> {
  const response = await apiRequest<ApiSingleResponse<ApiPengajuanRow>>(`/pengajuan/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status_pengajuan: mapStatusToApi(status),
      status: mapStatusToApi(status),
      review_comment: comment?.trim() || null,
    }),
  });

  const mapped = mapApiPengajuanToItem(response.data);
  mapped.reviewComment = comment?.trim() || undefined;
  mapped.reviewedAt = new Date().toISOString().slice(0, 10);
  mapped.reviewedBy = 'Admin SIKERMA';
  return mapped;
}

export async function updatePengajuanItemApi(
  id: number,
  updates: Partial<Omit<PengajuanItem, 'id' | 'diajukanPada'>>
): Promise<PengajuanItem> {
  const payload: Record<string, unknown> = {};
  if (typeof updates.judulPengajuan === 'string') payload.judul_pengajuan = updates.judulPengajuan;
  if (typeof updates.deskripsiPengajuan === 'string') payload.deskripsi_pengajuan = updates.deskripsiPengajuan;
  if (typeof updates.namaPengusul === 'string') payload.nama_pengusul = updates.namaPengusul;
  if (typeof updates.jabatanPengusul === 'string') payload.jabatan_pengusul = updates.jabatanPengusul;
  if (typeof updates.emailPengusul === 'string') payload.email_pengusul = updates.emailPengusul;
  if (typeof updates.whatsappPengusul === 'string') payload.whatsapp_pengusul = updates.whatsappPengusul;
  if (updates.unitProdiId !== undefined) payload.unit_prodi_id = updates.unitProdiId;
  if (updates.mitraId !== undefined) payload.mitra_id = updates.mitraId;
  if (typeof updates.namaMitra === 'string') payload.nama_mitra = updates.namaMitra;
  if (typeof updates.jenisDokumen === 'string') payload.jenis_dokumen = mapJenisDokumenToApi(updates.jenisDokumen);
  if (typeof updates.tanggalMulai === 'string') payload.tanggal_mulai = updates.tanggalMulai;
  if (typeof updates.tanggalBerakhir === 'string') payload.tanggal_berakhir = updates.tanggalBerakhir;
  if (typeof updates.statusPengajuan === 'string') payload.status_pengajuan = mapStatusToApi(updates.statusPengajuan as PengajuanStatus);
  if (updates.ruangLingkupIds !== undefined) payload.ruang_lingkup_ids = updates.ruangLingkupIds;

  const response = await apiRequest<ApiSingleResponse<ApiPengajuanRow>>(`/pengajuan/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  return mapApiPengajuanToItem(response.data);
}

export async function deletePengajuanItemApi(id: number): Promise<void> {
  await apiRequest<ApiSingleResponse<null>>(`/pengajuan/${id}`, {
    method: 'DELETE',
  });
}

function buildNomorPengajuan(prefix: 'ADM' | 'INT' | 'EXT'): string {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PGJ-${prefix}-${stamp}-${random}`;
}

export async function submitPengajuanApi(
  data: Omit<PengajuanItem, 'id' | 'diajukanPada' | 'statusPengajuan' | 'isFromAdmin' | 'nomorPengajuan'>,
  isFromAdmin?: boolean,
  source: 'admin' | 'internal' | 'eksternal' = 'internal'
): Promise<PengajuanItem> {
  const prefix: 'ADM' | 'INT' | 'EXT' = source === 'admin' ? 'ADM' : source === 'eksternal' ? 'EXT' : 'INT';

  const payload = {
    nomor_pengajuan: buildNomorPengajuan(prefix),
    nama_pengusul: data.namaPengusul || (source === 'eksternal' ? 'Mitra Eksternal' : 'Internal Polibatam'),
    email_pengusul: data.emailPengusul || null,
    whatsapp_pengusul: data.whatsappPengusul || null,
    judul_pengajuan: data.judulPengajuan,
    deskripsi_pengajuan: data.deskripsiPengajuan || null,
    jenis_dokumen: mapJenisDokumenToApi(data.jenisDokumen),
    mitra_id: data.mitraId ?? null,
    nama_mitra: data.namaMitra,
    unit_prodi_id: data.unitProdiId ?? null,
    kategori_pengajuan: (data.kategoriPengajuan || (source === 'eksternal' ? 'Eksternal' : 'Internal')).toLowerCase(),
    tanggal_mulai: data.tanggalMulai || null,
    tanggal_berakhir: data.tanggalBerakhir || null,
    ruang_lingkup_ids: data.ruangLingkupIds ?? [],
    status_pengajuan: 'menunggu',
  };

  const response = await apiRequest<ApiSingleResponse<ApiPengajuanRow>>('/pengajuan', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const mapped = mapApiPengajuanToItem(response.data);
  mapped.isFromAdmin = Boolean(isFromAdmin);
  mapped.fileName = data.fileName;
  mapped.fileAttachments = data.fileAttachments;
  return mapped;
}

// Data awal dummy yang dipakai saat belum ada data tersimpan.
const defaultPengajuanData: PengajuanItem[] = [
  {
    id: 1,
    nomorPengajuan: 'PGJ-DUMMY-1',
    judulPengajuan: 'Kerja Sama Magang dengan PT Solusi Digital',
    namaPengusul: 'Dr. Ahmad Wijaya',
    diajukanPada: '2026-02-25',
    namaMitra: 'PT Solusi Digital Indonesia',
    jenisDokumen: 'MoA',
    namaUnitProdi: 'Teknik Informatika',
    kategoriPengajuan: 'Eksternal',
    tanggalMulai: '2026-03-01',
    tanggalBerakhir: '2027-03-01',
    ruangLingkupIds: [1, 2],
    ruangLingkup: ['Penelitian', 'Pengabdian Masyarakat'],
    statusPengajuan: 'Menunggu',
  },
  {
    id: 2,
    nomorPengajuan: 'PGJ-DUMMY-2',
    judulPengajuan: 'Penelitian Bersama Universitas Malaysia',
    namaPengusul: 'Dr. Ahmad Wijaya',
    diajukanPada: '2026-02-25',
    namaMitra: 'Universitas Teknologi Malaysia',
    jenisDokumen: 'MoU',
    namaUnitProdi: 'Teknik Informatika',
    kategoriPengajuan: 'Eksternal',
    tanggalMulai: '2026-04-01',
    tanggalBerakhir: '2028-04-01',
    ruangLingkupIds: [1, 3],
    ruangLingkup: ['Penelitian', 'Publikasi Bersama'],
    statusPengajuan: 'Diproses',
  },
  {
    id: 3,
    nomorPengajuan: 'PGJ-DUMMY-3',
    judulPengajuan: 'Pelatihan Kewirausahaan Internal',
    namaPengusul: 'Dr. Ahmad Wijaya',
    diajukanPada: '2026-02-25',
    namaMitra: 'UPT Kerjasama Polibatam',
    jenisDokumen: 'MoU',
    namaUnitProdi: 'Teknik Informatika',
    kategoriPengajuan: 'Internal',
    tanggalMulai: '2026-05-10',
    tanggalBerakhir: '2026-12-10',
    ruangLingkupIds: [4, 5],
    ruangLingkup: ['Pelatihan', 'Pengembangan SDM'],
    statusPengajuan: 'Disetujui',
    reviewComment: 'Dokumen sudah lengkap dan disetujui untuk tindak lanjut.',
    reviewedAt: '2026-03-02',
    reviewedBy: 'Admin SIKERMA',
  },
  {
    id: 4,
    nomorPengajuan: 'PGJ-DUMMY-4',
    judulPengajuan: 'Kolaborasi Riset AI Jurusan TI',
    namaPengusul: 'Siti Rahma',
    diajukanPada: '2026-03-11',
    namaMitra: 'PT Cerdas Data Nusantara',
    jenisDokumen: 'MoA',
    namaUnitProdi: 'Teknik Informatika',
    kategoriPengajuan: 'Internal',
    tanggalMulai: '2026-04-15',
    tanggalBerakhir: '2027-04-15',
    ruangLingkupIds: [1, 3],
    ruangLingkup: ['Penelitian', 'Publikasi Bersama'],
    statusPengajuan: 'Diproses',
    reviewComment: 'Admin sedang memvalidasi dokumen pendukung dan ruang lingkup kerja sama.',
    reviewedAt: '2026-03-14',
    reviewedBy: 'Admin SIKERMA',
  },
  {
    id: 5,
    nomorPengajuan: 'PGJ-DUMMY-5',
    judulPengajuan: 'Program Magang Industri untuk Mahasiswa',
    namaPengusul: 'Andi Saputra',
    diajukanPada: '2026-03-19',
    namaMitra: 'PT Inovasi Batam',
    jenisDokumen: 'IA',
    namaUnitProdi: 'Teknik Elektro',
    kategoriPengajuan: 'Internal',
    tanggalMulai: '2026-06-01',
    tanggalBerakhir: '2026-12-31',
    ruangLingkupIds: [6, 4],
    ruangLingkup: ['Magang', 'Pelatihan'],
    statusPengajuan: 'Menunggu',
  },
  {
    id: 6,
    nomorPengajuan: 'PGJ-DUMMY-6',
    judulPengajuan: 'Pengabdian Masyarakat Bersama Komunitas Digital',
    namaPengusul: 'Nabila Putri',
    diajukanPada: '2026-03-25',
    namaMitra: 'Komunitas Digital Batam',
    jenisDokumen: 'MoU',
    namaUnitProdi: 'Manajemen Bisnis',
    kategoriPengajuan: 'Internal',
    tanggalMulai: '2026-07-01',
    tanggalBerakhir: '2027-01-01',
    ruangLingkupIds: [2, 4],
    ruangLingkup: ['Pengabdian Masyarakat', 'Pelatihan'],
    statusPengajuan: 'Ditolak',
    reviewComment: 'Mohon lengkapi dokumen legal mitra sebelum diajukan ulang.',
    reviewedAt: '2026-03-28',
    reviewedBy: 'Admin SIKERMA',
  },
];

// Cek agar akses localStorage hanya berjalan di browser.
function canUseStorage(): boolean {
  return typeof window !== 'undefined';
}

// Mengirim event agar halaman lain bisa ikut refresh saat data berubah.
function emitPengajuanUpdate() {
  if (canUseStorage()) {
    window.dispatchEvent(new Event('pengajuan-data-updated'));
  }
}

// Simpan list pengajuan terbaru ke localStorage lalu broadcast update.
function savePengajuanData(items: PengajuanItem[]) {
  if (!canUseStorage()) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    emitPengajuanUpdate();
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      // Hapus data lama, lalu coba simpan lagi
      window.localStorage.removeItem(STORAGE_KEY);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        emitPengajuanUpdate();
      } catch {
        alert('Data terlalu besar untuk disimpan. Silakan hubungi admin.');
      }
    } else {
      throw e;
    }
  }
}

// Ambil seluruh data pengajuan, lalu gabungkan dengan data default bila perlu.
export function getPengajuanData(options?: { excludeAdmin?: boolean }): PengajuanItem[] {
  if (!canUseStorage()) {
    return defaultPengajuanData;
  }

  const storedRaw = window.localStorage.getItem(STORAGE_KEY);

  if (!storedRaw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPengajuanData));
    return defaultPengajuanData;
  }

  try {
    const stored = JSON.parse(storedRaw) as PengajuanItem[];

    if (!Array.isArray(stored)) {
      return defaultPengajuanData;
    }

    const merged = [
      ...stored,
      ...defaultPengajuanData.filter((dummy) => !stored.some((item) => item.id === dummy.id)),
    ];
    // Jika diminta excludeAdmin, filter data admin
    if (options?.excludeAdmin) {
      return merged.filter((item) => !item.isFromAdmin);
    }
    return merged;
  } catch {
    return defaultPengajuanData;
  }
}

// Menandai bahwa email pengusul sudah diverifikasi.
export function markPengajuanEmailVerified(id: number): PengajuanItem | null {
  let verifiedItem: PengajuanItem | null = null;

  const updated = getPengajuanData().map((item) => {
    if (item.id !== id) {
      return item;
    }

    verifiedItem = { ...item, emailTerverifikasiPada: new Date().toISOString() };
    return verifiedItem;
  });

  savePengajuanData(updated);

  if (verifiedItem) {
    addAdminNotification({
      title: 'Email Pengusul Terverifikasi',
      message: `Email untuk pengajuan '${verifiedItem.judulPengajuan}' sudah dikonfirmasi aktif.`,
      from: 'Sistem Verifikasi',
      href: '/admin/data_pengajuan',
      category: 'approval',
    });
  }

  return verifiedItem;
}

// Update status hasil review pengajuan dan kirim notifikasi otomatis.
export function updatePengajuanStatus(
  id: number,
  status: PengajuanStatus,
  comment?: string
): PengajuanItem[] {
  let updatedItem: PengajuanItem | undefined;

  const updated = getPengajuanData().map((item) => {
    if (item.id !== id) {
      return item;
    }

    updatedItem = {
      ...item,
      statusPengajuan: status,
      reviewComment: comment?.trim() || undefined,
      reviewedAt: new Date().toISOString().slice(0, 10),
      reviewedBy: 'Admin SIKERMA',
    };
    return updatedItem;
  });

  savePengajuanData(updated);

  if (updatedItem && status === 'Disetujui') {
    initAktivitasOnApproval(
      updatedItem.id,
      updatedItem.namaMitra,
      updatedItem.reviewedAt ?? new Date().toISOString().slice(0, 10)
    );
  }

  if (updatedItem) {
    addAdminNotification({
      title: status === 'Disetujui' ? 'Pengajuan Disetujui' : status === 'Ditolak' ? 'Pengajuan Ditolak' : 'Status Pengajuan Diperbarui',
      message: comment?.trim()
        ? `${updatedItem.judulPengajuan} diperbarui menjadi ${status}. Catatan: ${comment}`
        : `${updatedItem.judulPengajuan} diperbarui menjadi ${status}.`,
      from: 'Admin SIKERMA',
      href: '/admin/data_pengajuan',
      category: status === 'Ditolak' ? 'reminder' : 'approval',
    });
  }

  return updated;
}

// Hitung ringkasan jumlah pengajuan berdasarkan status.
export function getPengajuanStats(items: PengajuanItem[]) {
  return {
    totalPengajuan: items.length,
    menunggu: items.filter((item) => item.statusPengajuan === 'Menunggu').length,
    diproses: items.filter((item) => item.statusPengajuan === 'Diproses').length,
    disetujui: items.filter((item) => item.statusPengajuan === 'Disetujui').length,
  };
}

// Ambil daftar tahun unik dari data pengajuan untuk isi dropdown filter.
export function getPengajuanYearOptions(items: PengajuanItem[]): string[] {
  return Array.from(new Set(items.map((item) => item.diajukanPada.slice(0, 4))))
    .filter(Boolean)
    .sort((a, b) => Number(b) - Number(a));
}

// Shortcut untuk proses review dari halaman admin.
export function savePengajuanReview(id: number, status: PengajuanStatus, comment = ''): PengajuanItem[] {
  return updatePengajuanStatus(id, status, comment);
}

// Mengubah data pengajuan tertentu dari halaman admin.
export function updatePengajuanItem(
  id: number,
  updates: Partial<Omit<PengajuanItem, 'id' | 'diajukanPada'>>
): PengajuanItem[] {
  let updatedItem: PengajuanItem | null = null;

  const updated = getPengajuanData().map((item) => {
    if (item.id !== id) {
      return item;
    }

    updatedItem = {
      ...item,
      ...updates,
      id: item.id,
      diajukanPada: item.diajukanPada,
    };

    return updatedItem;
  });

  savePengajuanData(updated);

  if (updatedItem) {
    upsertRekapFromPengajuan({
      id: updatedItem.id,
      namaMitra: updatedItem.namaMitra,
      jenisDokumen: updatedItem.jenisDokumen,
      namaUnitProdi: updatedItem.namaUnitProdi,
      tanggalMulai: updatedItem.tanggalMulai,
      tanggalBerakhir: updatedItem.tanggalBerakhir,
      whatsappPengusul: updatedItem.whatsappPengusul,
    });

    upsertMonitoringFromPengajuan({
      id: updatedItem.id,
      namaMitra: updatedItem.namaMitra,
      jenisDokumen: updatedItem.jenisDokumen,
      tanggalMulai: updatedItem.tanggalMulai,
      tanggalBerakhir: updatedItem.tanggalBerakhir,
      ruangLingkup: updatedItem.ruangLingkup,
      whatsappPengusul: updatedItem.whatsappPengusul,
      emailPengusul: updatedItem.emailPengusul,
    });
  }

  return updated;
}

// Terapkan tanggal perpanjangan yang telah disetujui ke item pengajuan terkait.
// Fungsi ini hanya update localStorage pengajuan tanpa cascade ke monitoring/rekap
// karena keduanya sudah ditangani secara terpisah di halaman perpanjangan.
export function applyApprovedRenewalToPengajuan(
  kerjasamaId: number,
  tanggalMulaiBaru: string,
  tanggalBerakhirBaru: string
): PengajuanItem[] {
  const updated = getPengajuanData().map((item) => {
    if (item.id !== kerjasamaId) {
      return item;
    }

    return {
      ...item,
      tanggalMulai: tanggalMulaiBaru,
      tanggalBerakhir: tanggalBerakhirBaru,
    };
  });

  savePengajuanData(updated);
  return updated;
}

// Menghapus satu data pengajuan dari daftar.
export function deletePengajuanItem(id: number): PengajuanItem[] {
  const current = getPengajuanData();
  const removed = current.find((item) => item.id === id);
  const updated = current.filter((item) => item.id !== id);

  savePengajuanData(updated);
  removeRekapByPengajuanId(id);
  removeMonitoringByPengajuanId(id);
  hideStoryByPengajuanId(id);

  if (removed) {
    addAdminNotification({
      title: 'Pengajuan Dihapus',
      message: `Pengajuan '${removed.judulPengajuan}' telah dihapus dari daftar admin.`,
      from: 'Admin SIKERMA',
      href: '/admin/data_pengajuan',
      category: 'reminder',
    });
  }

  return updated;
}

function getKategoriPengajuan(item: PengajuanItem): 'Internal' | 'Eksternal' {
  if (item.kategoriPengajuan) {
    return item.kategoriPengajuan;
  }

  const source = `${item.namaMitra} ${item.namaUnitProdi}`.toLowerCase();
  return source.includes('polibatam') || source.includes('upt') ? 'Internal' : 'Eksternal';
}

// Filter data berdasarkan status, kategori/jurusan, dan kata kunci pencarian.
export function filterPengajuanData(
  items: PengajuanItem[],
  filterStatus: string,
  filterJurusan: string,
  search: string,
  options?: { excludeAdmin?: boolean }
) {
  return items.filter((item) => {
    // Selalu exclude data admin jika diminta
    if (options?.excludeAdmin && item.isFromAdmin) {
      return false;
    }

    // HANYA filter data admin jika memang untuk view internal (excludeAdmin true)
    // Di halaman admin, data admin harus tetap muncul

    const matchStatus = filterStatus === 'Semua Status' || item.statusPengajuan === filterStatus;
    const matchJurusan =
      filterJurusan === 'Semua Jurusan/unit' ||
      filterJurusan === 'Semua Ruang Kerjasama' ||
      filterJurusan === 'Semua Kategori Kerjasama' ||
      item.namaUnitProdi === filterJurusan ||
      getKategoriPengajuan(item) === filterJurusan;
    const keyword = search.toLowerCase().trim();
    const kategori = getKategoriPengajuan(item).toLowerCase();
    const ruangLingkupText = item.ruangLingkup.join(' ').toLowerCase();
    const matchSearch =
      keyword === '' ||
      item.namaMitra.toLowerCase().includes(keyword) ||
      item.judulPengajuan.toLowerCase().includes(keyword) ||
      item.namaPengusul.toLowerCase().includes(keyword) ||
      item.namaUnitProdi.toLowerCase().includes(keyword) ||
      item.jenisDokumen.toLowerCase().includes(keyword) ||
      kategori.includes(keyword) ||
      ruangLingkupText.includes(keyword);

    return matchStatus && matchJurusan && matchSearch;
  });
}

// Filter lanjutan yang juga memperhitungkan pilihan tahun.
export function getFilteredPengajuanData(items: PengajuanItem[], filters: PengajuanFilterOptions, options?: { excludeAdmin?: boolean }) {
  const filtered = filterPengajuanData(items, filters.filterStatus, filters.filterJurusan, filters.search, options);

  if (filters.filterTahun === 'Semua Tahun') {
    return filtered;
  }

  return filtered.filter((item) => item.diajukanPada.startsWith(filters.filterTahun));
}
