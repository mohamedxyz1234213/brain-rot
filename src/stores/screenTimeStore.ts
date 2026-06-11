import { create } from 'zustand';
import { AppLimit, ScreenTimeLog } from '../services/backend/interface';
import { backendService } from '../services/backend';

interface ScreenTimeState {
  logs: ScreenTimeLog[];
  limits: AppLimit[];
  isLoading: boolean;
  totalMinutesToday: number;
  fetchLogs: (userId: string, date: string) => Promise<void>;
  fetchLimits: (userId: string) => Promise<void>;
  setAppLimit: (limit: Omit<AppLimit, 'id'>) => Promise<void>;
  updateAppLimit: (limitId: string, data: Partial<AppLimit>) => Promise<void>;
  deleteAppLimit: (limitId: string) => Promise<void>;
}

export const useScreenTimeStore = create<ScreenTimeState>((set, get) => ({
  logs: [],
  limits: [],
  isLoading: false,
  totalMinutesToday: 0,

  fetchLogs: async (userId, date) => {
    set({ isLoading: true });
    try {
      const logs = await backendService.getScreenTimeLogs(userId, date);
      const totalMinutesToday = logs.reduce((sum, l) => sum + l.minutesUsed, 0);
      set({ logs, totalMinutesToday, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchLimits: async (userId) => {
    try {
      const limits = await backendService.getAppLimits(userId);
      set({ limits });
    } catch {
      // silent
    }
  },

  setAppLimit: async (limit) => {
    try {
      const newLimit = await backendService.setAppLimit(limit);
      set({ limits: [...get().limits, newLimit] });
    } catch (error) {
      console.error('Failed to set app limit:', error);
    }
  },

  updateAppLimit: async (limitId, data) => {
    try {
      const updated = await backendService.updateAppLimit(limitId, data);
      set({ limits: get().limits.map((l) => (l.id === limitId ? updated : l)) });
    } catch (error) {
      console.error('Failed to update app limit:', error);
    }
  },

  deleteAppLimit: async (limitId) => {
    try {
      await backendService.deleteAppLimit(limitId);
      set({ limits: get().limits.filter((l) => l.id !== limitId) });
    } catch (error) {
      console.error('Failed to delete app limit:', error);
    }
  },
}));
