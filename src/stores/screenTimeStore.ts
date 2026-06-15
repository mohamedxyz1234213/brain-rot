import { create } from 'zustand';
import { AppLimit, ScreenTimeLog } from '../services/backend/interface';
import { persist } from '../lib/persistence';

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
}

const generateId = () => `st_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const useScreenTimeStore = create<ScreenTimeState>()(
  persist(
    {
      name: 'screen_time',
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
        const limit: AppLimit = { ...limitData, id: generateId(), isEnabled: true, isHardBlock: false };
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
          const log = get().logs.find((lg: ScreenTimeLog) => lg.appBundleId === l.appBundleId);
          return log && log.minutesUsed > l.dailyLimitMinutes;
        });
      },

      setLimits: (limits) => {
        set({ limits });
      },
    })
  )
);
