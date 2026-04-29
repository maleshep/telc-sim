// XP and Daily Streak tracking

const KEY = 'telc-xp';

export interface XPData {
  totalXP: number;
  todayXP: number;
  todayDate: string;       // YYYY-MM-DD
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string; // YYYY-MM-DD
}

export const XP_VALUES = {
  correctAnswer: 5,
  sessionComplete: 20,
  perfectScore: 30,
  dailyBonus: 15,
} as const;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function load(): XPData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {
    totalXP: 0, todayXP: 0, todayDate: today(),
    currentStreak: 0, longestStreak: 0, lastActivityDate: '',
  };
}

function save(data: XPData): void {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

function refreshDay(data: XPData): XPData {
  const t = today();
  if (data.todayDate !== t) {
    return { ...data, todayXP: 0, todayDate: t };
  }
  return data;
}

function updateStreak(data: XPData): { data: XPData; dailyBonus: boolean } {
  const t = today();
  if (data.lastActivityDate === t) return { data, dailyBonus: false };

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);

  const continued = data.lastActivityDate === yStr;
  const newStreak = continued ? data.currentStreak + 1 : 1;
  const newData = {
    ...data,
    lastActivityDate: t,
    currentStreak: newStreak,
    longestStreak: Math.max(data.longestStreak, newStreak),
    totalXP: data.totalXP + XP_VALUES.dailyBonus,
    todayXP: data.todayXP + XP_VALUES.dailyBonus,
  };
  return { data: newData, dailyBonus: true };
}

export function addXP(amount: number): XPData {
  let data = refreshDay(load());
  const { data: streakData } = updateStreak(data);
  data = streakData;
  data.totalXP += amount;
  data.todayXP += amount;
  save(data);
  return data;
}

export function recordActivity(): XPData {
  let data = refreshDay(load());
  const { data: streakData } = updateStreak(data);
  save(streakData);
  return streakData;
}

export function getXPData(): XPData {
  return refreshDay(load());
}

export function getLevelFromXP(xp: number): { level: number; label: string; nextAt: number } {
  const thresholds = [0, 100, 300, 600, 1000, 1500, 2500, 4000, 6000, 10000];
  const labels = ['Anfänger', 'Lernender', 'Fortgeschritten', 'Geübt', 'Erfahren', 'Experte', 'Meister', 'Champion', 'Legende', 'TELC-Profi'];
  let lvl = 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) lvl = i;
  }
  return { level: lvl + 1, label: labels[lvl], nextAt: thresholds[lvl + 1] ?? thresholds[thresholds.length - 1] };
}
