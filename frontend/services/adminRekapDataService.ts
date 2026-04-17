import { addAdminNotification } from '@/services/adminService';

// Status dokumen kerjasama yang ditampilkan di rekap data.
export type RekapStatus = 'Aktif' | 'Akan Berakhir' | 'Kadaluarsa';
export type RekapJenis = 'MoA' | 'MoU' | 'IA';

// Tipe data utama untuk satu baris dokumen pada tabel rekap.
export interface RekapDokumen {
  noDokumen: string;
  namaMitra: string;
  jenis: RekapJenis;
  unit: string;
  kategoriUnit?: 'Jurusan' | 'Unit';
  tanggalMulai: string;
  berlakuHingga: string;
  tahun: string;
  status: RekapStatus;
  whatsappNumber?: string;
}

// Data mentah dari modal tambah dokumen sebelum dikonversi ke format rekap.
export interface DokumenData {
  nomorDokumen: string;
  jenisDokumen: string;
  namaPIC: string;
  kategoriMitra: string;
  namaMitra: string;
  status: string;
  jabatanMitra: string;
  emailMitra: string;
  tanggalMulai: string;
  tanggalBerakhir: string;
  alamatMitra: string;
  whatsappMitra: string;
  asalKategori: 'Jurusan' | 'Unit';
  unitKerja: string;
}

export interface RekapFilterOptions {
  filterJenis: string;
  filterUnit: string;
  filterStatus: string;
  filterTahun: string | null;
  search: string;
}

// Key localStorage untuk menyimpan data rekap dokumen di browser.
const STORAGE_KEY = 'adminRekapDokumenData';

// Daftar jurusan dan unit mengikuti opsi detail pada form Data Pengajuan.
export const rekapJurusanOptions = [
  'Manajemen dan Bisnis',
  'Teknik Elektro',
  'Teknik Informatika',
  'Teknik Mesin',
];

export const rekapUnitOptions = [
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

export const rekapJurusanUnitOptions = [...rekapJurusanOptions, ...rekapUnitOptions];

// Data default awal yang ditampilkan jika belum ada data tersimpan.
const defaultRekapData: RekapDokumen[] = [
  {
    noDokumen: 'MoA/001/2026',
    namaMitra: 'PT. Teknologi Maju Indonesia',
    jenis: 'MoA',
    unit: 'Teknik Informatika',
    tanggalMulai: '28 Feb 2026',
    berlakuHingga: '28 Feb 2029',
    tahun: '2026',
    status: 'Akan Berakhir',
    whatsappNumber: '6283333333333',
  },
  {
    noDokumen: 'MoU/002/2026',
    namaMitra: 'Universitas Negeri Jakarta',
    jenis: 'MoU',
    unit: 'Teknik Informatika',
    tanggalMulai: '28 Feb 2026',
    berlakuHingga: '28 Feb 2029',
    tahun: '2026',
    status: 'Aktif',
    whatsappNumber: '6282222222222',
  },
  {
    noDokumen: 'IA/002/2026',
    namaMitra: 'PT. Digita Solutions',
    jenis: 'IA',
    unit: 'Teknik Informatika',
    tanggalMulai: '28 Feb 2026',
    berlakuHingga: '28 Feb 2029',
    tahun: '2026',
    status: 'Kadaluarsa',
    whatsappNumber: '6284444444444',
  },
];

// Warna badge berdasarkan jenis dokumen.
export const rekapJenisBadgeMap: Record<RekapJenis, string> = {
  MoA: 'bg-cyan-100 text-cyan-700',
  MoU: 'bg-violet-100 text-violet-700',
  IA: 'bg-orange-100 text-orange-700',
};

// Warna badge berdasarkan status masa berlaku dokumen.
export const rekapStatusBadgeMap: Record<RekapStatus, string> = {
  Aktif: 'bg-green-500 text-white',
  'Akan Berakhir': 'bg-orange-500 text-white',
  Kadaluarsa: 'bg-red-500 text-white',
};

export const rekapStatusOptions = ['Semua Status', 'Aktif', 'Akan Berakhir', 'Kadaluarsa'];

// Pastikan localStorage hanya diakses saat kode berjalan di browser.
function canUseStorage() {
  return typeof window !== 'undefined';
}

// Kirim event agar halaman rekap bisa refresh otomatis setelah data berubah.
function emitRekapUpdate() {
  if (canUseStorage()) {
    window.dispatchEvent(new Event('rekap-data-updated'));
  }
}

// Simpan data rekap terbaru ke localStorage dan broadcast update ke UI.
function saveRekapData(items: RekapDokumen[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  emitRekapUpdate();
}

function formatDisplayDate(dateValue: string): string {
  if (!dateValue) {
    return '';
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return parsedDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function toDateInputValue(dateValue: string): string {
  if (!dateValue) {
    return '';
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return parsedDate.toISOString().slice(0, 10);
}

function mapDokumenDataToRekap(data: DokumenData): RekapDokumen {
  const tahun = new Date(data.tanggalMulai).getFullYear().toString();

  return {
    noDokumen: data.nomorDokumen,
    namaMitra: data.namaMitra,
    jenis: data.jenisDokumen as RekapJenis,
    unit: data.unitKerja || (data.asalKategori === 'Jurusan' ? 'Teknik Informatika' : 'UPA TIK (Teknologi Informasi dan Komunikasi)'),
    kategoriUnit: data.asalKategori,
    tanggalMulai: formatDisplayDate(data.tanggalMulai),
    berlakuHingga: formatDisplayDate(data.tanggalBerakhir),
    tahun,
    status: (data.status as RekapStatus) || 'Aktif',
    whatsappNumber: data.whatsappMitra,
  };
}

// Ambil seluruh data rekap dan gabungkan dengan data default jika perlu.
export function getRekapData(): RekapDokumen[] {
  if (!canUseStorage()) {
    return defaultRekapData;
  }

  const storedRaw = window.localStorage.getItem(STORAGE_KEY);

  if (!storedRaw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultRekapData));
    return defaultRekapData;
  }

  try {
    const stored = JSON.parse(storedRaw) as RekapDokumen[];

    if (!Array.isArray(stored)) {
      return defaultRekapData;
    }

    return stored;
  } catch {
    return defaultRekapData;
  }
}

// Ambil daftar jenis dokumen unik untuk dropdown filter.
export function getRekapJenisOptions(items: RekapDokumen[]): string[] {
  return ['Semua Jenis', ...Array.from(new Set(items.map((item) => item.jenis)))];
}

// Ambil daftar jurusan/unit unik untuk dropdown filter.
export function getRekapUnitOptions(items: RekapDokumen[]): string[] {
  return ['Semua Jurusan/unit', ...Array.from(new Set([...rekapJurusanUnitOptions, ...items.map((item) => item.unit)]))];
}

// Ambil daftar tahun unik yang tersedia untuk filter tahun.
export function getAvailableYears(items: RekapDokumen[]): number[] {
  return Array.from(new Set(items.map((item) => Number(item.tahun)))).sort((a, b) => a - b);
}

// Filter rekap data berdasarkan jenis, unit, status, tahun, dan pencarian nama/nomor dokumen.
export function filterRekapData(items: RekapDokumen[], filters: RekapFilterOptions): RekapDokumen[] {
  return items.filter((item) => {
    const matchesJenis = filters.filterJenis === 'Semua Jenis' || item.jenis === filters.filterJenis;
    const matchesUnit = filters.filterUnit === 'Semua Jurusan/unit' || item.unit === filters.filterUnit;
    const matchesStatus = filters.filterStatus === 'Semua Status' || item.status === filters.filterStatus;
    const matchesTahun = filters.filterTahun === null || item.tahun === filters.filterTahun;
    const keyword = filters.search.toLowerCase().trim();
    const matchesSearch =
      keyword === '' ||
      item.namaMitra.toLowerCase().includes(keyword) ||
      item.noDokumen.toLowerCase().includes(keyword);

    return matchesJenis && matchesUnit && matchesStatus && matchesTahun && matchesSearch;
  });
}

// Hitung ringkasan total dokumen berdasarkan status untuk stat card.
export function getRekapStats(items: RekapDokumen[]) {
  return {
    totalKerjasama: items.length,
    totalAktif: items.filter((item) => item.status === 'Aktif').length,
    totalAkanBerakhir: items.filter((item) => item.status === 'Akan Berakhir').length,
    totalKadaluarsa: items.filter((item) => item.status === 'Kadaluarsa').length,
  };
}

// Ubah data rekap menjadi format awal untuk modal edit.
export function createDokumenFormData(item: RekapDokumen): DokumenData {
  const asalKategori = item.kategoriUnit || (rekapJurusanOptions.includes(item.unit) ? 'Jurusan' : 'Unit');

  return {
    nomorDokumen: item.noDokumen,
    jenisDokumen: item.jenis,
    namaPIC: '',
    kategoriMitra: '',
    namaMitra: item.namaMitra,
    status: item.status,
    jabatanMitra: '',
    emailMitra: '',
    tanggalMulai: toDateInputValue(item.tanggalMulai),
    tanggalBerakhir: toDateInputValue(item.berlakuHingga),
    alamatMitra: '',
    whatsappMitra: item.whatsappNumber || '',
    asalKategori,
    unitKerja: item.unit,
  };
}

// Tambah dokumen baru dari modal input lalu kirim notifikasi ke admin.
export function addRekapDokumen(data: DokumenData): RekapDokumen[] {
  const newDokumen = mapDokumenDataToRekap(data);
  const updated = [newDokumen, ...getRekapData()];
  saveRekapData(updated);

  addAdminNotification({
    title: 'Dokumen Rekap Ditambahkan',
    message: `Dokumen ${newDokumen.noDokumen} untuk mitra ${newDokumen.namaMitra} berhasil ditambahkan ke rekap data.`,
    from: data.namaPIC || 'Admin SIKERMA',
    href: '/admin/rekap_data',
    category: 'info',
  });

  return updated;
}

// Update dokumen yang sudah ada dari modal edit.
export function updateRekapDokumen(originalNoDokumen: string, data: DokumenData): RekapDokumen[] {
  const updated = getRekapData().map((item) =>
    item.noDokumen === originalNoDokumen ? mapDokumenDataToRekap(data) : item
  );

  saveRekapData(updated);

  addAdminNotification({
    title: 'Dokumen Rekap Diperbarui',
    message: `Dokumen ${data.nomorDokumen} untuk mitra ${data.namaMitra} berhasil diperbarui.`,
    from: data.namaPIC || 'Admin SIKERMA',
    href: '/admin/rekap_data',
    category: 'approval',
  });

  return updated;
}

// Hapus dokumen dari daftar rekap data.
export function deleteRekapDokumen(noDokumen: string): RekapDokumen[] {
  const updated = getRekapData().filter((item) => item.noDokumen !== noDokumen);
  saveRekapData(updated);

  addAdminNotification({
    title: 'Dokumen Rekap Dihapus',
    message: `Dokumen ${noDokumen} dihapus dari daftar rekap data.`,
    from: 'Admin SIKERMA',
    href: '/admin/rekap_data',
    category: 'reminder',
  });

  return updated;
}
