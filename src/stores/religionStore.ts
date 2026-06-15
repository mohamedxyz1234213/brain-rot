import { create } from 'zustand';
import { persist } from '../lib/persistence';

type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
type PrayerStatus = 'pending' | 'on_time' | 'late' | 'missed';

interface PrayerLog {
  id: string;
  prayer: PrayerName;
  status: PrayerStatus;
  prayedAt?: string;
  date: string;
}

interface QuranProgress {
  currentSurah: number;
  currentAyah: number;
  currentJuz: number;
  currentPage: number;
  dailyPageGoal: number;
  khatmGoal: number;
  khatmCount: number;
  pagesReadToday: number;
  lastReadAt: string;
}

interface DhikrSession {
  id: string;
  dhikrId: string;
  completedCount: number;
  targetCount: number;
  isCompleted: boolean;
  startedAt: string;
}

interface ReligionState {
  prayerLogs: PrayerLog[];
  quranProgress: QuranProgress;
  dhikrSessions: DhikrSession[];
  selectedCalculationMethod: 'MWL' | 'ISNA' | 'Egypt' | 'Makkah' | 'Tehran';
  isLoading: boolean;
  logPrayer: (prayer: PrayerName, status: PrayerStatus) => void;
  updateQuranProgress: (data: Partial<QuranProgress>) => void;
  startDhikr: (dhikrId: string, targetCount: number) => void;
  incrementDhikr: () => void;
  completeDhikr: () => void;
  setCalculationMethod: (method: ReligionState['selectedCalculationMethod']) => void;
  getTodayPrayerStatuses: () => PrayerLog[];
  getPrayerCompletionRate: () => number;
}

const generateId = () => `prayer_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const useReligionStore = create<ReligionState>()(
  persist(
    {
      name: 'religion',
      partialize: (state: any) => ({
        prayerLogs: state.prayerLogs.slice(0, 50),
        quranProgress: state.quranProgress,
        selectedCalculationMethod: state.selectedCalculationMethod,
      }),
    },
    (set, get) => ({
      prayerLogs: [],
      quranProgress: {
        currentSurah: 1,
        currentAyah: 1,
        currentJuz: 1,
        currentPage: 1,
        dailyPageGoal: 5,
        khatmGoal: 1,
        khatmCount: 0,
        pagesReadToday: 0,
        lastReadAt: new Date().toISOString(),
      },
      dhikrSessions: [],
      selectedCalculationMethod: 'Makkah',
      isLoading: false,

      logPrayer: (prayer, status) => {
        const today = new Date().toISOString().split('T')[0];
        const existing = get().prayerLogs.find((l: PrayerLog) =>
          l.prayer === prayer && l.date.startsWith(today)
        );

        if (existing) {
          set({
            prayerLogs: get().prayerLogs.map((l: PrayerLog) =>
              l.id === existing.id
                ? { ...l, status, prayedAt: new Date().toISOString() }
                : l
            ),
          });
        } else {
          const log: PrayerLog = {
            id: generateId(),
            prayer,
            status,
            date: today,
            prayedAt: status !== 'missed' ? new Date().toISOString() : undefined,
          };
          set({ prayerLogs: [...get().prayerLogs, log] });
        }
      },

      updateQuranProgress: (data) => {
        set({ quranProgress: { ...get().quranProgress, ...data } });
      },

      startDhikr: (dhikrId, targetCount) => {
        const session: DhikrSession = {
          id: generateId(),
          dhikrId,
          completedCount: 0,
          targetCount,
          isCompleted: false,
          startedAt: new Date().toISOString(),
        };
        set({ dhikrSessions: [...get().dhikrSessions, session] });
      },

      incrementDhikr: () => {
        const sessions = get().dhikrSessions;
        const active = sessions[sessions.length - 1];
        if (!active || active.isCompleted) return;
        set({
          dhikrSessions: sessions.map((s: DhikrSession) =>
            s.id === active.id
              ? {
                  ...s,
                  completedCount: s.completedCount + 1,
                  isCompleted: s.completedCount + 1 >= s.targetCount,
                }
              : s
          ),
        });
      },

      completeDhikr: () => {
        const sessions = get().dhikrSessions;
        const active = sessions[sessions.length - 1];
        if (!active) return;
        set({
          dhikrSessions: sessions.map((s: DhikrSession) =>
            s.id === active.id ? { ...s, isCompleted: true } : s
          ),
        });
      },

      setCalculationMethod: (method) => {
        set({ selectedCalculationMethod: method });
      },

      getTodayPrayerStatuses: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().prayerLogs.filter((l: PrayerLog) => l.date.startsWith(today));
      },

      getPrayerCompletionRate: () => {
        const todayLogs = get().getTodayPrayerStatuses();
        const completed = todayLogs.filter((l: PrayerLog) => l.status !== 'missed' && l.status !== 'pending').length;
        return completed / 5;
      },
    })
  )
);

export type { PrayerName, PrayerStatus, PrayerLog, QuranProgress };
