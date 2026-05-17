import { PengajuanItem, PengajuanStatus, PengajuanFileAttachment, PengajuanFilterOptions, pengajuanJurusanOptions, pengajuanUnitOptions, pengajuanJurusanUnitOptions, getPengajuanData } from './adminPengajuanService';

// Key localStorage khusus internal, benar-benar terpisah dari admin
const STORAGE_KEY = 'pengajuanKerjasamaDataInternal';

// Ambil seluruh data pengajuan, hanya data internal (bukan admin)
export function getInternalPengajuanData(options?: { filterAdmin?: boolean }): PengajuanItem[] {
  if (typeof window === 'undefined') return [];
  const storedRaw = window.localStorage.getItem(STORAGE_KEY);
  if (!storedRaw) return [];
  try {
    const stored = JSON.parse(storedRaw) as PengajuanItem[];
    if (!Array.isArray(stored)) return [];
    // Data internal hanya dari storage internal
    return stored;
  } catch {
    return [];
  }
}

// Submit pengajuan internal
export function submitInternalPengajuan(
  data: Omit<PengajuanItem, 'id' | 'tanggal' | 'status' | 'isFromAdmin'>
): PengajuanItem {
  const payload: PengajuanItem = {
    ...data,
    id: Date.now() + Math.floor(Math.random() * 10000),
    tanggal: new Date().toISOString().slice(0, 10),
    status: 'Menunggu',
    emailTerverifikasi: false,
    isFromAdmin: false,
  };

  // Simpan ke storage internal
  const storedInternal = getInternalPengajuanData();
  const updatedInternal = [payload, ...storedInternal];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedInternal));

  // Juga simpan ke rekap data internal
  try {
    const { saveRekapData } = require('./internalRekapDataService');
    // Jika ada service internal rekap, tambahkan data baru
    if (typeof saveRekapData === 'function') {
      saveRekapData(payload);
    }
  } catch {}

  // Juga simpan ke story aktivitas internal
  try {
    const { saveAktivitasByKerjasamaId } = require('./internalStoryAktivitasService');
    if (typeof saveAktivitasByKerjasamaId === 'function') {
      saveAktivitasByKerjasamaId(payload.id, []);
    }
  } catch {}

  // Juga simpan ke storage utama (admin) dan trigger notifikasi admin
  try {
    // Dynamic import untuk menghindari circular dependency
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { submitPengajuan } = require('./adminPengajuanService');
    submitPengajuan(data, false); // isFromAdmin: false
  } catch (e) {
    // fallback manual jika dynamic import gagal
    const STORAGE_KEY_UTAMA = 'pengajuanKerjasamaData';
    const storedUtamaRaw = window.localStorage.getItem(STORAGE_KEY_UTAMA);
    let storedUtama: PengajuanItem[] = [];
    if (storedUtamaRaw) {
      try {
        const parsed = JSON.parse(storedUtamaRaw);
        if (Array.isArray(parsed)) storedUtama = parsed;
      } catch {}
    }
    const updatedUtama = [payload, ...storedUtama];
    window.localStorage.setItem(STORAGE_KEY_UTAMA, JSON.stringify(updatedUtama));
    // Trigger event update agar admin refresh
    window.dispatchEvent(new Event('pengajuan-data-updated'));
  }
  return payload;
}

// Fungsi lain (statistik, update status, dsb) dapat di-copy sesuai kebutuhan

/**
 * Ambil data pengajuan internal yang sudah disetujui admin,
 * dengan menyinkronkan status terbaru dari admin storage.
 * Menggabungkan data dari internal storage + admin storage (berdasarkan id yang sama).
 */
export function getInternalPengajuanDisetujui(): PengajuanItem[] {
  if (typeof window === 'undefined') return [];

  // Baca dari admin storage — filter yang bukan dari admin (isFromAdmin false)
  // dan yang kategorinya Internal ATAU tidak punya kategori (data lama)
  const adminData = getPengajuanData();
  const fromAdmin = adminData.filter(
    (item) => !item.isFromAdmin && item.status === 'Disetujui' &&
    (item.kategori === 'Internal' || !item.kategori)
  );

  // Baca dari internal storage untuk menangkap data yang mungkin tidak tersimpan di admin storage
  const internalData = getInternalPengajuanData();

  // Sinkronkan status internal storage dari admin storage berdasarkan id
  const adminMap = new Map(adminData.map((item) => [item.id, item]));
  const fromInternal = internalData
    .map((item) => {
      const adminItem = adminMap.get(item.id);
      if (adminItem) return { ...item, status: adminItem.status as PengajuanStatus };
      return item;
    })
    .filter((item) => item.status === 'Disetujui');

  // Gabungkan dan deduplikasi berdasarkan id
  const combined = [...fromAdmin, ...fromInternal];
  const seen = new Set<number>();
  const unique: PengajuanItem[] = [];
  for (const item of combined) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      unique.push(item);
    }
  }
  return unique;
}
