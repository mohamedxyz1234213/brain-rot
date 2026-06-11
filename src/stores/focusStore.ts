import { create } from 'zustand';
import { FocusSession } from '../services/backend/interface';
import { backendService } from '../services/backend';

type FocusMode = 'pomodoro' | 'deep_work' | 'flow' | 'quick_sprint';

interface FocusState {
  sessions: FocusSession[];
  activeSession: FocusSession | null;
  isActive: boolean;
  isLoading: boolean;
  fetchSessions: (userId: string, date?: string) => Promise<void>;
  startSession: (session: Omit<FocusSession, 'id'>) => Promise<void>;
  endSession: (sessionId: string, completed: boolean) => Promise<void>;
  logDistraction: () => void;
}

export const useFocusStore = create<FocusState>((set, get) => ({
  sessions: [],
  activeSession: null,
  isActive: false,
  isLoading: false,

  fetchSessions: async (userId, date) => {
    set({ isLoading: true });
    try {
      const sessions = await backendService.getFocusSessions(userId, date);
      set({ sessions, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  startSession: async (session) => {
    try {
      const newSession = await backendService.createFocusSession(session);
      set({ activeSession: newSession, isActive: true });
    } catch (error) {
      console.error('Failed to start focus session:', error);
    }
  },

  endSession: async (sessionId, completed) => {
    try {
      const updated = await backendService.updateFocusSession(sessionId, {
        endedAt: new Date().toISOString(),
        completed,
      });
      set({
        activeSession: null,
        isActive: false,
        sessions: [...get().sessions, updated],
      });
    } catch (error) {
      console.error('Failed to end focus session:', error);
    }
  },

  logDistraction: () => {
    const { activeSession } = get();
    if (activeSession) {
      set({
        activeSession: {
          ...activeSession,
          distractionCount: activeSession.distractionCount + 1,
        },
      });
    }
  },
}));
