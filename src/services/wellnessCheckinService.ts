export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type PhysicalComfortLevel = 1 | 2 | 3 | 4 | 5;

export interface MoodMeta {
  level: MoodLevel;
  label: string;
  emoji: string;
  color: string;
  bgLight: string;
  description: string;
}

export const MOOD_DEFINITIONS: Record<MoodLevel, MoodMeta> = {
  5: {
    level: 5,
    label: 'Great / Joyful',
    emoji: '😄',
    color: '#10B981',
    bgLight: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    description: 'Feeling vibrant, positive, and optimistic',
  },
  4: {
    level: 4,
    label: 'Good / Calm',
    emoji: '🙂',
    color: '#06B6D4',
    bgLight: 'bg-cyan-50 text-cyan-900 border-cyan-200',
    description: 'Feeling peaceful, steady, and content',
  },
  3: {
    level: 3,
    label: 'Neutral / Okay',
    emoji: '😐',
    color: '#F59E0B',
    bgLight: 'bg-amber-50 text-amber-900 border-amber-200',
    description: 'Feeling alright, manageable routine',
  },
  2: {
    level: 2,
    label: 'Low / Anxious',
    emoji: '😟',
    color: '#F97316',
    bgLight: 'bg-orange-50 text-orange-900 border-orange-200',
    description: 'Feeling worried, fatigued, or down',
  },
  1: {
    level: 1,
    label: 'Struggling / Sad',
    emoji: '😢',
    color: '#EF4444',
    bgLight: 'bg-rose-50 text-rose-900 border-rose-200',
    description: 'Experiencing emotional strain or distress',
  },
};

export interface ComfortMeta {
  level: PhysicalComfortLevel;
  label: string;
  scorePercent: number;
  color: string;
  bgLight: string;
  description: string;
}

export const COMFORT_DEFINITIONS: Record<PhysicalComfortLevel, ComfortMeta> = {
  5: {
    level: 5,
    label: 'Optimal / Pain-Free',
    scorePercent: 100,
    color: '#10B981',
    bgLight: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    description: 'Full mobility, high energy, zero physical discomfort',
  },
  4: {
    level: 4,
    label: 'Comfortable',
    scorePercent: 80,
    color: '#14B8A6',
    bgLight: 'bg-teal-50 text-teal-900 border-teal-200',
    description: 'Minor sensations only, completely functional for daily work',
  },
  3: {
    level: 3,
    label: 'Mild Discomfort',
    scorePercent: 60,
    color: '#F59E0B',
    bgLight: 'bg-amber-50 text-amber-900 border-amber-200',
    description: 'Tolerable stiffness, slight ache or tired muscles',
  },
  2: {
    level: 2,
    label: 'Moderate Discomfort',
    scorePercent: 40,
    color: '#F97316',
    bgLight: 'bg-orange-50 text-orange-900 border-orange-200',
    description: 'Noticeable pain or fatigue restricting heavier physical tasks',
  },
  1: {
    level: 1,
    label: 'Severe Discomfort',
    scorePercent: 20,
    color: '#EF4444',
    bgLight: 'bg-rose-50 text-rose-900 border-rose-200',
    description: 'Acute or intense discomfort requiring bed rest and clinical review',
  },
};

export interface DailyWellnessEntry {
  id: string;
  userId: number | string;
  date: string; // 'YYYY-MM-DD'
  timestamp: string; // ISO String
  mood: MoodLevel;
  moodLabel: string;
  moodEmoji: string;
  physicalComfort: PhysicalComfortLevel;
  comfortLabel: string;
  comfortScorePercent: number;
  energyLevel: number; // 1 to 5
  symptomsNoted: string[];
  notes?: string;
  loggedAtTime?: string;
}

export interface WellnessTrendsSummary {
  entriesCount: number;
  averageMood: number; // 1 to 5
  averageComfort: number; // 1 to 5
  averageComfortPercent: number; // 0 to 100
  dominantMood: string;
  streakDays: number;
  weeklyTrendMood: 'improving' | 'stable' | 'declining';
  weeklyTrendComfort: 'improving' | 'stable' | 'declining';
  alertRecommended: boolean;
}

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
}

const memoryStorage = new MemoryStorage();

function getStorage(): Storage | MemoryStorage {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return memoryStorage;
}

const STORAGE_KEY_PREFIX = 'medora_wellness_checkins_user_';

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatShortDay(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

/**
 * Generate 7 days of realistic pre-seeded history leading up to yesterday
 * so users immediately see meaningful trends over the past week.
 */
function generateSeedHistory(userId: number | string): DailyWellnessEntry[] {
  const today = new Date();
  const seedEntries: DailyWellnessEntry[] = [];

  const seedPatterns: Array<{
    daysAgo: number;
    mood: MoodLevel;
    comfort: PhysicalComfortLevel;
    energy: number;
    symptoms: string[];
    notes: string;
  }> = [
    { daysAgo: 6, mood: 3, comfort: 3, energy: 3, symptoms: ['Mild back stiffness'], notes: 'Normal day after farm chores' },
    { daysAgo: 5, mood: 4, comfort: 4, energy: 4, symptoms: ['Feeling energetic'], notes: 'Drank warm water, morning walk' },
    { daysAgo: 4, mood: 3, comfort: 3, energy: 3, symptoms: ['Mild headache'], notes: 'Rested in afternoon shade' },
    { daysAgo: 3, mood: 4, comfort: 4, energy: 4, symptoms: ['Zero pain'], notes: 'Good night sleep, took morning medicines' },
    { daysAgo: 2, mood: 5, comfort: 4, energy: 5, symptoms: ['Good mobility', 'Well hydrated'], notes: 'Attended village gathering, energetic' },
    { daysAgo: 1, mood: 4, comfort: 5, energy: 4, symptoms: ['Zero pain', 'Feeling calm'], notes: 'Took evening BP medication on time' },
  ];

  for (const item of seedPatterns) {
    const d = new Date(today);
    d.setDate(today.getDate() - item.daysAgo);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const moodMeta = MOOD_DEFINITIONS[item.mood];
    const comfortMeta = COMFORT_DEFINITIONS[item.comfort];

    seedEntries.push({
      id: `seed-${userId}-${dateStr}`,
      userId,
      date: dateStr,
      timestamp: d.toISOString(),
      mood: item.mood,
      moodLabel: moodMeta.label,
      moodEmoji: moodMeta.emoji,
      physicalComfort: item.comfort,
      comfortLabel: comfortMeta.label,
      comfortScorePercent: comfortMeta.scorePercent,
      energyLevel: item.energy,
      symptomsNoted: item.symptoms,
      notes: item.notes,
      loggedAtTime: '08:30 AM',
    });
  }

  return seedEntries;
}

export function getAllWellnessEntries(userId: number | string): DailyWellnessEntry[] {
  const storage = getStorage();
  const key = `${STORAGE_KEY_PREFIX}${userId}`;
  const raw = storage.getItem(key);

  if (!raw) {
    const seeds = generateSeedHistory(userId);
    storage.setItem(key, JSON.stringify(seeds));
    return seeds;
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const seeds = generateSeedHistory(userId);
    storage.setItem(key, JSON.stringify(seeds));
    return seeds;
  } catch {
    const seeds = generateSeedHistory(userId);
    storage.setItem(key, JSON.stringify(seeds));
    return seeds;
  }
}

export function getTodayCheckin(userId: number | string): DailyWellnessEntry | null {
  const entries = getAllWellnessEntries(userId);
  const todayStr = getTodayDateString();
  return entries.find((e) => e.date === todayStr) || null;
}

export function logDailyWellness(
  userId: number | string,
  data: {
    mood: MoodLevel;
    physicalComfort: PhysicalComfortLevel;
    energyLevel?: number;
    symptomsNoted?: string[];
    notes?: string;
    date?: string;
  }
): DailyWellnessEntry {
  const storage = getStorage();
  const key = `${STORAGE_KEY_PREFIX}${userId}`;
  const entries = getAllWellnessEntries(userId);
  const targetDate = data.date || getTodayDateString();

  const moodMeta = MOOD_DEFINITIONS[data.mood];
  const comfortMeta = COMFORT_DEFINITIONS[data.physicalComfort];

  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newEntry: DailyWellnessEntry = {
    id: `wellness-${userId}-${targetDate}`,
    userId,
    date: targetDate,
    timestamp: now.toISOString(),
    mood: data.mood,
    moodLabel: moodMeta.label,
    moodEmoji: moodMeta.emoji,
    physicalComfort: data.physicalComfort,
    comfortLabel: comfortMeta.label,
    comfortScorePercent: comfortMeta.scorePercent,
    energyLevel: data.energyLevel ?? 4,
    symptomsNoted: data.symptomsNoted || [],
    notes: data.notes?.trim() || '',
    loggedAtTime: timeFormatted,
  };

  const existingIdx = entries.findIndex((e) => e.date === targetDate);
  if (existingIdx >= 0) {
    entries[existingIdx] = newEntry;
  } else {
    entries.push(newEntry);
  }

  // Sort by date ascending
  entries.sort((a, b) => a.date.localeCompare(b.date));

  storage.setItem(key, JSON.stringify(entries));
  notifyListeners();
  return newEntry;
}

/**
 * Returns past 7 days data structured for Recharts visualization
 */
export interface PastWeekChartPoint {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Mon 22" or "Today"
  isToday: boolean;
  hasEntry: boolean;
  mood: number; // 1-5 (null/undefined if no entry)
  comfort: number; // 1-5
  comfortPercent: number; // 0-100
  energy: number; // 1-5
  moodEmoji: string;
  moodLabel: string;
  comfortLabel: string;
  notes?: string;
  symptoms?: string[];
}

export function getPastWeekWellnessChartData(
  userId: number | string,
  daysCount = 7
): {
  chartPoints: PastWeekChartPoint[];
  summary: WellnessTrendsSummary;
} {
  const entries = getAllWellnessEntries(userId);
  const entryMap = new Map<string, DailyWellnessEntry>();
  entries.forEach((e) => entryMap.set(e.date, e));

  const todayStr = getTodayDateString();
  const chartPoints: PastWeekChartPoint[] = [];

  const now = new Date();
  let totalMood = 0;
  let totalComfort = 0;
  let loggedCount = 0;

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;

    const entry = entryMap.get(dateStr);
    const dayLabel = isToday ? 'Today' : formatShortDay(dateStr);

    if (entry) {
      chartPoints.push({
        date: dateStr,
        dayLabel,
        isToday,
        hasEntry: true,
        mood: entry.mood,
        comfort: entry.physicalComfort,
        comfortPercent: entry.comfortScorePercent,
        energy: entry.energyLevel,
        moodEmoji: entry.moodEmoji,
        moodLabel: entry.moodLabel,
        comfortLabel: entry.comfortLabel,
        notes: entry.notes,
        symptoms: entry.symptomsNoted,
      });
      totalMood += entry.mood;
      totalComfort += entry.physicalComfort;
      loggedCount++;
    } else {
      // Interpolate or default point for display
      chartPoints.push({
        date: dateStr,
        dayLabel,
        isToday,
        hasEntry: false,
        mood: 0,
        comfort: 0,
        comfortPercent: 0,
        energy: 0,
        moodEmoji: '⚪',
        moodLabel: 'Not logged',
        comfortLabel: 'Not logged',
      });
    }
  }

  const avgMood = loggedCount > 0 ? Number((totalMood / loggedCount).toFixed(1)) : 3.0;
  const avgComfort = loggedCount > 0 ? Number((totalComfort / loggedCount).toFixed(1)) : 3.0;
  const avgComfortPercent = Math.round((avgComfort / 5) * 100);

  // Compute trend (first half vs second half of the week)
  const half = Math.floor(chartPoints.length / 2);
  const firstHalf = chartPoints.slice(0, half).filter((p) => p.hasEntry);
  const secondHalf = chartPoints.slice(half).filter((p) => p.hasEntry);

  const firstMoodAvg = firstHalf.length > 0 ? firstHalf.reduce((s, p) => s + p.mood, 0) / firstHalf.length : avgMood;
  const secondMoodAvg = secondHalf.length > 0 ? secondHalf.reduce((s, p) => s + p.mood, 0) / secondHalf.length : avgMood;

  const weeklyTrendMood: 'improving' | 'stable' | 'declining' =
    secondMoodAvg > firstMoodAvg + 0.3 ? 'improving' : secondMoodAvg < firstMoodAvg - 0.3 ? 'declining' : 'stable';

  const firstComfortAvg = firstHalf.length > 0 ? firstHalf.reduce((s, p) => s + p.comfort, 0) / firstHalf.length : avgComfort;
  const secondComfortAvg = secondHalf.length > 0 ? secondHalf.reduce((s, p) => s + p.comfort, 0) / secondHalf.length : avgComfort;

  const weeklyTrendComfort: 'improving' | 'stable' | 'declining' =
    secondComfortAvg > firstComfortAvg + 0.3 ? 'improving' : secondComfortAvg < firstComfortAvg - 0.3 ? 'declining' : 'stable';

  // Check if comfort is low for multiple days (Alert condition)
  const recentLowComfort = secondHalf.filter((p) => p.comfort > 0 && p.comfort <= 2).length >= 2;

  const summary: WellnessTrendsSummary = {
    entriesCount: loggedCount,
    averageMood: avgMood,
    averageComfort: avgComfort,
    averageComfortPercent: avgComfortPercent,
    dominantMood: avgMood >= 4.5 ? 'Joyful 😄' : avgMood >= 3.5 ? 'Good / Peaceful 🙂' : avgMood >= 2.5 ? 'Moderate 😐' : 'Low 😟',
    streakDays: loggedCount,
    weeklyTrendMood,
    weeklyTrendComfort,
    alertRecommended: recentLowComfort,
  };

  return { chartPoints, summary };
}

// Reactive subscriptions
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeWellnessCheckins(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(): void {
  listeners.forEach((l) => {
    try {
      l();
    } catch (e) {
      console.error('Error in wellness check-in listener:', e);
    }
  });
}
