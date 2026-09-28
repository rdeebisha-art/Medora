import { describe, it, expect, beforeEach } from 'vitest';
import {
  DEFAULT_TARGETS,
  GOAL_PRESETS,
  getDailyTargets,
  saveDailyTargets,
  getDailyProgress,
  saveDailyProgress,
  logQuickProgress,
  setExactProgress,
  resetDailyProgress,
  getGoalSummary,
  calculateStreak,
  getWeeklyGoalHistory,
  getTodayDateString,
  clearHealthGoalsStorage
} from '../healthGoalsService';

describe('Health Goals Service', () => {
  const TEST_USER_ID = 999;
  const TEST_DATE = '2026-09-28';

  beforeEach(() => {
    clearHealthGoalsStorage();
  });

  it('provides sensible default targets when none are saved', () => {
    const targets = getDailyTargets(TEST_USER_ID);
    expect(targets.hydrationMl).toBe(DEFAULT_TARGETS.hydrationMl);
    expect(targets.steps).toBe(DEFAULT_TARGETS.steps);
    expect(targets.restHours).toBe(DEFAULT_TARGETS.restHours);
  });

  it('allows users to save and retrieve custom daily targets', () => {
    saveDailyTargets(TEST_USER_ID, {
      hydrationMl: 3000,
      steps: 10000,
      restHours: 7.5,
    });

    const saved = getDailyTargets(TEST_USER_ID);
    expect(saved.hydrationMl).toBe(3000);
    expect(saved.steps).toBe(10000);
    expect(saved.restHours).toBe(7.5);
  });

  it('allows quick incremental logging for hydration, steps, and rest', () => {
    // Reset to 0 for controlled testing
    resetDailyProgress(TEST_USER_ID, TEST_DATE);

    // Add 250ml water
    const afterWater = logQuickProgress(TEST_USER_ID, 'hydration', 250, TEST_DATE);
    expect(afterWater.hydrationMl).toBe(250);

    // Add another 500ml water
    const afterMoreWater = logQuickProgress(TEST_USER_ID, 'hydration', 500, TEST_DATE);
    expect(afterMoreWater.hydrationMl).toBe(750);

    // Add 1000 steps
    const afterSteps = logQuickProgress(TEST_USER_ID, 'steps', 1000, TEST_DATE);
    expect(afterSteps.steps).toBe(1000);

    // Add 1.5 hours rest
    const afterRest = logQuickProgress(TEST_USER_ID, 'rest', 1.5, TEST_DATE);
    expect(afterRest.restHours).toBe(1.5);
  });

  it('allows setting exact progress values', () => {
    resetDailyProgress(TEST_USER_ID, TEST_DATE);

    setExactProgress(TEST_USER_ID, 'hydration', 2200, TEST_DATE);
    setExactProgress(TEST_USER_ID, 'steps', 8500, TEST_DATE);
    setExactProgress(TEST_USER_ID, 'rest', 8.2, TEST_DATE);

    const progress = getDailyProgress(TEST_USER_ID, TEST_DATE);
    expect(progress.hydrationMl).toBe(2200);
    expect(progress.steps).toBe(8500);
    expect(progress.restHours).toBe(8.2);
  });

  it('computes percentages, goalsMetCount, distance, and calories accurately in summary', () => {
    saveDailyTargets(TEST_USER_ID, {
      hydrationMl: 2000,
      steps: 10000,
      restHours: 8.0,
    });

    resetDailyProgress(TEST_USER_ID, TEST_DATE);
    setExactProgress(TEST_USER_ID, 'hydration', 2000, TEST_DATE); // 100%
    setExactProgress(TEST_USER_ID, 'steps', 5000, TEST_DATE);     // 50%
    setExactProgress(TEST_USER_ID, 'rest', 8.0, TEST_DATE);      // 100%

    const summary = getGoalSummary(TEST_USER_ID, TEST_DATE);

    expect(summary.hydrationPct).toBe(100);
    expect(summary.stepsPct).toBe(50);
    expect(summary.restPct).toBe(100);
    expect(summary.goalsMetCount).toBe(2);
    expect(summary.allGoalsMet).toBe(false);

    // 5000 steps ~ 3.8 km (5000 * 0.00075)
    expect(summary.distanceKm).toBe(3.8);
    // 5000 steps * 0.04 ~ 200 kcal
    expect(summary.caloriesBurned).toBe(200);

    // Now achieve all 3 targets
    setExactProgress(TEST_USER_ID, 'steps', 10000, TEST_DATE);
    const completeSummary = getGoalSummary(TEST_USER_ID, TEST_DATE);
    expect(completeSummary.goalsMetCount).toBe(3);
    expect(completeSummary.allGoalsMet).toBe(true);
  });

  it('resets logged progress without altering saved targets', () => {
    saveDailyTargets(TEST_USER_ID, {
      hydrationMl: 3200,
      steps: 12000,
      restHours: 7.0,
    });

    setExactProgress(TEST_USER_ID, 'hydration', 1500, TEST_DATE);
    setExactProgress(TEST_USER_ID, 'steps', 6000, TEST_DATE);
    setExactProgress(TEST_USER_ID, 'rest', 6.0, TEST_DATE);

    resetDailyProgress(TEST_USER_ID, TEST_DATE);

    const progress = getDailyProgress(TEST_USER_ID, TEST_DATE);
    expect(progress.hydrationMl).toBe(0);
    expect(progress.steps).toBe(0);
    expect(progress.restHours).toBe(0);

    const targets = getDailyTargets(TEST_USER_ID);
    expect(targets.hydrationMl).toBe(3200);
    expect(targets.steps).toBe(12000);
  });

  it('includes built-in rural presets with appropriate values', () => {
    expect(GOAL_PRESETS.length).toBeGreaterThanOrEqual(4);
    const elderly = GOAL_PRESETS.find(p => p.id === 'elderly_gentle');
    expect(elderly).toBeDefined();
    expect(elderly?.targets.steps).toBeLessThanOrEqual(5000);
    expect(elderly?.targets.restHours).toBeGreaterThanOrEqual(8.0);
  });

  it('generates 7-day weekly history array', () => {
    const history = getWeeklyGoalHistory(TEST_USER_ID, TEST_DATE);
    expect(history.length).toBe(7);
    expect(history[6].date).toBe(TEST_DATE);
  });
});
