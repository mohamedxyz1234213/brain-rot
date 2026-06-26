import { create } from 'zustand';
import { getActiveUserStorageSuffix, persist } from '../lib/persistence';

type StreakType = 'screen_time' | 'tasks' | 'prayers' | 'focus' | 'no_social' | 'fasting';

interface Streak {
  id: string;
  type: StreakType;
  currentDays: number;
  longestDays: number;
  lastDate: string;
  shieldsUsed: number;
  maxShields: number;
  fireLevel: number;
}

interface StreakState {
  streaks: Streak[];
  isLoading: boolean;
  incrementStreak: (type: StreakType) => void;
  breakStreak: (type: StreakType) => void;
  useShield: (type: StreakType) => boolean;
  getStreak: (type: StreakType) => Streak | undefined;
  getMaxStreak: () => Streak | undefined;
  resetStreaks: () => void;
}

function getFireLevel(days: number): number {
  if (days >= 30) return 3;
  if (days >= 7) return 2;
  if (days >= 1) return 1;
  return 0;
}

export const useStreakStore = create<StreakState>()(
  persist(
    {
      name: 'streaks',
      getStorageKeySuffix: getActiveUserStorageSuffix,
      partialize: (state: any) => ({ streaks: state.streaks }),
    },
    (set, get) => ({
      streaks: [],
      isLoading: false,

      incrementStreak: (type) => {
        const today = new Date().toISOString().split('T')[0];
        set({
          streaks: get().streaks.map((s: Streak) =>
            s.type === type
              ? {
                  ...s,
                  currentDays: s.lastDate.startsWith(today) ? s.currentDays : s.currentDays + 1,
                  longestDays: Math.max(s.longestDays, s.currentDays + 1),
                  lastDate: today,
                  fireLevel: getFireLevel(s.currentDays + 1),
                }
              : s
          ),
        });
      },

      breakStreak: (type) => {
        set({
          streaks: get().streaks.map((s: Streak) =>
            s.type === type ? { ...s, currentDays: 0, fireLevel: 0 } : s
          ),
        });
      },

      useShield: (type) => {
        const streak = get().streaks.find((s: Streak) => s.type === type);
        if (!streak || streak.shieldsUsed >= streak.maxShields) return false;
        set({
          streaks: get().streaks.map((s: Streak) =>
            s.type === type ? { ...s, shieldsUsed: s.shieldsUsed + 1 } : s
          ),
        });
        return true;
      },

      getStreak: (type) => {
        return get().streaks.find((s: Streak) => s.type === type);
      },

      getMaxStreak: () => {
        const streaks = get().streaks;
        return streaks.reduce((max: Streak | undefined, s: Streak) =>
          max && max.currentDays > s.currentDays ? max : s, undefined as Streak | undefined
        );
      },

      resetStreaks: () => {
        set({ streaks: [], isLoading: false });
      },
    })
  )
);

export type { StreakType, Streak };
