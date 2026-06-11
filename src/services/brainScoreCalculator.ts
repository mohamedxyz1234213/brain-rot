/**
 * Brain Score Calculator
 * 
 * Score = 
 *   screenTimeScore × 30%
 *   taskScore × 25%
 *   focusScore × 20%
 *   prayerScore × 15%
 *   sleepScore × 10%
 */

interface BrainScoreInput {
  // Screen time
  minutesUsed: number;
  minutesLimit: number;
  // Tasks
  tasksCompleted: number;
  tasksTotal: number;
  // Focus
  focusSessionsCompleted: number;
  focusSessionsInterrupted: number;
  // Prayer (set to -1 if disabled)
  prayersCompleted: number;
  prayersTotal: number;
  religionEnabled: boolean;
  // Sleep
  lastScreenOffHour: number; // 0-23, e.g., 23 = 11pm, 0 = midnight, 2 = 2am
}

interface BrainScoreResult {
  score: number;
  screenTimeScore: number;
  taskScore: number;
  focusScore: number;
  prayerScore: number;
  sleepScore: number;
  breakdown: {
    category: string;
    score: number;
    weight: number;
    weighted: number;
  }[];
}

export function calculateBrainScore(input: BrainScoreInput): BrainScoreResult {
  const screenTimeScore = calculateScreenTimeScore(input.minutesUsed, input.minutesLimit);
  const taskScore = calculateTaskScore(input.tasksCompleted, input.tasksTotal);
  const focusScore = calculateFocusScore(input.focusSessionsCompleted, input.focusSessionsInterrupted);
  const prayerScore = input.religionEnabled
    ? calculatePrayerScore(input.prayersCompleted, input.prayersTotal)
    : 100; // Default to 100 if religion disabled
  const sleepScore = calculateSleepScore(input.lastScreenOffHour);

  // Apply weights
  const weights = {
    screenTime: 0.30,
    task: 0.25,
    focus: 0.20,
    prayer: 0.15,
    sleep: 0.10,
  };

  const score = Math.round(
    screenTimeScore * weights.screenTime +
    taskScore * weights.task +
    focusScore * weights.focus +
    prayerScore * weights.prayer +
    sleepScore * weights.sleep
  );

  return {
    score: Math.max(0, Math.min(100, score)),
    screenTimeScore,
    taskScore,
    focusScore,
    prayerScore,
    sleepScore,
    breakdown: [
      { category: 'Screen Time', score: screenTimeScore, weight: weights.screenTime, weighted: Math.round(screenTimeScore * weights.screenTime) },
      { category: 'Tasks', score: taskScore, weight: weights.task, weighted: Math.round(taskScore * weights.task) },
      { category: 'Focus', score: focusScore, weight: weights.focus, weighted: Math.round(focusScore * weights.focus) },
      { category: 'Prayer', score: prayerScore, weight: weights.prayer, weighted: Math.round(prayerScore * weights.prayer) },
      { category: 'Sleep', score: sleepScore, weight: weights.sleep, weighted: Math.round(sleepScore * weights.sleep) },
    ],
  };
}

function calculateScreenTimeScore(used: number, limit: number): number {
  if (limit <= 0) return 50;
  const ratio = used / limit;
  if (ratio <= 0.5) return 100;
  if (ratio <= 0.75) return 85;
  if (ratio <= 1.0) return 70;
  if (ratio <= 1.2) return 40;
  if (ratio <= 1.5) return 10;
  return 0;
}

function calculateTaskScore(completed: number, total: number): number {
  if (total === 0) return 50; // No tasks = neutral
  const ratio = completed / total;
  if (ratio >= 0.9) return 100;
  if (ratio >= 0.75) return 80;
  if (ratio >= 0.5) return 50;
  if (ratio >= 0.25) return 20;
  return 0;
}

function calculateFocusScore(completed: number, interrupted: number): number {
  const total = completed + interrupted;
  if (total === 0) return 20; // No sessions attempted
  if (completed >= 2 && interrupted === 0) return 100;
  if (completed >= 2) return 85;
  if (completed === 1 && interrupted === 0) return 70;
  if (completed === 1) return 40;
  return 20;
}

function calculatePrayerScore(completed: number, total: number): number {
  if (total === 0) return 100;
  if (completed >= 5) return 100;
  if (completed === 4) return 80;
  if (completed === 3) return 60;
  if (completed === 2) return 30;
  return 0;
}

function calculateSleepScore(lastScreenOffHour: number): number {
  // Convert to a simple scale based on when the screen went off
  if (lastScreenOffHour >= 20 && lastScreenOffHour <= 22) return 100; // 8-10pm
  if (lastScreenOffHour === 23) return 100; // 11pm
  if (lastScreenOffHour === 0) return 70;  // midnight
  if (lastScreenOffHour === 1) return 30;  // 1am
  if (lastScreenOffHour >= 2 && lastScreenOffHour <= 5) return 0; // 2am+
  return 70; // daytime (unusual but not penalized heavily)
}
