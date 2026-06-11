import { create } from 'zustand';
import { Streak } from '../services/backend/interface';
import { backendService } from '../services/backend';

interface StreakState {
  streaks: Streak[];
  isLoading: boolean;
  fetchStreaks: (userId: string) => Promise<void>;
  incrementStreak: (userId: string, type: Streak['type']) => Promise<void>;
  breakStreak: (userId: string, type: Streak['type']) => Promise<void>;
  useShield: (userId: string, type: Streak['type']) => Promise<boolean>;
  getStreak: (type: Streak['type']) => Streak | undefined;
}

export const useStreakStore = create<StreakState>((set, get) => ({
  streaks: [],
  isLoading: false,

  fetchStreaks: async (userId) => {
    set({ isLoading: true });
    try {
      const streaks = await backendService.getStreaks(userId);
      set({ streaks, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  incrementStreak: async (userId, type) => {
    const today = new Date().toISOString().split('T')[0];
    const existing = get().streaks.find((s) => s.type === type);
    const newDays = (existing?.currentDays ?? 0) + 1;
    const longestDays = Math.max(newDays, existing?.longestDays ?? 0);

    try {
      const updated = await backendService.updateStreak(userId, type, {
        currentDays: newDays,
        longestDays,
        lastDate: today,
      });
      set({
        streaks: get().streaks.map((s) =>
          s.type === type ? updated : s
        ),
      });
    } catch (error) {
      console.error('Failed to increment streak:', error);
    }
  },

  breakStreak: async (userId, type) => {
    try {
      const updated = await backendService.updateStreak(userId, type, {
        currentDays: 0,
      });
      set({
        streaks: get().streaks.map((s) =>
          s.type === type ? updated : s
        ),
      });
    } catch (error) {
      console.error('Failed to break streak:', error);
    }
  },

  useShield: async (userId, type) => {
    const streak = get().streaks.find((s) => s.type === type);
    if (!streak || streak.shieldsUsed >= 2) return false;

    try {
      const updated = await backendService.updateStreak(userId, type, {
        shieldsUsed: streak.shieldsUsed + 1,
      });
      set({
        streaks: get().streaks.map((s) =>
          s.type === type ? updated : s
        ),
      });
      return true;
    } catch {
      return false;
    }
  },

  getStreak: (type) => {
    return get().streaks.find((s) => s.type === type);
  },
}));
