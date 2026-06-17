import { create } from 'zustand';
import { persist } from '../lib/persistence';

interface BrainScoreBreakdown {
  screenTimeScore: number;
  taskScore: number;
  focusScore: number;
  prayerScore: number;
  sleepScore: number;
}

interface BrainScoreEntry {
  id: string;
  date: string;
  score: number;
  breakdown: BrainScoreBreakdown;
}

interface BrainScoreState {
  currentScore: number;
  scores: BrainScoreEntry[];
  breakdown: BrainScoreBreakdown;
  isLoading: boolean;
  calculateScore: (data: {
    screenTimeMinutes: number;
    screenTimeLimit: number;
    tasksCompleted: number;
    tasksTotal: number;
    focusSessions: number;
    prayersCompleted: number;
    prayersTotal: number;
    sleepHour: number;
    religionEnabled: boolean;
  }) => number;
  setScore: (score: number, breakdown: BrainScoreBreakdown) => void;
  getLevelName: () => string;
}

const SCORE_LABELS = [
  { min: 0, max: 20, label: 'Zombie' },
  { min: 20, max: 40, label: 'Waking Up' },
  { min: 40, max: 60, label: 'Struggling' },
  { min: 60, max: 75, label: 'Recovering' },
  { min: 75, max: 85, label: 'Healing' },
  { min: 85, max: 95, label: 'Thriving' },
  { min: 95, max: 100, label: 'Ascended' },
];

function calculateSubScore(value: number, thresholds: number[]): number {
  for (let i = 0; i < thresholds.length; i++) {
    if (value <= thresholds[i]) return 100 - i * 30;
  }
  return 0;
}

export const useBrainScoreStore = create<BrainScoreState>()(
  persist(
    {
      name: 'brain_score',
      partialize: (state) => ({
        currentScore: state.currentScore,
        breakdown: state.breakdown,
        scores: state.scores.slice(0, 30),
      }),
    },
    (set, get) => ({
      currentScore: 0,
      scores: [],
      breakdown: {
        screenTimeScore: 0,
        taskScore: 0,
        focusScore: 0,
        prayerScore: 0,
        sleepScore: 0,
      },
      isLoading: false,

      calculateScore: (data) => {
        const screenTimeRatio = data.screenTimeMinutes / data.screenTimeLimit;
        const screenTimeScore = calculateSubScore(screenTimeRatio, [1, 1.2, 1.5, 2]);

        const taskRatio = data.tasksCompleted / data.tasksTotal;
        const taskScore = calculateSubScore(taskRatio, [0.9, 0.75, 0.5, 0.25]);

        let focusScore: number;
        if (data.focusSessions >= 2) focusScore = 100;
        else if (data.focusSessions === 1) focusScore = 70;
        else focusScore = 20;

        const prayerRatio = data.religionEnabled
          ? data.prayersCompleted / data.prayersTotal
          : 1;
        const prayerScore = data.religionEnabled
          ? calculateSubScore(prayerRatio, [1, 0.8, 0.6, 0.4])
          : 100;

        let sleepScore: number;
        if (data.sleepHour <= 23) sleepScore = 100;
        else if (data.sleepHour <= 0) sleepScore = 70;
        else if (data.sleepHour <= 2) sleepScore = 30;
        else sleepScore = 0;

        const breakdown: BrainScoreBreakdown = {
          screenTimeScore,
          taskScore,
          focusScore,
          prayerScore,
          sleepScore,
        };

        const totalScore = Math.round(
          screenTimeScore * 0.3 +
          taskScore * 0.25 +
          focusScore * 0.2 +
          prayerScore * 0.15 +
          sleepScore * 0.1
        );

        // Upsert today's snapshot so analytics has real history.
        const today = new Date().toISOString().split('T')[0];
        const existing: BrainScoreEntry[] = get().scores;
        const todayIndex = existing.findIndex((e: BrainScoreEntry) => e.date === today);
        const entry: BrainScoreEntry = {
          id: todayIndex >= 0 ? existing[todayIndex].id : `bs_${Date.now()}`,
          date: today,
          score: totalScore,
          breakdown,
        };
        const scores =
          todayIndex >= 0
            ? existing.map((e: BrainScoreEntry, i: number) => (i === todayIndex ? entry : e))
            : [entry, ...existing].slice(0, 30);

        set({ currentScore: totalScore, breakdown, scores });
        return totalScore;
      },

      setScore: (score, breakdown) => {
        set({ currentScore: score, breakdown });
      },

      getLevelName: () => {
        const score = get().currentScore;
        for (const label of SCORE_LABELS) {
          if (score >= label.min && score < label.max) return label.label;
        }
        return 'Ascended';
      },
    })
  )
);

export type { BrainScoreBreakdown, BrainScoreEntry };
