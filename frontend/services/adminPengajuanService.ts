import { addAdminNotification } from '@/services/adminService';

export type PengajuanStatus = 'Menunggu' | 'Diproses' | 'Disetujui' | 'Ditolak';

// Tipe utama untuk satu data pengajuan kerjasama.
export interface PengajuanItem {
  id: number;
  judul: string;
  pengusul: string;
  tanggal: string;
  mitra: string;
  jenisDokumen: string;
  jurusan: string;
  kategori?: 'Internal' | 'Eksternal';
  emailPengusul?: string;
  whatsappPengusul?: string;
  emailTerverifikasi?: boolean;
  ruangLingkup: string[];
  status: PengajuanStatus;
  fileName?: string;
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
    ruangLingkup: ['Pelatihan', 'Pengembangan SDM'],
    status: 'Disetujui',
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

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  emitPengajuanUpdate();
}

// Ambil seluruh data pengajuan, lalu gabungkan dengan data default bila perlu.
export function getPengajuanData(): PengajuanItem[] {
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

    return merged;
  } catch {
    return defaultPengajuanData;
  }
}

// Membuat pengajuan baru dari form lalu menambahkan notifikasi ke admin.
export function submitPengajuan(data: Omit<PengajuanItem, 'id' | 'tanggal' | 'status'>): PengajuanItem {
  const payload: PengajuanItem = {
    ...data,
    id: Date.now(),
    tanggal: new Date().toISOString().slice(0, 10),
    status: 'Menunggu',
    emailTerverifikasi: false,
  };

  const updated = [payload, ...getPengajuanData()];
  savePengajuanData(updated);

  addAdminNotification({
    title: 'Pengajuan Baru Masuk',
    message: payload.emailPengusul
      ? `Pengajuan '${payload.judul}' berhasil dikirim oleh ${payload.emailPengusul} dan langsung masuk ke daftar review admin.`
      : `Pengajuan '${payload.judul}' berhasil dikirim dan menunggu review.`,
    from: payload.pengusul,
    href: '/admin/data_pengajuan',
    category: 'info',
  });

  return payload;
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

    updatedItem = { ...item, status };
    return updatedItem;
  });

  savePengajuanData(updated);

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
  search: string
) {
  return items.filter((item) => {
    const matchStatus = filterStatus === 'Semua Status' || item.status === filterStatus;
    const matchJurusan =
      filterJurusan === 'Semua Jurusan/unit' ||
      filterJurusan === 'Semua Ruang Kerjasama' ||
      filterJurusan === 'Semua Kategori Kerjasama' ||
      item.jurusan === filterJurusan ||
      getKategoriPengajuan(item) === filterJurusan;
    const keyword = search.toLowerCase();
    const matchSearch =
      keyword === '' ||
      item.mitra.toLowerCase().includes(keyword) ||
      item.judul.toLowerCase().includes(keyword) ||
      item.pengusul.toLowerCase().includes(keyword);

    return matchStatus && matchJurusan && matchSearch;
  });
}

// Filter lanjutan yang juga memperhitungkan pilihan tahun.
export function getFilteredPengajuanData(items: PengajuanItem[], filters: PengajuanFilterOptions) {
  const filtered = filterPengajuanData(items, filters.filterStatus, filters.filterJurusan, filters.search);

  if (filters.filterTahun === 'Semua Tahun') {
    return filtered;
  }

  return filtered.filter((item) => item.tanggal.startsWith(filters.filterTahun));
}
