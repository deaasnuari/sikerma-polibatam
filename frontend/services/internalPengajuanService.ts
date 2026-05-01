import { PengajuanItem, PengajuanStatus, PengajuanFileAttachment, PengajuanFilterOptions, pengajuanJurusanOptions, pengajuanUnitOptions, pengajuanJurusanUnitOptions } from './adminPengajuanService';

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
