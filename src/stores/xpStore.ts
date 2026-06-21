import { create } from 'zustand';
import { persist } from '../lib/persistence';

type Level = 'Zombie' | 'Waking Up' | 'Struggling' | 'Recovering' | 'Restoring' | 'Thriving' | 'Ascended';

interface LevelInfo {
  name: Level;
  minXP: number;
  maxXP: number;
  progress: number;
}

const LEVEL_THRESHOLDS: { name: Level; minXP: number }[] = [
  { name: 'Zombie', minXP: 0 },
  { name: 'Waking Up', minXP: 500 },
  { name: 'Struggling', minXP: 1500 },
  { name: 'Recovering', minXP: 3500 },
  { name: 'Restoring', minXP: 7000 },
  { name: 'Thriving', minXP: 13000 },
  { name: 'Ascended', minXP: 25000 },
];

const XP_REWARDS = {
  TASK_LOW: 10,
  TASK_MEDIUM: 20,
  TASK_HIGH: 40,
  TASK_CRITICAL: 75,
  FOCUS_SESSION: 30,
  FOCUS_DEEP_WORK: 50,
  PRAYER: 15,
  UNDER_LIMIT: 25,
  STREAK_MILESTONE: 100,
};

const XP_DEDUCTIONS = {
  BLOCKED_ATTEMPT: 5,
  LIMIT_EXCEEDED: 30,
  TASK_ABANDONED: 20,
};

function getLevelInfo(xp: number): LevelInfo {
  let currentLevel = LEVEL_THRESHOLDS[0];
  let nextLevel = LEVEL_THRESHOLDS[1];

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].minXP) {
      currentLevel = LEVEL_THRESHOLDS[i];
      nextLevel = LEVEL_THRESHOLDS[i + 1] || LEVEL_THRESHOLDS[i];
      break;
    }
  }

  const range = nextLevel.minXP - currentLevel.minXP;
  const progress = range > 0 ? Math.min((xp - currentLevel.minXP) / range, 1) : 1;

  return {
    name: currentLevel.name,
    minXP: currentLevel.minXP,
    maxXP: nextLevel.minXP,
    progress,
  };
}

interface XPState {
  xp: number;
  level: Level;
  levelInfo: LevelInfo;
  history: { amount: number; reason: string; timestamp: string }[];
  addXP: (amount: number, reason: string) => void;
  deductXP: (amount: number, reason: string) => void;
  setXP: (xp: number) => void;
}

export const XP_REWARDS_CONST = XP_REWARDS;
export const XP_DEDUCTIONS_CONST = XP_DEDUCTIONS;

export const useXPStore = create<XPState>()(
  persist(
    {
      name: 'xp',
    },
    (set, get) => ({
      xp: 0,
      level: 'Zombie',
      levelInfo: getLevelInfo(0),
      history: [],

      addXP: (amount, reason) => {
        const newXP = get().xp + amount;
        const levelInfo = getLevelInfo(newXP);
        set({
          xp: newXP,
          level: levelInfo.name,
          levelInfo,
          history: [
            { amount, reason, timestamp: new Date().toISOString() },
            ...get().history.slice(0, 49),
          ],
        });
      },

      deductXP: (amount, reason) => {
        const newXP = Math.max(0, get().xp - amount);
        const levelInfo = getLevelInfo(newXP);
        set({
          xp: newXP,
          level: levelInfo.name,
          levelInfo,
          history: [
            { amount: -amount, reason, timestamp: new Date().toISOString() },
            ...get().history.slice(0, 49),
          ],
        });
      },

      setXP: (xp) => {
        const levelInfo = getLevelInfo(xp);
        set({ xp, level: levelInfo.name, levelInfo });
      },
    })
  )
);
