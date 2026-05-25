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

// Tipe utama untuk satu data pengajuan kerjasama.
export interface PengajuanItem {
  id: number;
  judul: string;
  deskripsi?: string;
  pengusul: string;
  tanggal: string;
  mitra: string;
  jenisDokumen: string;
  jurusan: string;
  kategori?: 'Internal' | 'Eksternal';
  tanggalMulai?: string;
  tanggalBerakhir?: string;
  emailPengusul?: string;
  whatsappPengusul?: string;
  alamatMitra?: string;
  negara?: string;
  emailTerverifikasi?: boolean;
  ruangLingkup: string[];
  status: PengajuanStatus;
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
  mitra?: { id: number; nama_mitra: string } | string | null;
  // Legacy schema keys (from recent pulled backend)
  judul?: string;
  deskripsi?: string | null;
  pengusul?: string;
  tanggal?: string | null;
  mitra_nama?: string | null;
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
  const tanggal = tanggalRaw ? tanggalRaw.slice(0, 10) : new Date().toISOString().slice(0, 10);
  const statusApi = row.status_pengajuan || row.status || 'menunggu';

  const mitraNama =
    (typeof row.mitra === 'string' ? row.mitra : row.mitra?.nama_mitra) ||
    row.mitra_nama ||
    '-';

  return {
    id: row.id,
    judul: row.judul_pengajuan || row.judul || '-',
    deskripsi: (row.deskripsi_pengajuan ?? row.deskripsi) || undefined,
    pengusul: row.nama_pengusul || row.pengusul || '-',
    tanggal,
    mitra: mitraNama,
    jenisDokumen: mapJenisDokumenFromApi(row.jenis_dokumen),
    jurusan: row.unit_prodi?.nama || row.jurusan || '-',
    kategori:
      row.kategori === 'Internal' || row.kategori === 'Eksternal'
        ? row.kategori
        : row.kategori_pengajuan === 'internal'
          ? 'Internal'
          : 'Eksternal',
    tanggalMulai: row.tanggal_mulai ?? undefined,
    tanggalBerakhir: row.tanggal_berakhir ?? undefined,
    emailPengusul: row.email_pengusul ?? undefined,
    whatsappPengusul: row.whatsapp_pengusul ?? undefined,
    ruangLingkup: Array.isArray(row.ruang_lingkup)
      ? row.ruang_lingkup
      : (row.ruang_lingkup_ids ?? []).map((id) => `RL-${id}`),
    status: mapStatusFromApi(statusApi),
  };
}

export async function fetchPengajuanDataFromApi(filters?: {
  search?: string;
  status?: string;
  jenisDokumen?: string;
  perPage?: number;
}): Promise<PengajuanItem[]> {
  const params = new URLSearchParams();
  params.set('per_page', String(filters?.perPage ?? 500));
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
  updates: Partial<Omit<PengajuanItem, 'id' | 'tanggal'>> & {
    unitProdiId?: number | null;
  }
): Promise<PengajuanItem> {
  const payload: Record<string, unknown> = {};
  if (typeof updates.judul === 'string') payload.judul_pengajuan = updates.judul;
  if (typeof updates.judul === 'string') payload.judul = updates.judul;
  if (typeof updates.deskripsi === 'string') payload.deskripsi_pengajuan = updates.deskripsi;
  if (typeof updates.deskripsi === 'string') payload.deskripsi = updates.deskripsi;
  if (typeof updates.pengusul === 'string') payload.nama_pengusul = updates.pengusul;
  if (typeof updates.pengusul === 'string') payload.pengusul = updates.pengusul;
  if (typeof updates.emailPengusul === 'string') payload.email_pengusul = updates.emailPengusul;
  if (typeof updates.whatsappPengusul === 'string') payload.whatsapp_pengusul = updates.whatsappPengusul;
  if (updates.unitProdiId !== undefined) payload.unit_prodi_id = updates.unitProdiId;
  if (typeof updates.jenisDokumen === 'string') payload.jenis_dokumen = mapJenisDokumenToApi(updates.jenisDokumen);
  if (typeof updates.tanggalMulai === 'string') payload.tanggal_mulai = updates.tanggalMulai;
  if (typeof updates.tanggalBerakhir === 'string') payload.tanggal_berakhir = updates.tanggalBerakhir;
  if (typeof updates.status === 'string') payload.status_pengajuan = mapStatusToApi(updates.status);
  if (typeof updates.status === 'string') payload.status = mapStatusToApi(updates.status);

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
  data: Omit<PengajuanItem, 'id' | 'tanggal' | 'status' | 'isFromAdmin'> & {
    unitProdiId?: number | null;
  },
  isFromAdmin?: boolean,
  source: 'admin' | 'internal' | 'eksternal' = 'internal'
): Promise<PengajuanItem> {
  const prefix: 'ADM' | 'INT' | 'EXT' = source === 'admin' ? 'ADM' : source === 'eksternal' ? 'EXT' : 'INT';

  const payload = {
    nomor_pengajuan: buildNomorPengajuan(prefix),
    nama_pengusul: data.pengusul || (source === 'eksternal' ? 'Mitra Eksternal' : 'Internal Polibatam'),
    pengusul: data.pengusul || (source === 'eksternal' ? 'Mitra Eksternal' : 'Internal Polibatam'),
    email_pengusul: data.emailPengusul || null,
    whatsapp_pengusul: data.whatsappPengusul || null,
    judul_pengajuan: data.judul,
    judul: data.judul,
    deskripsi_pengajuan: data.deskripsi || null,
    deskripsi: data.deskripsi || null,
    jenis_dokumen: mapJenisDokumenToApi(data.jenisDokumen),
    mitra: data.mitra,
    jurusan: data.jurusan,
    unit_prodi_id: data.unitProdiId ?? null,
    kategori: data.kategori || (source === 'eksternal' ? 'Eksternal' : 'Internal'),
    kategori_pengajuan: (data.kategori || (source === 'eksternal' ? 'Eksternal' : 'Internal')).toLowerCase(),
    tanggal: new Date().toISOString().slice(0, 10),
    tanggal_mulai: data.tanggalMulai || null,
    tanggal_berakhir: data.tanggalBerakhir || null,
    ruang_lingkup: data.ruangLingkup,
    ruang_lingkup_ids: [],
    status: 'menunggu',
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
    judul: 'Kerja Sama Magang dengan PT Solusi Digital',
    pengusul: 'Dr. Ahmad Wijaya',
    tanggal: '2026-02-25',
    mitra: 'PT Solusi Digital Indonesia',
    jenisDokumen: 'MoA',
    jurusan: 'Teknik Informatika',
    kategori: 'Eksternal',
    tanggalMulai: '2026-03-01',
    tanggalBerakhir: '2027-03-01',
    ruangLingkup: ['Penelitian', 'Pengabdian Masyarakat'],
    status: 'Menunggu',
  },
  {
    id: 2,
    judul: 'Penelitian Bersama Universitas Malaysia',
    pengusul: 'Dr. Ahmad Wijaya',
    tanggal: '2026-02-25',
    mitra: 'Universitas Teknologi Malaysia',
    jenisDokumen: 'MoU',
    jurusan: 'Teknik Informatika',
    kategori: 'Eksternal',
    tanggalMulai: '2026-04-01',
    tanggalBerakhir: '2028-04-01',
    ruangLingkup: ['Penelitian', 'Publikasi Bersama'],
    status: 'Diproses',
  },
  {
    id: 3,
    judul: 'Pelatihan Kewirausahaan Internal',
    pengusul: 'Dr. Ahmad Wijaya',
    tanggal: '2026-02-25',
    mitra: 'UPT Kerjasama Polibatam',
    jenisDokumen: 'MoU',
    jurusan: 'Teknik Informatika',
    kategori: 'Internal',
    tanggalMulai: '2026-05-10',
    tanggalBerakhir: '2026-12-10',
    ruangLingkup: ['Pelatihan', 'Pengembangan SDM'],
    status: 'Disetujui',
    reviewComment: 'Dokumen sudah lengkap dan disetujui untuk tindak lanjut.',
    reviewedAt: '2026-03-02',
    reviewedBy: 'Admin SIKERMA',
  },
  {
    id: 4,
    judul: 'Kolaborasi Riset AI Jurusan TI',
    pengusul: 'Siti Rahma',
    tanggal: '2026-03-11',
    mitra: 'PT Cerdas Data Nusantara',
    jenisDokumen: 'MoA',
    jurusan: 'Teknik Informatika',
    kategori: 'Internal',
    tanggalMulai: '2026-04-15',
    tanggalBerakhir: '2027-04-15',
    ruangLingkup: ['Penelitian', 'Publikasi Bersama'],
    status: 'Diproses',
    reviewComment: 'Admin sedang memvalidasi dokumen pendukung dan ruang lingkup kerja sama.',
    reviewedAt: '2026-03-14',
    reviewedBy: 'Admin SIKERMA',
  },
  {
    id: 5,
    judul: 'Program Magang Industri untuk Mahasiswa',
    pengusul: 'Andi Saputra',
    tanggal: '2026-03-19',
    mitra: 'PT Inovasi Batam',
    jenisDokumen: 'IA',
    jurusan: 'Teknik Elektro',
    kategori: 'Internal',
    tanggalMulai: '2026-06-01',
    tanggalBerakhir: '2026-12-31',
    ruangLingkup: ['Magang', 'Pelatihan'],
    status: 'Menunggu',
  },
  {
    id: 6,
    judul: 'Pengabdian Masyarakat Bersama Komunitas Digital',
    pengusul: 'Nabila Putri',
    tanggal: '2026-03-25',
    mitra: 'Komunitas Digital Batam',
    jenisDokumen: 'MoU',
    jurusan: 'Manajemen Bisnis',
    kategori: 'Internal',
    tanggalMulai: '2026-07-01',
    tanggalBerakhir: '2027-01-01',
    ruangLingkup: ['Pengabdian Masyarakat', 'Pelatihan'],
    status: 'Ditolak',
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

    verifiedItem = { ...item, emailTerverifikasi: true };
    return verifiedItem;
  });

  savePengajuanData(updated);

  if (verifiedItem) {
    addAdminNotification({
      title: 'Email Pengusul Terverifikasi',
      message: `Email untuk pengajuan '${verifiedItem.judul}' sudah dikonfirmasi aktif.`,
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
      status,
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
      updatedItem.mitra,
      updatedItem.reviewedAt ?? new Date().toISOString().slice(0, 10)
    );
  }

  if (updatedItem) {
    addAdminNotification({
      title: status === 'Disetujui' ? 'Pengajuan Disetujui' : status === 'Ditolak' ? 'Pengajuan Ditolak' : 'Status Pengajuan Diperbarui',
      message: comment?.trim()
        ? `${updatedItem.judul} diperbarui menjadi ${status}. Catatan: ${comment}`
        : `${updatedItem.judul} diperbarui menjadi ${status}.`,
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
    menunggu: items.filter((item) => item.status === 'Menunggu').length,
    diproses: items.filter((item) => item.status === 'Diproses').length,
    disetujui: items.filter((item) => item.status === 'Disetujui').length,
  };
}

// Ambil daftar tahun unik dari data pengajuan untuk isi dropdown filter.
export function getPengajuanYearOptions(items: PengajuanItem[]): string[] {
  return Array.from(new Set(items.map((item) => item.tanggal.slice(0, 4))))
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
  updates: Partial<Omit<PengajuanItem, 'id' | 'tanggal'>>
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
      tanggal: item.tanggal,
    };

    return updatedItem;
  });

  savePengajuanData(updated);

  if (updatedItem) {
    upsertRekapFromPengajuan({
      id: updatedItem.id,
      mitra: updatedItem.mitra,
      jenisDokumen: updatedItem.jenisDokumen,
      jurusan: updatedItem.jurusan,
      tanggalMulai: updatedItem.tanggalMulai,
      tanggalBerakhir: updatedItem.tanggalBerakhir,
      whatsappPengusul: updatedItem.whatsappPengusul,
    });

    upsertMonitoringFromPengajuan({
      id: updatedItem.id,
      mitra: updatedItem.mitra,
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
      message: `Pengajuan '${removed.judul}' telah dihapus dari daftar admin.`,
      from: 'Admin SIKERMA',
      href: '/admin/data_pengajuan',
      category: 'reminder',
    });
  }

  return updated;
}

function getKategoriPengajuan(item: PengajuanItem): 'Internal' | 'Eksternal' {
  if (item.kategori) {
    return item.kategori;
  }

  const source = `${item.mitra} ${item.jurusan}`.toLowerCase();
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

    const matchStatus = filterStatus === 'Semua Status' || item.status === filterStatus;
    const matchJurusan =
      filterJurusan === 'Semua Jurusan/unit' ||
      filterJurusan === 'Semua Ruang Kerjasama' ||
      filterJurusan === 'Semua Kategori Kerjasama' ||
      item.jurusan === filterJurusan ||
      getKategoriPengajuan(item) === filterJurusan;
    const keyword = search.toLowerCase().trim();
    const kategori = getKategoriPengajuan(item).toLowerCase();
    const ruangLingkupText = item.ruangLingkup.join(' ').toLowerCase();
    const matchSearch =
      keyword === '' ||
      item.mitra.toLowerCase().includes(keyword) ||
      item.judul.toLowerCase().includes(keyword) ||
      item.pengusul.toLowerCase().includes(keyword) ||
      item.jurusan.toLowerCase().includes(keyword) ||
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

  return filtered.filter((item) => item.tanggal.startsWith(filters.filterTahun));
}
