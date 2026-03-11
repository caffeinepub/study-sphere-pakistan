// storageService.ts
// Manages device-local user data: recently viewed, completed, favorites, dark mode.

const RECENTLY_VIEWED_KEY = "recentlyViewed";
const COMPLETED_KEY = "completedChapters";
const FAVORITES_KEY = "favoriteChapters";
const TOPIC_RECENTLY_VIEWED_KEY = "recentlyViewedTopics";
const TOPIC_COMPLETED_KEY = "completedTopics";
const TOPIC_FAVORITES_KEY = "favoriteTopics";
const DARK_MODE_KEY = "darkMode";

// ─── Recently Viewed (Chapters) ───────────────────────────────────────────────

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
  const updated = [
    chapterId,
    ...current.filter((id) => id !== chapterId),
  ].slice(0, 20);
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

// ─── Recently Viewed (Topics) ─────────────────────────────────────────────────

export function getRecentlyViewedTopics(): string[] {
  try {
    const raw = localStorage.getItem(TOPIC_RECENTLY_VIEWED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewedTopic(topicId: string): void {
  const current = getRecentlyViewedTopics();
  const updated = [topicId, ...current.filter((id) => id !== topicId)].slice(
    0,
    20,
  );
  localStorage.setItem(TOPIC_RECENTLY_VIEWED_KEY, JSON.stringify(updated));
}

// ─── Completed Topics ─────────────────────────────────────────────────────────

export function isTopicCompleted(topicId: string): boolean {
  try {
    const raw = localStorage.getItem(TOPIC_COMPLETED_KEY);
    const arr: string[] = raw ? JSON.parse(raw) : [];
    return arr.includes(topicId);
  } catch {
    return false;
  }
}

export function toggleTopicCompleted(topicId: string): boolean {
  try {
    const raw = localStorage.getItem(TOPIC_COMPLETED_KEY);
    const current: string[] = raw ? JSON.parse(raw) : [];
    let updated: string[];
    let nowCompleted: boolean;
    if (current.includes(topicId)) {
      updated = current.filter((id) => id !== topicId);
      nowCompleted = false;
    } else {
      updated = [...current, topicId];
      nowCompleted = true;
    }
    localStorage.setItem(TOPIC_COMPLETED_KEY, JSON.stringify(updated));
    return nowCompleted;
  } catch {
    return false;
  }
}

// ─── Favorite Topics ──────────────────────────────────────────────────────────

export function getFavoriteTopics(): string[] {
  try {
    const raw = localStorage.getItem(TOPIC_FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isTopicFavorite(topicId: string): boolean {
  return getFavoriteTopics().includes(topicId);
}

export function toggleTopicFavorite(topicId: string): boolean {
  const current = getFavoriteTopics();
  let updated: string[];
  let nowFavorite: boolean;
  if (current.includes(topicId)) {
    updated = current.filter((id) => id !== topicId);
    nowFavorite = false;
  } else {
    updated = [topicId, ...current];
    nowFavorite = true;
  }
  localStorage.setItem(TOPIC_FAVORITES_KEY, JSON.stringify(updated));
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
