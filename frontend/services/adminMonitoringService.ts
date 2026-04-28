// Utility untuk generate nomor dokumen sesuai format: urutan-JENIS.PL29-bulanRomawi-tahun
export function generateNoDokumen({
  urutan,
  jenis,
  tanggal,
}: {
  urutan: number;
  jenis: 'MoU' | 'MoA' | 'IA';
  tanggal: string; // format: 'dd/mm/yyyy' atau ISO string
}): string {
  // Konversi urutan ke 2 digit
  const urutanStr = (typeof urutan === 'number' && !isNaN(urutan) ? urutan : 1).toString().padStart(2, '0');
  // Jenis kapital
  const jenisUpper = jenis.toUpperCase();
  // Ambil bulan dan tahun
  let bulan = 0;
  let tahun = '';
  if (!tanggal || typeof tanggal !== 'string') {
    tanggal = new Date().toISOString();
  }
  if (tanggal.includes('/')) {
    // format dd/mm/yyyy
    const parts = tanggal.split('/');
    bulan = parseInt(parts[1], 10);
    tahun = parts[2];
  } else {
    // ISO string
    const dateObj = new Date(tanggal);
    bulan = dateObj.getMonth() + 1;
    tahun = dateObj.getFullYear().toString();
  }
  // Bulan romawi
  const bulanRomawiArr = [
    '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII',
  ];
  const bulanRomawi = bulanRomawiArr[bulan] || '';
  return `${urutanStr}-${jenisUpper}-PL29-${bulanRomawi}-${tahun}`;
}
// Service monitoring kerjasama untuk halaman admin.
// File ini dipakai agar data, tipe, dan helper bisnis tidak bercampur dengan komponen UI Next.js.

export interface RenewalRecord {
  id: string;
  tanggalPermintaan: string;
  statusResponse: 'menunggu' | 'disetujui' | 'ditolak';
  catatan: string;
  tanggalMulaiBaru: string;
  tanggalBerakhirBaru: string;
  tanggalResponse?: string;
}

export interface MonitoringNotification {
  id: string;
  tanggalKirim: string;
  jenis: 'reminder-3bulan' | 'reminder-1bulan' | 'urgent';
  status: 'terkirim' | 'dibaca' | 'ditindaklanjuti' | 'tidak-direspons';
  pesan: string;
  emailMitra: string;
}

export interface NonactiveRecord {
  id: string;
  tanggalDinonaktifkan: string;
  alasan: string;
  buktiFile?: {
    nama: string;
    ukuran: string;
    tipe: string;
    uploadedAt: string;
  };
  status: 'pending' | 'confirmed';
}

export type StatusKerjasama = 'Aktif' | 'Akan Berakhir' | 'Kadaluarsa';
export type TabKey = 'Semua' | 'Aktif' | 'Akan Berakhir' | 'Kadaluarsa';

export interface Kerjasama {
  id: number;
  sourcePengajuanId?: number;
  judul?: string;
  namaMitra: string;
  noDokumen: string;
  jenis: 'MoU' | 'MoA' | 'IA';
  status: StatusKerjasama;
  tanggalMulai: string;
  tanggalBerakhir: string;
  sisaMasaBerlaku: string | null;
  ruangLingkup: string[];
  whatsappNumber: string;
  emailMitra: string;
}

const STORAGE_KEY = 'adminMonitoringKerjasamaData';

// Data awal monitoring yang ditampilkan ketika halaman dibuka.
const defaultMonitoringData: Kerjasama[] = [
  {
    id: 1,
    namaMitra: 'BADAN PENGUSAHAAN BATAM',
    noDokumen: '00',
    jenis: 'MoU',
    status: 'Aktif',
    tanggalMulai: '01/01/2025',
    tanggalBerakhir: '01/01/2028',
    sisaMasaBerlaku: '20 Bulan',
    ruangLingkup: ['Penelitian', 'Pengabdian Masyarakat'],
    whatsappNumber: '6281234567890',
    emailMitra: 'contact@bpb.go.id',
  },
  {
    id: 2,
    namaMitra: 'PT Feen Marine',
    noDokumen: '00',
    jenis: 'MoA',
    status: 'Akan Berakhir',
    tanggalMulai: '01/01/2025',
    tanggalBerakhir: '01/01/2028',
    sisaMasaBerlaku: null,
    ruangLingkup: ['Magang', 'Kerja Praktek'],
    whatsappNumber: '6289876543210',
    emailMitra: 'admin@feenmarine.com',
  },
  {
    id: 3,
    namaMitra: 'PT. Riseal Propulsion Indonesia',
    noDokumen: '00',
    jenis: 'IA',
    status: 'Kadaluarsa',
    tanggalMulai: '01/01/2025',
    tanggalBerakhir: '01/01/2028',
    sisaMasaBerlaku: '1 Bulan',
    ruangLingkup: ['Magang', 'Kerja Praktek'],
    whatsappNumber: '6281111111111',
    emailMitra: 'contact@riseal.co.id',
  },
  {
    id: 4,
    namaMitra: 'Universitas Negeri Jakarta',
    noDokumen: '01',
    jenis: 'MoU',
    status: 'Aktif',
    tanggalMulai: '15/03/2024',
    tanggalBerakhir: '15/03/2027',
    sisaMasaBerlaku: '11 Bulan',
    ruangLingkup: ['Penelitian', 'Publikasi Bersama'],
    whatsappNumber: '6282222222222',
    emailMitra: 'kerjasama@unj.ac.id',
  },
  {
    id: 5,
    namaMitra: 'PT. Teknologi Maju Indonesia',
    noDokumen: '02',
    jenis: 'MoA',
    status: 'Akan Berakhir',
    tanggalMulai: '10/02/2023',
    tanggalBerakhir: '10/05/2026',
    sisaMasaBerlaku: '1 Bulan',
    ruangLingkup: ['Magang', 'Penelitian'],
    whatsappNumber: '6283333333333',
    emailMitra: 'marketing@teknologimaju.id',
  },
  {
    id: 6,
    namaMitra: 'PT. Digital Solutions',
    noDokumen: '03',
    jenis: 'IA',
    status: 'Kadaluarsa',
    tanggalMulai: '01/06/2022',
    tanggalBerakhir: '01/06/2025',
    sisaMasaBerlaku: null,
    ruangLingkup: ['Kerja Praktek'],
    whatsappNumber: '6284444444444',
    emailMitra: 'hr@digitalsolutions.co.id',
  },
  {
    id: 7,
    namaMitra: 'Politeknik Negeri Semarang',
    noDokumen: '04',
    jenis: 'MoU',
    status: 'Akan Berakhir',
    tanggalMulai: '20/07/2023',
    tanggalBerakhir: '20/07/2026',
    sisaMasaBerlaku: '3 Bulan',
    ruangLingkup: ['Penelitian', 'Pengabdian Masyarakat'],
    whatsappNumber: '6285555555555',
    emailMitra: 'kerjasama@polines.ac.id',
  },
  {
    id: 8,
    namaMitra: 'PT Batam Aero Technic',
    noDokumen: '05',
    jenis: 'IA',
    status: 'Aktif',
    tanggalMulai: '05/01/2025',
    tanggalBerakhir: '05/01/2029',
    sisaMasaBerlaku: '33 Bulan',
    ruangLingkup: ['Magang', 'Kerja Praktek', 'Penelitian'],
    whatsappNumber: '6286666666666',
    emailMitra: 'partnerships@batamtech.com',
  },
  {
    id: 9,
    namaMitra: 'Dinas Pendidikan Kepri',
    noDokumen: '06',
    jenis: 'MoU',
    status: 'Kadaluarsa',
    tanggalMulai: '01/04/2021',
    tanggalBerakhir: '01/04/2024',
    sisaMasaBerlaku: null,
    ruangLingkup: ['Pengabdian Masyarakat'],
    whatsappNumber: '6287777777777',
    emailMitra: 'dinaspendidikan@kepriprov.go.id',
  },
  {
    id: 10,
    namaMitra: 'PT. Samator Gas Industri',
    noDokumen: '07',
    jenis: 'MoA',
    status: 'Aktif',
    tanggalMulai: '12/09/2024',
    tanggalBerakhir: '12/09/2027',
    sisaMasaBerlaku: '17 Bulan',
    ruangLingkup: ['Kerja Praktek'],
    whatsappNumber: '6288888888888',
    emailMitra: 'corporate@samatorgas.com',
  },
];

// Riwayat notifikasi awal untuk contoh monitoring email.
const defaultNotificationHistories: Record<number, MonitoringNotification[]> = {
  2: [
    {
      id: 'notif-1',
      tanggalKirim: '10/04/2026',
      jenis: 'reminder-3bulan',
      status: 'terkirim',
      pesan: 'Notifikasi reminder otomatis: Kerjasama akan berakhir dalam 3 bulan',
      emailMitra: 'admin@feenmarine.com',
    },
  ],
  5: [
    {
      id: 'notif-2',
      tanggalKirim: '12/04/2026',
      jenis: 'reminder-1bulan',
      status: 'dibaca',
      pesan: 'Notifikasi reminder otomatis: Kerjasama akan berakhir dalam 1 bulan',
      emailMitra: 'marketing@teknologimaju.id',
    },
  ],
};

// Badge jenis dokumen untuk dipakai langsung di komponen UI.
export const monitoringJenisBadgeMap: Record<Kerjasama['jenis'], string> = {
  MoU: 'bg-violet-100 text-violet-700',
  MoA: 'bg-cyan-100 text-cyan-700',
  IA: 'bg-orange-100 text-orange-700',
};

// Konfigurasi warna status agar tampilan kartu konsisten di halaman monitoring.
export const monitoringStatusConfig: Record<StatusKerjasama, { dot: string; label: string; border: string; bg: string; labelColor: string }> = {
  Aktif: {
    dot: 'bg-green-500',
    label: 'Aktif',
    border: 'border-l-green-500',
    bg: 'bg-green-50',
    labelColor: 'text-green-600',
  },
  'Akan Berakhir': {
    dot: 'bg-orange-400',
    label: 'akan berakhir',
    border: 'border-l-orange-400',
    bg: 'bg-orange-50',
    labelColor: 'text-orange-500',
  },
  Kadaluarsa: {
    dot: 'bg-red-500',
    label: 'kadaluarsa',
    border: 'border-l-red-500',
    bg: 'bg-red-50',
    labelColor: 'text-red-500',
  },
};

function canUseStorage(): boolean {
  return typeof window !== 'undefined';
}

function emitMonitoringUpdate() {
  if (canUseStorage()) {
    window.dispatchEvent(new Event('monitoring-data-updated'));
  }
}

function saveMonitoringData(items: Kerjasama[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  emitMonitoringUpdate();
}

function formatDisplayDate(dateValue?: string): string {
  if (!dateValue) {
    return '-';
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return parsedDate.toLocaleDateString('id-ID');
}

function resolveStatusAndSisa(tanggalBerakhir?: string): { status: StatusKerjasama; sisaMasaBerlaku: string | null } {
  if (!tanggalBerakhir) {
    return { status: 'Aktif', sisaMasaBerlaku: null };
  }

  const endDate = new Date(tanggalBerakhir);

  if (Number.isNaN(endDate.getTime())) {
    return { status: 'Aktif', sisaMasaBerlaku: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: 'Kadaluarsa', sisaMasaBerlaku: null };
  }

  const diffMonths = Math.max(1, Math.ceil(diffDays / 30));
  const sisaMasaBerlaku = `${diffMonths} Bulan`;

  if (diffDays <= 90) {
    return { status: 'Akan Berakhir', sisaMasaBerlaku };
  }

  return { status: 'Aktif', sisaMasaBerlaku };
}

// Ambil seluruh data kerjasama untuk monitoring.
export function getMonitoringData(): Kerjasama[] {
  if (!canUseStorage()) {
    return defaultMonitoringData;
  }

  const storedRaw = window.localStorage.getItem(STORAGE_KEY);

  if (!storedRaw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMonitoringData));
    return defaultMonitoringData;
  }

  try {
    const stored = JSON.parse(storedRaw) as Kerjasama[];

    if (!Array.isArray(stored)) {
      return defaultMonitoringData;
    }

    return stored;
  } catch {
    return defaultMonitoringData;
  }
}

// Ambil riwayat notifikasi awal dan clone agar state React aman diubah.
export function getDefaultNotificationHistories(): Record<number, MonitoringNotification[]> {
  return Object.fromEntries(
    Object.entries(defaultNotificationHistories).map(([key, value]) => [Number(key), [...value]])
  );
}

// Hitung ringkasan statistik berdasarkan status kerjasama.
export function getMonitoringStats(items: Kerjasama[]) {
  return {
    totalAktif: items.filter((item) => item.status === 'Aktif').length,
    totalAkanBerakhir: items.filter((item) => item.status === 'Akan Berakhir').length,
    totalKadaluarsa: items.filter((item) => item.status === 'Kadaluarsa').length,
  };
}

// Filter data berdasarkan tab aktif di halaman monitoring.
export function getFilteredMonitoringData(items: Kerjasama[], activeTab: TabKey): Kerjasama[] {
  return activeTab === 'Semua' ? items : items.filter((item) => item.status === activeTab);
}

// Siapkan daftar tab beserta jumlah datanya untuk komponen UI.
export function getMonitoringTabs(items: Kerjasama[]) {
  const { totalAktif, totalAkanBerakhir, totalKadaluarsa } = getMonitoringStats(items);

  return [
    { key: 'Semua' as const, label: 'Semua Status', count: items.length },
    { key: 'Aktif' as const, label: 'Kerjasama Aktif', count: totalAktif },
    { key: 'Akan Berakhir' as const, label: 'Akan Berakhir', count: totalAkanBerakhir },
    { key: 'Kadaluarsa' as const, label: 'Kadaluarsa', count: totalKadaluarsa },
  ];
}

// Cari satu data kerjasama berdasarkan id.
export function findKerjasamaById(items: Kerjasama[], id: number | null): Kerjasama | null {
  if (!id) {
    return null;
  }

  return items.find((item) => item.id === id) || null;
}

// Buat tautan WhatsApp otomatis untuk menghubungi mitra.
export function createWhatsAppLink(item: Kerjasama): string {
  // Gunakan judul dokumen jika ada, jika tidak pakai nomor dokumen
  // WAJIB hanya kirim judul dokumen, tanpa fallback ke nomor dokumen
  const judul = (item as any).judul;
  return `https://wa.me/${item.whatsappNumber}?text=Halo%20${encodeURIComponent(item.namaMitra)},%20saya%20ingin%20membahas%20tentang%20kerjasama%20${encodeURIComponent(judul || '')}`;
}

// Helper untuk membuat record perpanjangan baru.
export function createRenewalRecord(
  kerjasamaId: number,
  catatan: string,
  tanggalMulaiBaru: string,
  tanggalBerakhirBaru: string
): RenewalRecord {
  return {
    id: `renewal-${kerjasamaId}-${Date.now()}`,
    tanggalPermintaan: new Date().toLocaleDateString('id-ID'),
    statusResponse: 'menunggu',
    catatan,
    tanggalMulaiBaru,
    tanggalBerakhirBaru,
  };
}

// Helper untuk membuat riwayat notifikasi email baru.
export function createNotificationRecord(
  kerjasamaId: number,
  jenis: MonitoringNotification['jenis'],
  emailMitra: string
): MonitoringNotification {
  return {
    id: `notif-${kerjasamaId}-${Date.now()}`,
    tanggalKirim: new Date().toLocaleDateString('id-ID'),
    jenis,
    status: 'terkirim',
    pesan: `Notifikasi ${jenis} tentang status kerjasama Anda`,
    emailMitra,
  };
}

// Helper untuk membuat data penonaktifan kerjasama.
export function createNonactiveRecord(
  kerjasamaId: number,
  alasan: string,
  buktiFile?: { nama: string; ukuran: string; tipe: string }
): NonactiveRecord {
  return {
    id: `nonactive-${kerjasamaId}-${Date.now()}`,
    tanggalDinonaktifkan: new Date().toLocaleDateString('id-ID'),
    alasan,
    buktiFile: buktiFile
      ? {
          ...buktiFile,
          uploadedAt: new Date().toLocaleDateString('id-ID'),
        }
      : undefined,
    status: 'confirmed',
  };
}

type PengajuanSyncPayload = {
  id: number;
  judul?: string;
  mitra: string;
  jenisDokumen: string;
  tanggalMulai?: string;
  tanggalBerakhir?: string;
  ruangLingkup: string[];
  whatsappPengusul?: string;
  emailPengusul?: string;
};

// Sinkronisasi pengajuan ke daftar monitoring.
export function upsertMonitoringFromPengajuan(payload: PengajuanSyncPayload): Kerjasama[] {
  const jenis = (payload.jenisDokumen === 'MoA' || payload.jenisDokumen === 'MoU' || payload.jenisDokumen === 'IA')
    ? payload.jenisDokumen
    : 'MoU';

  const { status, sisaMasaBerlaku } = resolveStatusAndSisa(payload.tanggalBerakhir);

  const nextItem: Kerjasama = {
    id: payload.id,
    sourcePengajuanId: payload.id,
    judul: payload.judul,
    namaMitra: payload.mitra,
    noDokumen: `PGJ/${payload.id}`,
    jenis,
    status,
    tanggalMulai: formatDisplayDate(payload.tanggalMulai),
    tanggalBerakhir: formatDisplayDate(payload.tanggalBerakhir),
    sisaMasaBerlaku,
    ruangLingkup: payload.ruangLingkup.length ? payload.ruangLingkup : ['Lainnya'],
    whatsappNumber: payload.whatsappPengusul || '-',
    emailMitra: payload.emailPengusul || '-',
  };

  const current = getMonitoringData();
  const hasExisting = current.some((item) => item.sourcePengajuanId === payload.id);
  const updated = hasExisting
    ? current.map((item) => (item.sourcePengajuanId === payload.id ? nextItem : item))
    : [nextItem, ...current];

  saveMonitoringData(updated);
  return updated;
}

// Hapus data monitoring yang berasal dari pengajuan tertentu.
export function removeMonitoringByPengajuanId(pengajuanId: number): Kerjasama[] {
  const updated = getMonitoringData().filter((item) => item.sourcePengajuanId !== pengajuanId);
  saveMonitoringData(updated);
  return updated;
}

// Terapkan tanggal perpanjangan yang sudah disetujui ke data monitoring.
export function applyApprovedRenewalToMonitoring(
  kerjasamaId: number,
  tanggalMulaiBaru: string,
  tanggalBerakhirBaru: string
): Kerjasama[] {
  const { status, sisaMasaBerlaku } = resolveStatusAndSisa(tanggalBerakhirBaru);

  const updated = getMonitoringData().map((item) => {
    if (item.id !== kerjasamaId) {
      return item;
    }

    return {
      ...item,
      tanggalMulai: formatDisplayDate(tanggalMulaiBaru),
      tanggalBerakhir: formatDisplayDate(tanggalBerakhirBaru),
      status,
      sisaMasaBerlaku,
    };
  });

  saveMonitoringData(updated);
  return updated;
}
