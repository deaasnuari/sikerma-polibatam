export type RenewalRequestStatus = 'menunggu' | 'disetujui' | 'ditolak';

export interface RenewalRequestItem {
  id: number;
  kerjasamaId: number;
  namaMitra: string;
  noDokumen: string;
  tanggalMulaiBaru: string;
  tanggalBerakhirBaru: string;
  catatan: string;
  status: RenewalRequestStatus;
  requestedAt: string;
  decidedAt?: string;
  decidedBy?: string;
}

const STORAGE_KEY = 'admin-renewal-requests';

function canUseStorage() {
  return typeof window !== 'undefined';
}

function emitRenewalUpdate() {
  if (canUseStorage()) {
    window.dispatchEvent(new Event('renewal-requests-updated'));
  }
}

function saveRenewalRequests(items: RenewalRequestItem[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  emitRenewalUpdate();
}

export function getRenewalRequests(): RenewalRequestItem[] {
  if (!canUseStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as RenewalRequestItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addRenewalRequest(payload: {
  kerjasamaId: number;
  namaMitra: string;
  noDokumen: string;
  tanggalMulaiBaru: string;
  tanggalBerakhirBaru: string;
  catatan?: string;
}): RenewalRequestItem[] {
  const nextItem: RenewalRequestItem = {
    id: Date.now(),
    kerjasamaId: payload.kerjasamaId,
    namaMitra: payload.namaMitra,
    noDokumen: payload.noDokumen,
    tanggalMulaiBaru: payload.tanggalMulaiBaru,
    tanggalBerakhirBaru: payload.tanggalBerakhirBaru,
    catatan: payload.catatan || '-',
    status: 'menunggu',
    requestedAt: new Date().toLocaleString('id-ID'),
  };

  const updated = [nextItem, ...getRenewalRequests()];
  saveRenewalRequests(updated);
  return updated;
}

export function updateRenewalRequestStatus(
  id: number,
  status: Exclude<RenewalRequestStatus, 'menunggu'>,
  decidedBy = 'Admin SIKERMA'
): RenewalRequestItem[] {
  const updated = getRenewalRequests().map((item) => {
    if (item.id !== id) {
      return item;
    }

    return {
      ...item,
      status,
      decidedBy,
      decidedAt: new Date().toLocaleString('id-ID'),
    };
  });

  saveRenewalRequests(updated);
  return updated;
}
