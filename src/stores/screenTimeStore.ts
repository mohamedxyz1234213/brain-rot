import { create } from 'zustand';
import { AppLimit, ScreenTimeLog } from '../services/backend/interface';
import { getActiveUserStorageSuffix, persist } from '../lib/persistence';
import { backendService } from '../services/backend';

interface ScreenTimeState {
  logs: ScreenTimeLog[];
  limits: AppLimit[];
  isLoading: boolean;
  totalMinutesToday: number;
  addLog: (log: Omit<ScreenTimeLog, 'id'>) => void;
  addLimit: (limit: Omit<AppLimit, 'id'>) => void;
  updateLimit: (id: string, data: Partial<AppLimit>) => void;
  deleteLimit: (id: string) => void;
  calculateTotalMinutes: () => number;
  getOverageApps: () => AppLimit[];
  setLimits: (limits: AppLimit[]) => void;
  resetScreenTime: () => void;
  syncToday: (userId: string) => Promise<void>;
}

const generateId = () => `st_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const useScreenTimeStore = create<ScreenTimeState>()(
  persist(
    {
      name: 'screen_time',
      getStorageKeySuffix: getActiveUserStorageSuffix,
      partialize: (state: any) => ({ limits: state.limits }),
    },
    (set, get) => ({
      logs: [],
      limits: [],
      isLoading: false,
      totalMinutesToday: 0,

      addLog: (logData) => {
        const log: ScreenTimeLog = { ...logData, id: generateId() };
        const totalMinutesToday = get().totalMinutesToday + log.minutesUsed;
        set({ logs: [...get().logs, log], totalMinutesToday });
      },

      addLimit: (limitData) => {
        const limit: AppLimit = { ...limitData, id: generateId(), isEnabled: limitData.isEnabled ?? true, isHardBlock: limitData.isHardBlock ?? false };
        set({ limits: [...get().limits, limit] });
      },

      updateLimit: (id, data) => {
        set({
          limits: get().limits.map((l: AppLimit) => l.id === id ? { ...l, ...data } : l),
        });
      },

      deleteLimit: (id) => {
        set({ limits: get().limits.filter((l: AppLimit) => l.id !== id) });
      },

      calculateTotalMinutes: () => {
        const total = get().logs.reduce((sum: number, l: ScreenTimeLog) => sum + l.minutesUsed, 0);
        set({ totalMinutesToday: total });
        return total;
      },

      getOverageApps: () => {
        return get().limits.filter((l: AppLimit) => {
          if (!l.isEnabled) return false;
          const minutesUsed = get().logs
            .filter((lg: ScreenTimeLog) => lg.appBundleId === l.appBundleId)
            .reduce((sum: number, lg: ScreenTimeLog) => sum + lg.minutesUsed, 0);
          return minutesUsed >= l.dailyLimitMinutes;
        });
      },

      setLimits: (limits) => {
        set({ limits });
      },

      resetScreenTime: () => {
        set({ logs: [], limits: [], totalMinutesToday: 0, isLoading: false });
      },

      syncToday: async (userId) => {
        set({ isLoading: true });
        try {
          const today = new Date().toISOString().split('T')[0];
          const [logs, limits] = await Promise.all([
            backendService.getScreenTimeLogs(userId, today),
            backendService.getAppLimits(userId),
          ]);
          const totalMinutesToday = logs.reduce((sum, log) => sum + log.minutesUsed, 0);
          set({ logs, limits, totalMinutesToday, isLoading: false });
        } catch (error) {
          console.warn('screen time sync failed', error);
          set({ isLoading: false });
        }
      },
    })
  )
);
