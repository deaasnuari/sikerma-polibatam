import { apiRequest } from '@/lib/api';
import { addAdminNotification } from '@/services/adminService';
import { removeMonitoringByPengajuanId, upsertMonitoringFromPengajuan } from '@/services/adminMonitoringService';
import { removeRekapByPengajuanId, upsertRekapFromPengajuan } from '@/services/adminRekapDataService';
import { hideStoryByPengajuanId, initAktivitasOnApproval } from '@/services/adminStoryAktivitasService';

export type PengajuanStatus = 'Menunggu' | 'Diproses' | 'Disetujui' | 'Ditolak';

export type PengajuanFileAttachment = {
  name: string;
  url: string;
  type?: string;
  size?: number;
};

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

const STORAGE_KEY = 'pengajuanKerjasamaData';
const CACHE_VERSION_KEY = 'pengajuanKerjasamaDataCacheVersion';
const CACHE_VERSION = '2';
const LEGACY_STORAGE_KEYS = ['pengajuanKerjasamaDataInternal'];

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

const defaultPengajuanData: PengajuanItem[] = [];

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

interface ApiPengajuan {
  id: number;
  judul: string;
  deskripsi?: string | null;
  pengusul: string;
  tanggal: string;
  mitra: string;
  jenis_dokumen: string;
  jurusan: string;
  kategori?: 'Internal' | 'Eksternal' | null;
  tanggal_mulai?: string | null;
  tanggal_berakhir?: string | null;
  email_pengusul?: string | null;
  whatsapp_pengusul?: string | null;
  alamat_mitra?: string | null;
  negara?: string | null;
  email_terverifikasi?: boolean;
  ruang_lingkup?: string[] | null;
  status: 'menunggu' | 'diproses' | 'disetujui' | 'ditolak';
  file_name?: string | null;
  file_attachments?: PengajuanFileAttachment[] | null;
  review_comment?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  is_from_admin?: boolean;
  source_role?: string | null;
}

let isSyncing = false;
let lastSyncAt = 0;

function canUseStorage(): boolean {
  return typeof window !== 'undefined';
}

function emitPengajuanUpdate() {
  if (canUseStorage()) {
    window.dispatchEvent(new Event('pengajuan-data-updated'));
  }
}

function migratePengajuanCacheIfNeeded() {
  if (!canUseStorage()) {
    return;
  }

  const currentVersion = window.localStorage.getItem(CACHE_VERSION_KEY);
  if (currentVersion === CACHE_VERSION) {
    return;
  }

  // One-time cleanup to remove stale legacy/dummy cache from older releases.
  window.localStorage.removeItem(STORAGE_KEY);
  LEGACY_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
  window.localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
}

function normalizeStatusFromApi(status: ApiPengajuan['status']): PengajuanStatus {
  switch (status) {
    case 'diproses':
      return 'Diproses';
    case 'disetujui':
      return 'Disetujui';
    case 'ditolak':
      return 'Ditolak';
    case 'menunggu':
    default:
      return 'Menunggu';
  }
}

function normalizeStatusToApi(status: PengajuanStatus): ApiPengajuan['status'] {
  switch (status) {
    case 'Diproses':
      return 'diproses';
    case 'Disetujui':
      return 'disetujui';
    case 'Ditolak':
      return 'ditolak';
    case 'Menunggu':
    default:
      return 'menunggu';
  }
}

function toUiItem(item: ApiPengajuan): PengajuanItem {
  return {
    id: Number(item.id),
    judul: item.judul,
    deskripsi: item.deskripsi || undefined,
    pengusul: item.pengusul,
    tanggal: item.tanggal,
    mitra: item.mitra,
    jenisDokumen: item.jenis_dokumen,
    jurusan: item.jurusan,
    kategori: item.kategori || undefined,
    tanggalMulai: item.tanggal_mulai || undefined,
    tanggalBerakhir: item.tanggal_berakhir || undefined,
    emailPengusul: item.email_pengusul || undefined,
    whatsappPengusul: item.whatsapp_pengusul || undefined,
    alamatMitra: item.alamat_mitra || undefined,
    negara: item.negara || undefined,
    emailTerverifikasi: Boolean(item.email_terverifikasi),
    ruangLingkup: Array.isArray(item.ruang_lingkup) ? item.ruang_lingkup : [],
    status: normalizeStatusFromApi(item.status),
    fileName: item.file_name || undefined,
    fileAttachments: Array.isArray(item.file_attachments) ? item.file_attachments : undefined,
    reviewComment: item.review_comment || undefined,
    reviewedAt: item.reviewed_at || undefined,
    reviewedBy: item.reviewed_by || undefined,
    isFromAdmin: Boolean(item.is_from_admin),
  };
}

function toApiPayload(item: Partial<PengajuanItem> & { status?: PengajuanStatus }) {
  return {
    judul: item.judul,
    deskripsi: item.deskripsi,
    pengusul: item.pengusul,
    tanggal: item.tanggal,
    mitra: item.mitra,
    jenis_dokumen: item.jenisDokumen,
    jurusan: item.jurusan,
    kategori: item.kategori,
    tanggal_mulai: item.tanggalMulai,
    tanggal_berakhir: item.tanggalBerakhir,
    email_pengusul: item.emailPengusul,
    whatsapp_pengusul: item.whatsappPengusul,
    alamat_mitra: item.alamatMitra,
    negara: item.negara,
    email_terverifikasi: item.emailTerverifikasi,
    ruang_lingkup: item.ruangLingkup,
    status: item.status ? normalizeStatusToApi(item.status) : undefined,
    file_name: item.fileName,
    file_attachments: item.fileAttachments,
    review_comment: item.reviewComment,
    reviewed_at: item.reviewedAt,
    reviewed_by: item.reviewedBy,
    is_from_admin: item.isFromAdmin,
  };
}

function readCachedPengajuan(): PengajuanItem[] {
  if (!canUseStorage()) {
    return defaultPengajuanData;
  }

  migratePengajuanCacheIfNeeded();

  const storedRaw = window.localStorage.getItem(STORAGE_KEY);
  if (!storedRaw) {
    return defaultPengajuanData;
  }

  try {
    const parsed = JSON.parse(storedRaw) as PengajuanItem[];
    return Array.isArray(parsed) ? parsed : defaultPengajuanData;
  } catch {
    return defaultPengajuanData;
  }
}

function savePengajuanData(items: PengajuanItem[]) {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    emitPengajuanUpdate();
  } catch {
    // Ignore storage write failures to avoid breaking UI actions.
  }
}

async function fetchPengajuanFromApi(): Promise<PengajuanItem[]> {
  const response = await apiRequest<ApiResponse<ApiPengajuan[]>>('/pengajuan');
  const rows = Array.isArray(response.data) ? response.data : [];
  return rows.map(toUiItem);
}

function syncDerivedStores(item: PengajuanItem) {
  upsertRekapFromPengajuan({
    id: item.id,
    mitra: item.mitra,
    jenisDokumen: item.jenisDokumen,
    jurusan: item.jurusan,
    tanggalMulai: item.tanggalMulai,
    tanggalBerakhir: item.tanggalBerakhir,
    whatsappPengusul: item.whatsappPengusul,
  });

  upsertMonitoringFromPengajuan({
    id: item.id,
    judul: item.judul,
    mitra: item.mitra,
    jenisDokumen: item.jenisDokumen,
    tanggalMulai: item.tanggalMulai,
    tanggalBerakhir: item.tanggalBerakhir,
    ruangLingkup: item.ruangLingkup,
    whatsappPengusul: item.whatsappPengusul,
    emailPengusul: item.emailPengusul,
  });
}

export async function refreshPengajuanDataFromApi(force = false): Promise<PengajuanItem[]> {
  if (!canUseStorage()) {
    return defaultPengajuanData;
  }

  if (isSyncing && !force) {
    return readCachedPengajuan();
  }

  if (!force && Date.now() - lastSyncAt < 4000) {
    return readCachedPengajuan();
  }

  isSyncing = true;

  try {
    const apiItems = await fetchPengajuanFromApi();
    savePengajuanData(apiItems);
    lastSyncAt = Date.now();

    apiItems.forEach((item) => {
      syncDerivedStores(item);
    });

    return apiItems;
  } catch {
    return readCachedPengajuan();
  } finally {
    isSyncing = false;
  }
}

function scheduleBackgroundSync() {
  void refreshPengajuanDataFromApi(false);
}

function replaceById(items: PengajuanItem[], id: number, nextItem: PengajuanItem) {
  return items.map((item) => (item.id === id ? nextItem : item));
}

export function getPengajuanData(options?: { excludeAdmin?: boolean }): PengajuanItem[] {
  const data = readCachedPengajuan();
  scheduleBackgroundSync();

  if (options?.excludeAdmin) {
    return data.filter((item) => !item.isFromAdmin);
  }

  return data;
}

export async function submitPengajuan(
  data: Omit<PengajuanItem, 'id' | 'tanggal' | 'status' | 'isFromAdmin'>,
  isFromAdmin?: boolean,
  sourceRole?: 'admin' | 'internal' | 'eksternal' | 'pimpinan'
): Promise<PengajuanItem> {
  const response = await apiRequest<ApiResponse<ApiPengajuan>>('/pengajuan', {
    method: 'POST',
    body: JSON.stringify({
      ...toApiPayload({
        ...data,
        status: 'Menunggu',
        emailTerverifikasi: false,
        isFromAdmin: Boolean(isFromAdmin),
      }),
      source_role: sourceRole,
    }),
  });

  const persisted = toUiItem(response.data);
  const current = readCachedPengajuan();
  const nextItems = [persisted, ...current.filter((item) => item.id !== persisted.id)];
  savePengajuanData(nextItems);
  syncDerivedStores(persisted);

  addAdminNotification({
    title: 'Pengajuan Baru Masuk',
    message: persisted.emailPengusul
      ? `Pengajuan '${persisted.judul}' berhasil dikirim oleh ${persisted.emailPengusul} dan langsung masuk ke daftar review admin.`
      : `Pengajuan '${persisted.judul}' berhasil dikirim dan menunggu review.`,
    from: persisted.pengusul,
    href: '/admin/data_pengajuan',
    category: 'info',
  });

  return persisted;
}

export async function markPengajuanEmailVerified(id: number): Promise<PengajuanItem | null> {
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

    const response = await apiRequest<ApiResponse<ApiPengajuan>>(`/pengajuan/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ email_terverifikasi: true }),
    });

    const persisted = toUiItem(response.data);
    const next = replaceById(readCachedPengajuan(), id, persisted);
    savePengajuanData(next);
    return persisted;
  }

  return verifiedItem;
}

export async function updatePengajuanStatus(
  id: number,
  status: PengajuanStatus,
  comment?: string
): Promise<PengajuanItem[]> {
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

    const response = await apiRequest<ApiResponse<ApiPengajuan>>(`/pengajuan/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: normalizeStatusToApi(status),
        review_comment: comment?.trim() || null,
        reviewed_at: updatedItem.reviewedAt,
        reviewed_by: updatedItem.reviewedBy,
      }),
    });

    const persisted = toUiItem(response.data);
    const next = replaceById(readCachedPengajuan(), id, persisted);
    savePengajuanData(next);
    return next;
  }

  return updated;
}

export function getPengajuanStats(items: PengajuanItem[]) {
  return {
    totalPengajuan: items.length,
    menunggu: items.filter((item) => item.status === 'Menunggu').length,
    diproses: items.filter((item) => item.status === 'Diproses').length,
    disetujui: items.filter((item) => item.status === 'Disetujui').length,
  };
}

export function getPengajuanYearOptions(items: PengajuanItem[]): string[] {
  return Array.from(new Set(items.map((item) => item.tanggal.slice(0, 4))))
    .filter(Boolean)
    .sort((a, b) => Number(b) - Number(a));
}

export async function savePengajuanReview(id: number, status: PengajuanStatus, comment = ''): Promise<PengajuanItem[]> {
  return updatePengajuanStatus(id, status, comment);
}

export async function updatePengajuanItem(
  id: number,
  updates: Partial<Omit<PengajuanItem, 'id' | 'tanggal'>>
): Promise<PengajuanItem[]> {
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
    syncDerivedStores(updatedItem);

    const response = await apiRequest<ApiResponse<ApiPengajuan>>(`/pengajuan/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toApiPayload(updatedItem)),
    });

    const persisted = toUiItem(response.data);
    const next = replaceById(readCachedPengajuan(), id, persisted);
    savePengajuanData(next);
    syncDerivedStores(persisted);
    return next;
  }

  return updated;
}

export async function applyApprovedRenewalToPengajuan(
  kerjasamaId: number,
  tanggalMulaiBaru: string,
  tanggalBerakhirBaru: string
): Promise<PengajuanItem[]> {
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

  await apiRequest<ApiResponse<ApiPengajuan>>(`/pengajuan/${kerjasamaId}`, {
    method: 'PUT',
    body: JSON.stringify({
      tanggal_mulai: tanggalMulaiBaru,
      tanggal_berakhir: tanggalBerakhirBaru,
    }),
  });

  return updated;
}

export async function deletePengajuanItem(id: number): Promise<PengajuanItem[]> {
  const current = getPengajuanData();
  const removed = current.find((item) => item.id === id);

  if (removed) {
    await apiRequest<ApiResponse<null>>(`/pengajuan/${id}`, {
      method: 'DELETE',
    });

    const updated = current.filter((item) => item.id !== id);
    savePengajuanData(updated);
    removeRekapByPengajuanId(id);
    removeMonitoringByPengajuanId(id);
    hideStoryByPengajuanId(id);

    addAdminNotification({
      title: 'Pengajuan Dihapus',
      message: `Pengajuan '${removed.judul}' telah dihapus dari daftar admin.`,
      from: 'Admin SIKERMA',
      href: '/admin/data_pengajuan',
      category: 'reminder',
    });

    return updated;
  }

  return current;
}

function getKategoriPengajuan(item: PengajuanItem): 'Internal' | 'Eksternal' {
  if (item.kategori) {
    return item.kategori;
  }

  const source = `${item.mitra} ${item.jurusan}`.toLowerCase();
  return source.includes('polibatam') || source.includes('upt') ? 'Internal' : 'Eksternal';
}

export function filterPengajuanData(
  items: PengajuanItem[],
  filterStatus: string,
  filterJurusan: string,
  search: string,
  options?: { excludeAdmin?: boolean }
) {
  return items.filter((item) => {
    if (options?.excludeAdmin && item.isFromAdmin) {
      return false;
    }

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

export function getFilteredPengajuanData(items: PengajuanItem[], filters: PengajuanFilterOptions, options?: { excludeAdmin?: boolean }) {
  const filtered = filterPengajuanData(items, filters.filterStatus, filters.filterJurusan, filters.search, options);

  if (filters.filterTahun === 'Semua Tahun') {
    return filtered;
  }

  return filtered.filter((item) => item.tanggal.startsWith(filters.filterTahun));
}
