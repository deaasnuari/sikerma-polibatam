const HIDDEN_STORY_IDS_KEY = 'adminStoryAktivitasHiddenIds';
const AKTIVITAS_KEY = 'sikerma_aktivitas';

export interface AktivitasItem {
  id: number;
  judul: string;
  jenisAktivitas: string;
  tanggal: string;
  peserta: number;
  deskripsi: string;
  picPolibatam: string;
  picMitra: string;
  status: 'direncanakan' | 'berlangsung' | 'selesai';
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined';
}

function emitStoryUpdate() {
  if (canUseStorage()) {
    window.dispatchEvent(new Event('story-data-updated'));
  }
}

export function getHiddenStoryIds(): number[] {
  if (!canUseStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(HIDDEN_STORY_IDS_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as number[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function hideStoryByPengajuanId(pengajuanId: number): number[] {
  const current = getHiddenStoryIds();

  if (current.includes(pengajuanId)) {
    return current;
  }

  const updated = [...current, pengajuanId];

  if (canUseStorage()) {
    window.localStorage.setItem(HIDDEN_STORY_IDS_KEY, JSON.stringify(updated));
  }

  emitStoryUpdate();
  return updated;
}

export function showStoryByPengajuanId(pengajuanId: number): number[] {
  const updated = getHiddenStoryIds().filter((id) => id !== pengajuanId);

  if (canUseStorage()) {
    window.localStorage.setItem(HIDDEN_STORY_IDS_KEY, JSON.stringify(updated));
  }

  emitStoryUpdate();
  return updated;
}

// ── Aktivitas per kerjasama ──────────────────────────────────────────────────

function getAllAktivitasData(): Record<string, AktivitasItem[]> {
  if (!canUseStorage()) return {};
  const raw = window.localStorage.getItem(AKTIVITAS_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, AktivitasItem[]>;
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function getAktivitasByKerjasamaId(kerjasamaId: number): AktivitasItem[] {
  return getAllAktivitasData()[String(kerjasamaId)] ?? [];
}

export function saveAktivitasByKerjasamaId(kerjasamaId: number, items: AktivitasItem[]): void {
  if (!canUseStorage()) return;
  const all = getAllAktivitasData();
  all[String(kerjasamaId)] = items;
  window.localStorage.setItem(AKTIVITAS_KEY, JSON.stringify(all));
}

/**
 * Dipanggil saat pengajuan disetujui.
 * Menambahkan aktivitas awal "Penandatanganan Dokumen Kerjasama" jika belum ada data.
 */
export function initAktivitasOnApproval(
  kerjasamaId: number,
  mitraName: string,
  tanggalDisetujui: string
): void {
  const existing = getAktivitasByKerjasamaId(kerjasamaId);
  if (existing.length > 0) return; // sudah punya data, jangan timpa

  const initial: AktivitasItem = {
    id: 1,
    judul: 'Penandatanganan Dokumen Kerjasama',
    jenisAktivitas: 'Lainnya',
    tanggal: tanggalDisetujui,
    peserta: 0,
    deskripsi: `Dokumen kerjasama dengan ${mitraName} telah resmi ditandatangani dan pengajuan disetujui oleh Admin SIKERMA.`,
    picPolibatam: 'Admin SIKERMA',
    picMitra: mitraName,
    status: 'selesai',
  };

  saveAktivitasByKerjasamaId(kerjasamaId, [initial]);
}
