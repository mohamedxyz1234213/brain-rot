import { calculateBrainScore } from '../src/services/brainScoreCalculator';

describe('brainScoreCalculator', () => {
  it('returns 100 when all metrics are perfect', () => {
    const result = calculateBrainScore({
      minutesUsed: 60,
      minutesLimit: 120,
      tasksCompleted: 5,
      tasksTotal: 5,
      focusSessionsCompleted: 2,
      focusSessionsInterrupted: 0,
      prayersCompleted: 5,
      prayersTotal: 5,
      religionEnabled: true,
      lastScreenOffHour: 22,
    });
    expect(result.score).toBe(100);
    expect(result.breakdown).toHaveLength(5);
  });

  it('returns low score when everything is terrible', () => {
    const result = calculateBrainScore({
      minutesUsed: 300,
      minutesLimit: 60,
      tasksCompleted: 0,
      tasksTotal: 5,
      focusSessionsCompleted: 0,
      focusSessionsInterrupted: 3,
      prayersCompleted: 0,
      prayersTotal: 5,
      religionEnabled: true,
      lastScreenOffHour: 3,
    });
    expect(result.score).toBeLessThan(20);
    expect(result.breakdown.every((b) => b.score >= 0)).toBe(true);
  });

  it('defaults prayer score to 100 when religion is disabled', () => {
    const result = calculateBrainScore({
      minutesUsed: 60,
      minutesLimit: 120,
      tasksCompleted: 5,
      tasksTotal: 5,
      focusSessionsCompleted: 2,
      focusSessionsInterrupted: 0,
      prayersCompleted: 0,
      prayersTotal: 5,
      religionEnabled: false,
      lastScreenOffHour: 22,
    });
    expect(result.prayerScore).toBe(100);
    expect(result.score).toBe(100);
  });

  it('clamps score between 0 and 100', () => {
    const result = calculateBrainScore({
      minutesUsed: 0,
      minutesLimit: 1,
      tasksCompleted: 100,
      tasksTotal: 100,
      focusSessionsCompleted: 99,
      focusSessionsInterrupted: 0,
      prayersCompleted: 5,
      prayersTotal: 5,
      religionEnabled: true,
      lastScreenOffHour: 21,
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
