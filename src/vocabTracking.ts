/**
 * Persistent vocabulary tracking via localStorage.
 * Tracks words looked up via the double-click popup and words marked as known in flashcards.
 */

const KEY = 'telc-a1-vocab-track';

interface VocabStore {
  lookedUp: string[];   // words double-clicked and looked up (deduped)
  known: string[];      // words marked as known in flashcards
}

function load(): VocabStore {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { lookedUp: [], known: [] };
}

function save(store: VocabStore): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch { /* ignore */ }
}

export function trackLookedUp(word: string): void {
  const store = load();
  const key = word.toLowerCase().trim();
  if (!store.lookedUp.includes(key)) {
    store.lookedUp.push(key);
    save(store);
  }
}

export function markKnown(word: string): void {
  const store = load();
  const key = word.toLowerCase().trim();
  if (!store.known.includes(key)) {
    store.known.push(key);
    save(store);
  }
}

export function unmarkKnown(word: string): void {
  const store = load();
  const key = word.toLowerCase().trim();
  store.known = store.known.filter(w => w !== key);
  save(store);
}

export function isKnown(word: string): boolean {
  return load().known.includes(word.toLowerCase().trim());
}

export function getStats(): { lookedUp: number; known: number } {
  const store = load();
  return { lookedUp: store.lookedUp.length, known: store.known.length };
}

export function getLookedUpWords(): string[] {
  return load().lookedUp;
}

export function getKnownWords(): string[] {
  return load().known;
}
