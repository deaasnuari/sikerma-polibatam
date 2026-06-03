import { PengajuanItem, PengajuanStatus, getPengajuanData, submitPengajuanApi } from './adminPengajuanService';

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
  data: Omit<PengajuanItem, 'id' | 'diajukanPada' | 'nomorPengajuan' | 'statusPengajuan' | 'isFromAdmin'> & {
    unitProdiId?: number | null;
    nomorPengajuan?: string;
  }
): Promise<PengajuanItem> {
  return submitPengajuanApi(data, false, 'internal');
}

// Fungsi lain (statistik, update status, dsb) dapat di-copy sesuai kebutuhan

/**
 * Ambil data pengajuan internal yang sudah disetujui admin,
 * dengan menyinkronkan status terbaru dari admin storage.
 * Menggabungkan data dari internal storage + admin storage (berdasarkan id yang sama).
 */
export function getInternalPengajuanDisetujui(): PengajuanItem[] {
  if (typeof window === 'undefined') return [];

  // Internal HARUS bersumber dari storage internal sendiri.
  // Jangan ambil dari admin storage agar internal/mitra tidak tercampur.
  const internalData = getInternalPengajuanData();

  // Filter yang disetujui internal saja
  const fromInternal = internalData.filter((item) => item.statusPengajuan === 'Disetujui');


  return fromInternal;
}

