const HIDDEN_STORY_IDS_KEY = 'adminStoryAktivitasHiddenIds';

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
