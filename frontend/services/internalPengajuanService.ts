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

  // Baca dari admin storage — filter yang bukan dari admin (isFromAdmin false)
  // dan yang kategorinya Internal ATAU tidak punya kategori (data lama)
  const adminData = getPengajuanData();
  const fromAdmin = adminData.filter(
    (item) => !item.isFromAdmin && item.statusPengajuan === 'Disetujui' &&
    (item.kategoriPengajuan === 'Internal' || !item.kategoriPengajuan)
  );

  // Baca dari internal storage untuk menangkap data yang mungkin tidak tersimpan di admin storage
  const internalData = getInternalPengajuanData();

  // Sinkronkan status internal storage dari admin storage berdasarkan id
  const adminMap = new Map(adminData.map((item) => [item.id, item]));
  const fromInternal = internalData
    .map((item) => {
      const adminItem = adminMap.get(item.id);
      if (adminItem) return { ...item, statusPengajuan: adminItem.statusPengajuan as PengajuanStatus };
      return item;
    })
    .filter((item) => item.statusPengajuan === 'Disetujui');

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
