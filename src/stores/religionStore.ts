import { create } from 'zustand';
import { PrayerLog, QuranProgress } from '../services/backend/interface';
import { backendService } from '../services/backend';

type Prayer = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

interface ReligionState {
  prayerLogs: PrayerLog[];
  quranProgress: QuranProgress | null;
  isLoading: boolean;
  fetchPrayerLogs: (userId: string, date: string) => Promise<void>;
  logPrayer: (log: Omit<PrayerLog, 'id'>) => Promise<void>;
  fetchQuranProgress: (userId: string) => Promise<void>;
  updateQuranProgress: (userId: string, data: Partial<QuranProgress>) => Promise<void>;
}

export const useReligionStore = create<ReligionState>((set, get) => ({
  prayerLogs: [],
  quranProgress: null,
  isLoading: false,

  fetchPrayerLogs: async (userId, date) => {
    set({ isLoading: true });
    try {
      const prayerLogs = await backendService.getPrayerLogs(userId, date);
      set({ prayerLogs, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  logPrayer: async (log) => {
    const saved = await backendService.logPrayer(log);
    set({ prayerLogs: [...get().prayerLogs, saved] });
  },

  fetchQuranProgress: async (userId) => {
    try {
      const quranProgress = await backendService.getQuranProgress(userId);
      set({ quranProgress });
    } catch {
      // silent
    }
  },

  updateQuranProgress: async (userId, data) => {
    const updated = await backendService.updateQuranProgress(userId, data);
    set({ quranProgress: updated });
  },
}));
