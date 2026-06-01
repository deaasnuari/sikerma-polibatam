import { getStoredUser } from '@/services/authService';
import { getPengajuanData, submitPengajuanApi, type PengajuanItem } from '@/services/adminPengajuanService';

const STORAGE_PREFIX = 'pengajuanKerjasamaDataEksternal';
const UPDATE_EVENT = 'external-pengajuan-data-updated';

type SubmitExternalPayload = Omit<
  PengajuanItem,
  'id' | 'diajukanPada' | 'statusPengajuan' | 'isFromAdmin' | 'nomorPengajuan'
>;

function canUseStorage(): boolean {
  return typeof window !== 'undefined';
}

function normalizeScope(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-');
}

function getExternalStorageKey(): string {
  const user = getStoredUser();
  const fallbackScope = 'guest';

  if (!user || user.role !== 'external') {
    return `${STORAGE_PREFIX}:${fallbackScope}`;
  }

  const scope = user.id || user.email || user.username || fallbackScope;
  return `${STORAGE_PREFIX}:${normalizeScope(String(scope))}`;
}

function emitUpdate(): void {
  if (!canUseStorage()) {
    return;
  }

  window.dispatchEvent(new Event(UPDATE_EVENT));
}

function saveExternalPengajuanData(items: PengajuanItem[]): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(getExternalStorageKey(), JSON.stringify(items));
  emitUpdate();
}

export function getExternalPengajuanData(): PengajuanItem[] {
  if (!canUseStorage()) {
    return [];
  }

  const storedRaw = window.localStorage.getItem(getExternalStorageKey());
  if (!storedRaw) {
    return [];
  }

  try {
    const parsed = JSON.parse(storedRaw) as PengajuanItem[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

export function getExternalPengajuanUpdateEventName(): string {
  return UPDATE_EVENT;
}

export function syncExternalPengajuanWithAdminData(): PengajuanItem[] {
  const externalItems = getExternalPengajuanData();
  if (externalItems.length === 0) {
    return externalItems;
  }

  const adminExternalById = new Map(
    getPengajuanData()
      .filter((item) => item.kategoriPengajuan === 'Eksternal')
      .map((item) => [item.id, item]),
  );

  let hasChanges = false;
  const synced = externalItems.map((item) => {
    const fromAdmin = adminExternalById.get(item.id);
    if (!fromAdmin) {
      return item;
    }

    const nextItem: PengajuanItem = {
      ...item,
      statusPengajuan: fromAdmin.statusPengajuan,
      reviewComment: fromAdmin.reviewComment,
      reviewedAt: fromAdmin.reviewedAt,
      reviewedBy: fromAdmin.reviewedBy,
      tanggalMulai: fromAdmin.tanggalMulai ?? item.tanggalMulai,
      tanggalBerakhir: fromAdmin.tanggalBerakhir ?? item.tanggalBerakhir,
    };

    const changed =
      nextItem.statusPengajuan !== item.statusPengajuan ||
      nextItem.reviewComment !== item.reviewComment ||
      nextItem.reviewedAt !== item.reviewedAt ||
      nextItem.reviewedBy !== item.reviewedBy ||
      nextItem.tanggalMulai !== item.tanggalMulai ||
      nextItem.tanggalBerakhir !== item.tanggalBerakhir;

    if (changed) {
      hasChanges = true;
    }

    return nextItem;
  });

  if (hasChanges) {
    saveExternalPengajuanData(synced);
  }

  return synced;
}

export async function submitExternalPengajuan(data: SubmitExternalPayload): Promise<PengajuanItem> {
  const submitted = await submitPengajuanApi(data, false, 'eksternal');

  const current = getExternalPengajuanData();
  const next = [submitted, ...current.filter((item) => item.id !== submitted.id)];
  saveExternalPengajuanData(next);
  return submitted;
}
