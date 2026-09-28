/**
 * Health Goals Service
 *
 * Provides persistent offline tracking and customization of daily health targets:
 * - Hydration (in mL, with glass conversion)
 * - Daily Steps (with distance km and kcal estimates)
 * - Daily Rest / Sleep (in hours)
 *
 * Supports customizable targets, quick logging, streak calculations, 7-day micro history,
 * and reactive UI updates.
 */

export interface DailyHealthTargets {
  hydrationMl: number; // e.g., 2500 ml (~10 glasses)
  steps: number;       // e.g., 8000 steps
  restHours: number;   // e.g., 8.0 hours
}

export interface DailyHealthProgress {
  date: string; // YYYY-MM-DD
  userId: number | string;
  hydrationMl: number;
  steps: number;
  restHours: number;
  notes?: string;
  lastUpdated: string;
}

export interface GoalPreset {
  id: string;
  label: string;
  description: string;
  emoji: string;
  targets: DailyHealthTargets;
}

export interface GoalSummary {
  date: string;
  targets: DailyHealthTargets;
  progress: DailyHealthProgress;
  hydrationPct: number;
  stepsPct: number;
  restPct: number;
  overallPct: number;
  goalsMetCount: number;
  allGoalsMet: boolean;
  streakDays: number;
  distanceKm: number;
  caloriesBurned: number;
}

export interface DayHistoryItem {
  date: string; // YYYY-MM-DD
  dayLabel: string; // Mon, Tue, etc.
  allMet: boolean;
  metCount: number;
  hydrationPct: number;
  stepsPct: number;
  restPct: number;
  overallPct: number;
}

export const DEFAULT_TARGETS: DailyHealthTargets = {
  hydrationMl: 2500, // 2.5 Liters (10 glasses)
  steps: 8000,       // 8,000 steps
  restHours: 8.0,    // 8 hours
};

export const GOAL_PRESETS: GoalPreset[] = [
  {
    id: 'standard',
    label: 'Standard Rural Active',
    description: 'Balanced baseline recommended for rural living and daily general wellness.',
    emoji: '🌾',
    targets: { hydrationMl: 2500, steps: 8000, restHours: 8.0 }
  },
  {
    id: 'field_worker',
    label: 'Hill Farmer / Outdoor Worker',
    description: 'Higher hydration and endurance step count for agricultural and mountain work.',
    emoji: '⛰️',
    targets: { hydrationMl: 3200, steps: 12000, restHours: 7.5 }
  },
  {
    id: 'elderly_gentle',
    label: 'Elderly / Gentle Recovery',
    description: 'Gentle step goals and extended rest for senior villagers or recovering patients.',
    emoji: '👵',
    targets: { hydrationMl: 2000, steps: 4000, restHours: 8.5 }
  },
  {
    id: 'maternal_care',
    label: 'Maternal & Postnatal Care',
    description: 'High fluid hydration for nursing mothers and ample regenerative rest.',
    emoji: '🤰',
    targets: { hydrationMl: 2800, steps: 5000, restHours: 9.0 }
  }
];

const TARGETS_STORAGE_KEY = 'medora_health_targets_';
const PROGRESS_STORAGE_KEY = 'medora_health_progress_';

class MemoryStorage {
  private store: Map<string, string> = new Map();
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

const memoryStore = new MemoryStorage();

export function getStorage(): {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear?: () => void;
} {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      return (globalThis as any).localStorage;
    }
  } catch (e) {
    // In restricted iframe or private mode
  }
  return memoryStore;
}

export function clearHealthGoalsStorage(): void {
  const store = getStorage();
  if (typeof store.clear === 'function') {
    store.clear();
  }
}

// Subscribers for reactive updates
type GoalsListener = (summary: GoalSummary) => void;
const listeners: Set<GoalsListener> = new Set();

export function subscribeHealthGoals(listener: GoalsListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifySubscribers(userId: number | string, date: string) {
  const summary = getGoalSummary(userId, date);
  listeners.forEach((listener) => {
    try {
      listener(summary);
    } catch (e) {
      console.error('Error in health goals listener', e);
    }
  });
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDailyTargets(userId: number | string = 1): DailyHealthTargets {
  try {
    const raw = getStorage().getItem(`${TARGETS_STORAGE_KEY}${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        hydrationMl: Number(parsed.hydrationMl) || DEFAULT_TARGETS.hydrationMl,
        steps: Number(parsed.steps) || DEFAULT_TARGETS.steps,
        restHours: Number(parsed.restHours) || DEFAULT_TARGETS.restHours,
      };
    }
  } catch (e) {
    console.error('Failed to load targets from storage', e);
  }
  return { ...DEFAULT_TARGETS };
}

export function saveDailyTargets(userId: number | string = 1, targets: DailyHealthTargets): void {
  try {
    getStorage().setItem(`${TARGETS_STORAGE_KEY}${userId}`, JSON.stringify(targets));
    const today = getTodayDateString();
    notifySubscribers(userId, today);
  } catch (e) {
    console.error('Failed to save targets to storage', e);
  }
}

export function getDailyProgress(userId: number | string = 1, date: string = getTodayDateString()): DailyHealthProgress {
  try {
    const raw = getStorage().getItem(`${PROGRESS_STORAGE_KEY}${userId}_${date}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        date,
        userId,
        hydrationMl: Math.max(0, Number(parsed.hydrationMl) || 0),
        steps: Math.max(0, Number(parsed.steps) || 0),
        restHours: Math.max(0, Number(parsed.restHours) || 0),
        notes: parsed.notes || '',
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
      };
    }
  } catch (e) {
    console.error('Failed to load daily progress from storage', e);
  }

  // Initial realistic default progress for first-time / demo experience today:
  // e.g. 1,750 mL (70%), 5,400 steps (67%), 7.0 hrs rest (87%)
  const isToday = date === getTodayDateString();
  const initialData: DailyHealthProgress = {
    date,
    userId,
    hydrationMl: isToday ? 1750 : 2500,
    steps: isToday ? 5400 : 8200,
    restHours: isToday ? 7.0 : 8.0,
    notes: isToday ? 'Morning walk and farm duties completed.' : '',
    lastUpdated: new Date().toISOString(),
  };

  try {
    getStorage().setItem(`${PROGRESS_STORAGE_KEY}${userId}_${date}`, JSON.stringify(initialData));
  } catch (e) {
    // Ignore storage errors in restricted contexts
  }

  return initialData;
}

export function saveDailyProgress(userId: number | string = 1, progress: DailyHealthProgress): void {
  try {
    const payload = {
      ...progress,
      lastUpdated: new Date().toISOString(),
    };
    getStorage().setItem(`${PROGRESS_STORAGE_KEY}${userId}_${progress.date}`, JSON.stringify(payload));
    notifySubscribers(userId, progress.date);
  } catch (e) {
    console.error('Failed to save daily progress to storage', e);
  }
}

export function logQuickProgress(
  userId: number | string = 1,
  metric: 'hydration' | 'steps' | 'rest',
  delta: number,
  date: string = getTodayDateString()
): DailyHealthProgress {
  const current = getDailyProgress(userId, date);

  let updated = { ...current };
  if (metric === 'hydration') {
    updated.hydrationMl = Math.max(0, Math.round(current.hydrationMl + delta));
  } else if (metric === 'steps') {
    updated.steps = Math.max(0, Math.round(current.steps + delta));
  } else if (metric === 'rest') {
    updated.restHours = Math.max(0, Math.round((current.restHours + delta) * 10) / 10);
  }

  saveDailyProgress(userId, updated);
  return updated;
}

export function setExactProgress(
  userId: number | string = 1,
  metric: 'hydration' | 'steps' | 'rest',
  exactValue: number,
  date: string = getTodayDateString()
): DailyHealthProgress {
  const current = getDailyProgress(userId, date);

  let updated = { ...current };
  if (metric === 'hydration') {
    updated.hydrationMl = Math.max(0, Math.round(exactValue));
  } else if (metric === 'steps') {
    updated.steps = Math.max(0, Math.round(exactValue));
  } else if (metric === 'rest') {
    updated.restHours = Math.max(0, Math.round(exactValue * 10) / 10);
  }

  saveDailyProgress(userId, updated);
  return updated;
}

export function resetDailyProgress(userId: number | string = 1, date: string = getTodayDateString()): DailyHealthProgress {
  const resetData: DailyHealthProgress = {
    date,
    userId,
    hydrationMl: 0,
    steps: 0,
    restHours: 0,
    notes: '',
    lastUpdated: new Date().toISOString(),
  };
  saveDailyProgress(userId, resetData);
  return resetData;
}

export function getGoalSummary(userId: number | string = 1, date: string = getTodayDateString()): GoalSummary {
  const targets = getDailyTargets(userId);
  const progress = getDailyProgress(userId, date);

  const hydrationPct = targets.hydrationMl > 0
    ? Math.min(150, Math.round((progress.hydrationMl / targets.hydrationMl) * 100))
    : 0;

  const stepsPct = targets.steps > 0
    ? Math.min(150, Math.round((progress.steps / targets.steps) * 100))
    : 0;

  const restPct = targets.restHours > 0
    ? Math.min(150, Math.round((progress.restHours / targets.restHours) * 100))
    : 0;

  let goalsMetCount = 0;
  if (progress.hydrationMl >= targets.hydrationMl) goalsMetCount++;
  if (progress.steps >= targets.steps) goalsMetCount++;
  if (progress.restHours >= targets.restHours) goalsMetCount++;

  const allGoalsMet = goalsMetCount === 3;
  const overallPct = Math.round((hydrationPct + stepsPct + restPct) / 3);

  // Health metric estimates
  // Approx 1 step ~ 0.75 meters (0.00075 km)
  const distanceKm = Math.round((progress.steps * 0.00075) * 10) / 10;
  // Approx 1 step ~ 0.04 calories burned
  const caloriesBurned = Math.round(progress.steps * 0.04);

  const streakDays = calculateStreak(userId, date);

  return {
    date,
    targets,
    progress,
    hydrationPct,
    stepsPct,
    restPct,
    overallPct,
    goalsMetCount,
    allGoalsMet,
    streakDays,
    distanceKm,
    caloriesBurned,
  };
}

export function calculateStreak(userId: number | string = 1, fromDateStr: string = getTodayDateString()): number {
  let streak = 0;
  const targets = getDailyTargets(userId);
  const anchorDate = new Date(fromDateStr);

  // Check up to 30 past consecutive days
  for (let i = 0; i < 30; i++) {
    const d = new Date(anchorDate);
    d.setDate(anchorDate.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${day}`;

    const raw = getStorage().getItem(`${PROGRESS_STORAGE_KEY}${userId}_${dateKey}`);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const hyd = Number(parsed.hydrationMl) || 0;
        const stp = Number(parsed.steps) || 0;
        const rst = Number(parsed.restHours) || 0;

        // Count as achieved if at least 2 of 3 goals were achieved that day, or today in progress
        const metCount = (hyd >= targets.hydrationMl ? 1 : 0) +
                         (stp >= targets.steps ? 1 : 0) +
                         (rst >= targets.restHours ? 1 : 0);

        if (i === 0) {
          // If today has started, count if at least 1 goal met or progress made
          if (metCount >= 1 || (hyd > 0 && stp > 0)) {
            streak++;
          }
        } else if (metCount >= 2) {
          streak++;
        } else {
          break;
        }
      } catch (e) {
        break;
      }
    } else {
      // If past days have no key in demo, assume a gentle 3-day active streak for demo presentation
      if (i <= 3) {
        streak++;
      } else {
        break;
      }
    }
  }

  return Math.max(1, streak);
}

export function getWeeklyGoalHistory(userId: number | string = 1, fromDateStr: string = getTodayDateString()): DayHistoryItem[] {
  const targets = getDailyTargets(userId);
  const anchorDate = new Date(fromDateStr);
  const result: DayHistoryItem[] = [];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(anchorDate);
    d.setDate(anchorDate.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${day}`;
    const dayLabel = dayNames[d.getDay()];

    const raw = getStorage().getItem(`${PROGRESS_STORAGE_KEY}${userId}_${dateKey}`);
    let hyd = 0;
    let stp = 0;
    let rst = 0;

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        hyd = Number(parsed.hydrationMl) || 0;
        stp = Number(parsed.steps) || 0;
        rst = Number(parsed.restHours) || 0;
      } catch (e) {
        // default 0
      }
    } else if (i > 0) {
      // Seed historical days for visual completeness if empty
      const demoFills = [
        { h: 2600, s: 8400, r: 8.0 },
        { h: 2400, s: 7800, r: 7.5 },
        { h: 2800, s: 9200, r: 8.0 },
        { h: 2200, s: 6900, r: 7.0 },
        { h: 2500, s: 8100, r: 8.5 },
        { h: 2700, s: 8600, r: 8.0 },
      ];
      const sample = demoFills[(i - 1) % demoFills.length];
      hyd = sample.h;
      stp = sample.s;
      rst = sample.r;
    } else {
      const todayProg = getDailyProgress(userId, dateKey);
      hyd = todayProg.hydrationMl;
      stp = todayProg.steps;
      rst = todayProg.restHours;
    }

    const hydPct = targets.hydrationMl > 0 ? Math.min(100, Math.round((hyd / targets.hydrationMl) * 100)) : 0;
    const stpPct = targets.steps > 0 ? Math.min(100, Math.round((stp / targets.steps) * 100)) : 0;
    const rstPct = targets.restHours > 0 ? Math.min(100, Math.round((rst / targets.restHours) * 100)) : 0;

    let metCount = 0;
    if (hyd >= targets.hydrationMl) metCount++;
    if (stp >= targets.steps) metCount++;
    if (rst >= targets.restHours) metCount++;

    const overallPct = Math.round((hydPct + stpPct + rstPct) / 3);

    result.push({
      date: dateKey,
      dayLabel,
      allMet: metCount === 3,
      metCount,
      hydrationPct: hydPct,
      stepsPct: stpPct,
      restPct: rstPct,
      overallPct,
    });
  }

  return result;
}
