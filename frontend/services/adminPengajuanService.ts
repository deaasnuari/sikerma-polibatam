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

  upsertRekapFromPengajuan({
    id: payload.id,
    mitra: payload.mitra,
    jenisDokumen: payload.jenisDokumen,
    jurusan: payload.jurusan,
    tanggalMulai: payload.tanggalMulai,
    tanggalBerakhir: payload.tanggalBerakhir,
    whatsappPengusul: payload.whatsappPengusul,
  });

  upsertMonitoringFromPengajuan({
    id: payload.id,
    judul: payload.judul,
    mitra: payload.mitra,
    jenisDokumen: payload.jenisDokumen,
    tanggalMulai: payload.tanggalMulai,
    tanggalBerakhir: payload.tanggalBerakhir,
    ruangLingkup: payload.ruangLingkup,
    whatsappPengusul: payload.whatsappPengusul,
    emailPengusul: payload.emailPengusul,
  });

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
export function getFilteredPengajuanData(items: PengajuanItem[], filters: PengajuanFilterOptions) {
  const filtered = filterPengajuanData(items, filters.filterStatus, filters.filterJurusan, filters.search);

  if (filters.filterTahun === 'Semua Tahun') {
    return filtered;
  }

  return filtered.filter((item) => item.tanggal.startsWith(filters.filterTahun));
}
