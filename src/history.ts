import type { ExamResult, Section } from './types';

const STORAGE_KEY = 'telc-a1-history';

export interface HistoryEntry {
  id: string;
  date: string;          // ISO string
  type: 'exam' | 'practice';
  section?: Section;     // only for practice entries
  result: ExamResult;
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Back-fill type for entries saved before this field existed
    return (parsed as HistoryEntry[]).map(e => ({ ...e, type: e.type ?? 'exam' }));
  } catch {
    return [];
  }
}

function persist(history: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (err) {
    // QuotaExceededError: prune oldest entries and retry once
    if (history.length > 10) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 10)));
      } catch { /* give up gracefully */ }
    }
    console.warn('History save failed:', err);
  }
}

export function saveResult(result: ExamResult): HistoryEntry {
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    type: 'exam',
    result,
  };
  const history = loadHistory();
  history.unshift(entry);
  persist(history);
  return entry;
}

export function savePracticeResult(result: ExamResult, section: Section): HistoryEntry {
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    type: 'practice',
    section,
    result,
  };
  const history = loadHistory();
  history.unshift(entry);
  persist(history);
  return entry;
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export interface HistoryStats {
  totalTests: number;
  passed: number;
  failed: number;
  avgScore: number;
  avgPct: number;
  bestScore: number;
  sectionAvg: Record<string, { avgPoints: number; avgPct: number; passRate: number }>;
}

export function computeStats(entries: HistoryEntry[]): HistoryStats | null {
  if (entries.length === 0) return null;

  let totalPts = 0;
  let totalPct = 0;
  let bestScore = 0;
  let passed = 0;

  const sectionAcc: Record<string, { sumPts: number; sumPct: number; passes: number; count: number }> = {};

  for (const e of entries) {
    const r = e.result;
    totalPts += r.totalPoints;
    totalPct += r.maxPoints > 0 ? (r.totalPoints / r.maxPoints) * 100 : 0;
    if (r.totalPoints > bestScore) bestScore = r.totalPoints;
    if (r.passed) passed++;

    for (const s of r.sections) {
      if (!sectionAcc[s.section]) {
        sectionAcc[s.section] = { sumPts: 0, sumPct: 0, passes: 0, count: 0 };
      }
      const acc = sectionAcc[s.section];
      acc.sumPts += s.points;
      acc.sumPct += s.maxPoints > 0 ? (s.points / s.maxPoints) * 100 : 0;
      if (s.passed) acc.passes++;
      acc.count++;
    }
  }

  const n = entries.length;
  const sectionAvg: HistoryStats['sectionAvg'] = {};
  for (const [sec, acc] of Object.entries(sectionAcc)) {
    sectionAvg[sec] = {
      avgPoints: acc.sumPts / acc.count,
      avgPct: acc.sumPct / acc.count,
      passRate: (acc.passes / acc.count) * 100,
    };
  }

  return {
    totalTests: n,
    passed,
    failed: n - passed,
    avgScore: totalPts / n,
    avgPct: totalPct / n,
    bestScore,
    sectionAvg,
  };
}
