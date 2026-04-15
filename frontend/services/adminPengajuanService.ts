import { addAdminNotification } from '@/services/adminService';

export type PengajuanStatus = 'Menunggu' | 'Diproses' | 'Disetujui' | 'Ditolak';

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

const STORAGE_KEY = 'pengajuanKerjasamaData';

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

function canUseStorage(): boolean {
  return typeof window !== 'undefined';
}

function emitPengajuanUpdate() {
  if (canUseStorage()) {
    window.dispatchEvent(new Event('pengajuan-data-updated'));
  }
}

function savePengajuanData(items: PengajuanItem[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  emitPengajuanUpdate();
}

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
      ? `Pengajuan '${payload.judul}' berhasil dikirim. Lanjutkan verifikasi email ke ${payload.emailPengusul}.`
      : `Pengajuan '${payload.judul}' berhasil dikirim dan menunggu review.`,
    from: payload.pengusul,
    href: '/admin/data_pengajuan',
    category: 'info',
  });

  return payload;
}

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

export function getPengajuanStats(items: PengajuanItem[]) {
  return {
    totalPengajuan: items.length,
    menunggu: items.filter((item) => item.status === 'Menunggu').length,
    diproses: items.filter((item) => item.status === 'Diproses').length,
    disetujui: items.filter((item) => item.status === 'Disetujui').length,
  };
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
