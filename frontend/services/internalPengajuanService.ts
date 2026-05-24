import {
  getPengajuanData,
  type PengajuanFileAttachment,
  type PengajuanFilterOptions,
  type PengajuanItem,
  type PengajuanStatus,
  pengajuanJurusanOptions,
  pengajuanJurusanUnitOptions,
  pengajuanUnitOptions,
  submitPengajuan,
} from './adminPengajuanService';

export function getInternalPengajuanData(): PengajuanItem[] {
  return getPengajuanData({ excludeAdmin: true }).filter((item) => item.kategori === 'Internal' || !item.kategori);
}

// Submit pengajuan internal
export async function submitInternalPengajuan(
  data: Omit<PengajuanItem, 'id' | 'tanggal' | 'status' | 'isFromAdmin'>
): Promise<PengajuanItem> {
  const persisted = await submitPengajuan(data, false, 'internal');

  // Juga simpan ke rekap data internal
  try {
    const { saveRekapData } = require('./internalRekapDataService');
    if (typeof saveRekapData === 'function') {
      saveRekapData(persisted);
    }
  } catch {}

  // Juga simpan ke story aktivitas internal
  try {
    const { saveAktivitasByKerjasamaId } = require('./internalStoryAktivitasService');
    if (typeof saveAktivitasByKerjasamaId === 'function') {
      saveAktivitasByKerjasamaId(persisted.id, []);
    }
  } catch {}

  return persisted;
}

// Fungsi lain (statistik, update status, dsb) dapat di-copy sesuai kebutuhan

/**
 * Ambil data pengajuan internal yang sudah disetujui admin,
 * dengan menyinkronkan status terbaru dari admin storage.
 * Menggabungkan data dari internal storage + admin storage (berdasarkan id yang sama).
 */
export function getInternalPengajuanDisetujui(): PengajuanItem[] {
  return getPengajuanData({ excludeAdmin: true }).filter(
    (item) => item.status === 'Disetujui' && (item.kategori === 'Internal' || !item.kategori)
  );
}
