import { create } from 'zustand';
import { persist } from '../lib/persistence';

type FocusMode = 'pomodoro' | 'deep_work' | 'flow' | 'quick_sprint';

interface FocusSession {
  id: string;
  mode: FocusMode;
  startedAt: string;
  endedAt?: string;
  targetMinutes: number;
  actualMinutes: number;
  taskId?: string;
  distractionCount: number;
  completed: boolean;
}

const MODE_DURATIONS: Record<FocusMode, number> = {
  pomodoro: 25,
  deep_work: 90,
  flow: 60,
  quick_sprint: 15,
};

interface FocusState {
  sessions: FocusSession[];
  activeSession: FocusSession | null;
  isActive: boolean;
  remainingSeconds: number;
  totalFocusMinutesToday: number;
  startSession: (mode: FocusMode, taskId?: string) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: (completed: boolean) => void;
  logDistraction: () => void;
  tickTimer: () => void;
  getModeDuration: (mode: FocusMode) => number;
}

const generateId = () => `focus_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const useFocusStore = create<FocusState>()(
  persist(
    {
      name: 'focus',
      partialize: (state) => ({
        sessions: state.sessions.slice(0, 20),
        totalFocusMinutesToday: state.totalFocusMinutesToday,
      }),
    },
    (set, get) => ({
      sessions: [],
      activeSession: null,
      isActive: false,
      remainingSeconds: 0,
      totalFocusMinutesToday: 0,

      startSession: (mode, taskId) => {
        const duration = MODE_DURATIONS[mode];
        const session: FocusSession = {
          id: generateId(),
          mode,
          startedAt: new Date().toISOString(),
          targetMinutes: duration,
          actualMinutes: 0,
          taskId,
          distractionCount: 0,
          completed: false,
        };
        set({
          activeSession: session,
          isActive: true,
          remainingSeconds: duration * 60,
        });
      },

      pauseSession: () => {
        set({ isActive: false });
      },

      resumeSession: () => {
        set({ isActive: true });
      },

      endSession: (completed) => {
        const session = get().activeSession;
        if (!session) return;

        const elapsed = session.targetMinutes * 60 - get().remainingSeconds;
        const actualMinutes = Math.floor(elapsed / 60);

        const ended: FocusSession = {
          ...session,
          endedAt: new Date().toISOString(),
          actualMinutes,
          completed,
          distractionCount: session.distractionCount,
        };

        set({
          sessions: [...get().sessions, ended],
          activeSession: null,
          isActive: false,
          remainingSeconds: 0,
          totalFocusMinutesToday: get().totalFocusMinutesToday + actualMinutes,
        });
      },

      logDistraction: () => {
        const session = get().activeSession;
        if (!session) return;
        set({
          activeSession: {
            ...session,
            distractionCount: session.distractionCount + 1,
          },
        });
      },

      tickTimer: () => {
        const { remainingSeconds, isActive } = get();
        if (!isActive || remainingSeconds <= 0) return;
        set({ remainingSeconds: remainingSeconds - 1 });
      },

      getModeDuration: (mode) => MODE_DURATIONS[mode],
    })
  )
);

export type { FocusMode, FocusSession };
export { MODE_DURATIONS };
