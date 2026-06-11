import { create } from 'zustand';
import { BrainScore, Streak } from '../services/backend/interface';
import { backendService } from '../services/backend';

type Level = 'Zombie' | 'Waking Up' | 'Struggling' | 'Recovering' | 'Healing' | 'Thriving' | 'Ascended';

function getLevel(xp: number): Level {
  if (xp >= 25000) return 'Ascended';
  if (xp >= 13000) return 'Thriving';
  if (xp >= 7000) return 'Healing';
  if (xp >= 3500) return 'Recovering';
  if (xp >= 1500) return 'Struggling';
  if (xp >= 500) return 'Waking Up';
  return 'Zombie';
}

interface BrainScoreState {
  currentScore: number;
  scores: BrainScore[];
  streaks: Streak[];
  xp: number;
  level: Level;
  isLoading: boolean;
  fetchScores: (userId: string) => Promise<void>;
  fetchStreaks: (userId: string) => Promise<void>;
  addXP: (amount: number) => void;
  deductXP: (amount: number) => void;
}

export const useBrainScoreStore = create<BrainScoreState>((set, get) => ({
  currentScore: 0,
  scores: [],
  streaks: [],
  xp: 0,
  level: 'Zombie',
  isLoading: false,

  fetchScores: async (userId) => {
    set({ isLoading: true });
    try {
      const scores = await backendService.getBrainScores(userId);
      const currentScore = scores[0]?.score ?? 0;
      set({ scores, currentScore, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchStreaks: async (userId) => {
    try {
      const streaks = await backendService.getStreaks(userId);
      set({ streaks });
    } catch {
      // silent fail
    }
  },

  addXP: (amount) => {
    const newXP = get().xp + amount;
    set({ xp: newXP, level: getLevel(newXP) });
  },

  deductXP: (amount) => {
    const newXP = Math.max(0, get().xp - amount);
    set({ xp: newXP, level: getLevel(newXP) });
  },
}));
