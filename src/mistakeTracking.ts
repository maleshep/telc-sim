/**
 * Persistent mistake tracker — records wrong answers across all game/exam types.
 * Persisted to localStorage for cross-session analysis.
 */

import type { ExamLevel } from './levelConfig';

export type MistakeType = 'hoeren' | 'lesen' | 'grammar' | 'sentence';

export interface MistakeEntry {
  id: string;
  date: string;             // ISO
  type: MistakeType;
  level: ExamLevel;
  question: string;         // question text / sentence
  correct: string;          // correct answer
  wrong: string;            // what the user chose
  category?: string;        // grammar category id
  teil?: string;            // hoeren/lesen teil
}

const KEY = 'telc-mistakes';
const MAX_ENTRIES = 500;    // rolling window

function load(): MistakeEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function save(entries: MistakeEntry[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch { /* ignore quota */ }
}

export function recordMistake(entry: Omit<MistakeEntry, 'id' | 'date'>): void {
  const entries = load();
  entries.unshift({
    ...entry,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  });
  save(entries);
}

export function getMistakes(level?: ExamLevel, type?: MistakeType): MistakeEntry[] {
  let entries = load();
  if (level) entries = entries.filter(e => e.level === level);
  if (type) entries = entries.filter(e => e.type === type);
  return entries;
}

export function clearMistakes(): void {
  localStorage.removeItem(KEY);
}

/** Summary per grammar category: { [categoryId]: { wrong: number, total: number } } */
export function grammarMistakeSummary(level: ExamLevel): Record<string, { wrong: number }> {
  const entries = getMistakes(level, 'grammar');
  const summary: Record<string, { wrong: number }> = {};
  for (const e of entries) {
    if (!e.category) continue;
    if (!summary[e.category]) summary[e.category] = { wrong: 0 };
    summary[e.category].wrong++;
  }
  return summary;
}

/** Last N wrong vocab (from hoeren/lesen mistakes) */
export function recentWrongWords(level: ExamLevel, limit = 20): MistakeEntry[] {
  return getMistakes(level).filter(e => e.type === 'hoeren' || e.type === 'lesen').slice(0, limit);
}
