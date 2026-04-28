import type { ExamResult, Section } from './types';
import type { ExamLevel } from './levelConfig';
import { ALL_LEVELS } from './levelConfig';

const STORAGE_KEY = 'telc-a1-history';

export interface HistoryEntry {
  id: string;
  date: string;          // ISO string
  type: 'exam' | 'practice';
  section?: Section;     // only for practice entries
  level?: ExamLevel;     // back-filled to 'A1' for old entries
  result: ExamResult;
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Back-fill type/level for entries saved before these fields existed
    return (parsed as HistoryEntry[]).map(e => ({
      ...e,
      type: e.type ?? 'exam',
      level: e.level ?? (e.result?.level ?? 'A1'),
    }));
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

export function saveResult(result: ExamResult, level?: ExamLevel): HistoryEntry {
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    type: 'exam',
    level: level ?? result.level ?? 'A1',
    result,
  };
  const history = loadHistory();
  history.unshift(entry);
  persist(history);
  return entry;
}

export function savePracticeResult(result: ExamResult, section: Section, level?: ExamLevel): HistoryEntry {
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    type: 'practice',
    section,
    level: level ?? result.level ?? 'A1',
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

export interface LevelProgress {
  level: ExamLevel;
  tests: number;        // full exams taken
  passRate: number;     // 0–100
  avgPct: number;       // 0–100
  badge: 'none' | 'in-progress' | 'passed';  // 'passed' = ≥80% pass rate on ≥3 exams
}

/** Returns progress for every level based on full exam history only. */
export function computeLevelProgress(entries: HistoryEntry[]): Record<ExamLevel, LevelProgress> {
  const result = {} as Record<ExamLevel, LevelProgress>;
  for (const lv of ALL_LEVELS) {
    const lvEntries = entries.filter(e => (e.level ?? 'A1') === lv && e.type === 'exam');
    const tests = lvEntries.length;
    const passed = lvEntries.filter(e => e.result.passed).length;
    const passRate = tests > 0 ? (passed / tests) * 100 : 0;
    const avgPct = tests > 0
      ? lvEntries.reduce((s, e) => s + (e.result.maxPoints > 0 ? (e.result.totalPoints / e.result.maxPoints) * 100 : 0), 0) / tests
      : 0;
    const badge: LevelProgress['badge'] =
      tests === 0 ? 'none'
      : tests >= 3 && passRate >= 80 ? 'passed'
      : 'in-progress';
    result[lv] = { level: lv, tests, passRate, avgPct, badge };
  }
  return result;
}
