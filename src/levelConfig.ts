// TELC level definitions — scoring, labels, colors, progression

export type ExamLevel = 'A1' | 'A2' | 'B1' | 'B2';

export interface LevelConfig {
  maxPoints: number;      // Total exam points
  sectionMax: number;     // Points per section
  passPoints: number;     // Minimum total to pass
  label: string;          // "A1"
  name: string;           // "telc Deutsch A1"
  subtitle: string;       // human description
  colorClass: string;     // text color
  bgLight: string;        // light background
  borderClass: string;
  badgeBg: string;        // solid bg for badges
  order: number;          // 0-3 for progression
}

export const LEVEL_CONFIGS: Record<ExamLevel, LevelConfig> = {
  A1: {
    maxPoints: 60,
    sectionMax: 15,
    passPoints: 36,
    label: 'A1',
    name: 'telc Deutsch A1',
    subtitle: 'Einsteiger',
    colorClass: 'text-telc',
    bgLight: 'bg-telc-light',
    borderClass: 'border-telc/30',
    badgeBg: 'bg-telc text-white',
    order: 0,
  },
  A2: {
    maxPoints: 60,
    sectionMax: 15,
    passPoints: 36,
    label: 'A2',
    name: 'telc Deutsch A2',
    subtitle: 'Grundkenntnisse',
    colorClass: 'text-section-hoeren',
    bgLight: 'bg-section-hoeren-light',
    borderClass: 'border-section-hoeren/30',
    badgeBg: 'bg-section-hoeren text-white',
    order: 1,
  },
  B1: {
    maxPoints: 100,
    sectionMax: 25,
    passPoints: 60,
    label: 'B1',
    name: 'telc Deutsch B1',
    subtitle: 'Selbständige Verwendung',
    colorClass: 'text-section-schreiben',
    bgLight: 'bg-section-schreiben-light',
    borderClass: 'border-section-schreiben/30',
    badgeBg: 'bg-section-schreiben text-white',
    order: 2,
  },
  B2: {
    maxPoints: 100,
    sectionMax: 25,
    passPoints: 60,
    label: 'B2',
    name: 'telc Deutsch B2',
    subtitle: 'Kompetente Verwendung',
    colorClass: 'text-section-lesen-dark',
    bgLight: 'bg-section-lesen-light',
    borderClass: 'border-section-lesen/30',
    badgeBg: 'bg-section-lesen-dark text-white',
    order: 3,
  },
};

export const ALL_LEVELS: ExamLevel[] = ['A1', 'A2', 'B1', 'B2'];

const STORAGE_KEY = 'telc-active-level';

export function loadActiveLevel(): ExamLevel {
  try {
    const v = localStorage.getItem(STORAGE_KEY) as ExamLevel | null;
    if (v && ALL_LEVELS.includes(v)) return v;
  } catch { /* ignore */ }
  return 'A1';
}

export function saveActiveLevel(level: ExamLevel): void {
  try { localStorage.setItem(STORAGE_KEY, level); } catch { /* ignore */ }
}
