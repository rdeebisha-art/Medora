import { describe, it, expect, beforeEach } from 'vitest';
import {
  logDailyWellness,
  getTodayCheckin,
  getPastWeekWellnessChartData,
  getAllWellnessEntries,
  getTodayDateString,
  MOOD_DEFINITIONS,
  COMFORT_DEFINITIONS,
} from './wellnessCheckinService';
import {
  LOCAL_PILL_DATABASE,
  searchPillDatabase,
} from '../data/medical/pillDatabase';

describe('Daily Wellness Check-in Service', () => {
  const testUserId = 'test-user-999';

  beforeEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(`medora_wellness_checkins_user_${testUserId}`);
    }
  });

  it('generates seeded 7-day history for new users so chart is populated', () => {
    const entries = getAllWellnessEntries(testUserId);
    expect(entries.length).toBeGreaterThanOrEqual(6);
    expect(entries[0].mood).toBeGreaterThanOrEqual(1);
    expect(entries[0].physicalComfort).toBeGreaterThanOrEqual(1);
  });

  it('logs a new daily wellness entry and retrieves today checkin', () => {
    const today = getTodayDateString();
    const entry = logDailyWellness(testUserId, {
      mood: 5,
      physicalComfort: 4,
      energyLevel: 5,
      symptomsNoted: ['Feeling energetic', 'Pain-free'],
      notes: 'Morning brisk walk and healthy breakfast',
      date: today,
    });

    expect(entry.mood).toBe(5);
    expect(entry.moodLabel).toBe(MOOD_DEFINITIONS[5].label);
    expect(entry.physicalComfort).toBe(4);
    expect(entry.comfortLabel).toBe(COMFORT_DEFINITIONS[4].label);
    expect(entry.comfortScorePercent).toBe(80);

    const retrievedToday = getTodayCheckin(testUserId);
    expect(retrievedToday).not.toBeNull();
    expect(retrievedToday?.mood).toBe(5);
    expect(retrievedToday?.notes).toBe('Morning brisk walk and healthy breakfast');
  });

  it('computes 7-day Recharts chart points and summary trends correctly', () => {
    // Log entries for today and yesterday
    const today = getTodayDateString();
    logDailyWellness(testUserId, {
      mood: 4,
      physicalComfort: 5,
      energyLevel: 4,
      date: today,
    });

    const { chartPoints, summary } = getPastWeekWellnessChartData(testUserId, 7);
    expect(chartPoints.length).toBe(7);

    // Verify today point exists
    const todayPoint = chartPoints.find((p) => p.isToday);
    expect(todayPoint).toBeDefined();
    expect(todayPoint?.hasEntry).toBe(true);
    expect(todayPoint?.mood).toBe(4);
    expect(todayPoint?.comfort).toBe(5);

    // Summary assertions
    expect(summary.averageMood).toBeGreaterThan(0);
    expect(summary.averageComfortPercent).toBeGreaterThan(0);
    expect(summary.streakDays).toBeGreaterThan(0);
    expect(['improving', 'stable', 'declining']).toContain(summary.weeklyTrendMood);
  });

  it('updates today checkin when logged again instead of creating duplicates', () => {
    const today = getTodayDateString();
    logDailyWellness(testUserId, {
      mood: 3,
      physicalComfort: 3,
      date: today,
      notes: 'First draft',
    });

    logDailyWellness(testUserId, {
      mood: 5,
      physicalComfort: 5,
      date: today,
      notes: 'Updated feeling much better',
    });

    const entries = getAllWellnessEntries(testUserId);
    const todayEntries = entries.filter((e) => e.date === today);
    expect(todayEntries.length).toBe(1);
    expect(todayEntries[0].mood).toBe(5);
    expect(todayEntries[0].notes).toBe('Updated feeling much better');
  });
});

describe('Local Pill Database & Cross-Reference Engine', () => {
  it('contains comprehensive medical records with dosage instructions and side effects', () => {
    expect(LOCAL_PILL_DATABASE.length).toBeGreaterThanOrEqual(15);

    for (const pill of LOCAL_PILL_DATABASE) {
      expect(pill.id).toBeTruthy();
      expect(pill.brandName).toBeTruthy();
      expect(pill.genericName).toBeTruthy();
      expect(pill.imprint).toBeTruthy();
      expect(pill.color).toBeTruthy();
      expect(pill.shape).toBeTruthy();

      // Dosage instructions validation
      expect(pill.dosageInstructions.standardAdultDose).toBeTruthy();
      expect(pill.dosageInstructions.frequency).toBeTruthy();
      expect(pill.dosageInstructions.mealRelation).toBeTruthy();
      expect(pill.dosageInstructions.maxDailyLimit).toBeTruthy();

      // Side effects validation
      expect(pill.sideEffects.common.length).toBeGreaterThan(0);
      expect(pill.sideEffects.seriousAdverseReactions.length).toBeGreaterThan(0);
      expect(pill.sideEffects.whenToSeekUrgentCare).toBeTruthy();
    }
  });

  it('accurately identifies Dolo 650 by imprint and attributes', () => {
    const matches = searchPillDatabase({
      imprint: 'DOLO 650',
      color: 'White',
      shape: 'Round',
    });

    expect(matches.length).toBeGreaterThan(0);
    const topMatch = matches[0];
    expect(topMatch.pill.brandName).toBe('Dolo 650');
    expect(topMatch.confidence).toBeGreaterThanOrEqual(95);
    expect(topMatch.pill.dosageInstructions.maxDailyLimit).toContain('4,000 mg');
  });

  it('accurately matches antibiotics like Amoxicillin capsule by color and shape', () => {
    const matches = searchPillDatabase({
      imprint: 'MOX 500',
      color: 'Two-tone Red/Yellow',
      shape: 'Capsule',
    });

    expect(matches.length).toBeGreaterThan(0);
    const topMatch = matches[0];
    expect(topMatch.pill.genericName).toContain('Amoxicillin');
    expect(topMatch.pill.dosageInstructions.duration).toContain('course');
    expect(topMatch.pill.sideEffects.whenToSeekUrgentCare).toBeTruthy();
  });

  it('matches Metformin antidiabetic medicine and provides meal relation guidance', () => {
    const matches = searchPillDatabase({
      imprint: 'MET 500',
      color: 'White',
      shape: 'Oval',
    });

    expect(matches.length).toBeGreaterThan(0);
    const topMatch = matches[0];
    expect(topMatch.pill.genericName).toContain('Metformin');
    expect(topMatch.pill.dosageInstructions.mealRelation).toContain('food');
    expect(topMatch.pill.sideEffects.seriousAdverseReactions.some(r => r.includes('Lactic Acidosis'))).toBe(true);
  });
});
