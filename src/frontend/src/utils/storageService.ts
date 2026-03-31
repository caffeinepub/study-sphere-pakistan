// storageService.ts
// Only manages device-local user data: recently viewed, completed chapters, favorites, dark mode.
// Chapter and PDF entry CRUD is now handled by the canister backend via useQueries.ts.

const RECENTLY_VIEWED_KEY = "recentlyViewed";
const COMPLETED_KEY = "completedChapters";
const FAVORITES_KEY = "favoriteChapters";
const DARK_MODE_KEY = "darkMode";

// ─── Recently Viewed ──────────────────────────────────────────────────────────

export function getRecentlyViewed(): string[] {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(chapterId: string): void {
  const current = getRecentlyViewed();
  const filtered = current.filter((id) => id !== chapterId);
  const updated = [chapterId, ...filtered].slice(0, 20);
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
}

// ─── Completed Chapters ───────────────────────────────────────────────────────

export function getCompletedChapters(): string[] {
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isChapterCompleted(chapterId: string): boolean {
  return getCompletedChapters().includes(chapterId);
}

export function toggleChapterCompleted(chapterId: string): boolean {
  const current = getCompletedChapters();
  let updated: string[];
  let nowCompleted: boolean;
  if (current.includes(chapterId)) {
    updated = current.filter((id) => id !== chapterId);
    nowCompleted = false;
  } else {
    updated = [...current, chapterId];
    nowCompleted = true;
  }
  localStorage.setItem(COMPLETED_KEY, JSON.stringify(updated));
  return nowCompleted;
}

// ─── Favorite Chapters ────────────────────────────────────────────────────────

export function getFavoriteChapters(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isChapterFavorite(chapterId: string): boolean {
  return getFavoriteChapters().includes(chapterId);
}

export function toggleChapterFavorite(chapterId: string): boolean {
  const current = getFavoriteChapters();
  let updated: string[];
  let nowFavorite: boolean;
  if (current.includes(chapterId)) {
    updated = current.filter((id) => id !== chapterId);
    nowFavorite = false;
  } else {
    updated = [chapterId, ...current];
    nowFavorite = true;
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  return nowFavorite;
}

// ─── Dark Mode ────────────────────────────────────────────────────────────────

export function getDarkMode(): boolean {
  try {
    const raw = localStorage.getItem(DARK_MODE_KEY);
    return raw ? JSON.parse(raw) : false;
  } catch {
    return false;
  }
}

export function setDarkMode(value: boolean): void {
  localStorage.setItem(DARK_MODE_KEY, JSON.stringify(value));
}
