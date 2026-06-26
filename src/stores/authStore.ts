import { create } from 'zustand';
import { User } from '../services/backend/interface';
import { backendService, setBackendAuthToken } from '../services/backend';
import { persist, setActiveUserStorageSuffix } from '../lib/persistence';
import { useBrainScoreStore } from './brainScoreStore';
import { useScreenTimeStore } from './screenTimeStore';
import { useTaskStore } from './taskStore';
import { useXPStore } from './xpStore';
import { useFocusStore } from './focusStore';
import { useReligionStore } from './religionStore';
import { useRoastStore } from './roastStore';
import { useStreakStore } from './streakStore';
import { useSubscriptionStore } from './subscriptionStore';
import { useGamificationStore } from './gamificationStore';
import { useDrivingStore } from './drivingStore';
import { useAccountabilityStore } from './accountabilityStore';

function resetLocalUserState() {
  useBrainScoreStore.getState().resetScores();
  useScreenTimeStore.getState().resetScreenTime();
  useTaskStore.getState().resetTasks();
  useXPStore.getState().resetXP();
  useFocusStore.getState().resetFocus();
  useReligionStore.getState().resetReligion();
  useRoastStore.getState().resetRoasts();
  useStreakStore.getState().resetStreaks();
  useSubscriptionStore.getState().resetSubscription();
  useGamificationStore.getState().resetGamification();
  useDrivingStore.getState().resetDriving();
  useAccountabilityStore.getState().resetAccountability();
}

interface AuthState {
  user: User | null;
  authToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  setUser: (user: User | null) => void;
  setAuthToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  completeAuth: (user: User, token?: string | null) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  syncCurrentUser: () => Promise<void>;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    {
      name: 'auth',
      version: 2,
      partialize: (state) => ({
        user: state.user,
        authToken: state.authToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onHydrate: (set, get) => {
        const user = get().user;
        setActiveUserStorageSuffix(user?.id);
        set({ isHydrated: true });
      },
    },
    (set, get) => ({
      user: null,
      authToken: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
        setActiveUserStorageSuffix(user?.id);
      },

      setAuthToken: (token) => {
        set({ authToken: token });
        setBackendAuthToken(token);
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      completeAuth: (user, token = null) => {
        setActiveUserStorageSuffix(user.id);
        resetLocalUserState();
        set({ user, authToken: token, isAuthenticated: true, isLoading: false });
        setBackendAuthToken(token);
      },

      logout: () => {
        set({ user: null, authToken: null, isAuthenticated: false });
        setBackendAuthToken(null);
        setActiveUserStorageSuffix(null);
        resetLocalUserState();
      },

      updateProfile: (data) => {
        const current = get().user;
        if (current) {
          if (data.name !== undefined && typeof data.name !== 'string') return;
          if (data.email !== undefined && typeof data.email !== 'string') return;
          set({ user: { ...current, ...data } });
        }
      },

      syncCurrentUser: async () => {
        const current = get().user;
        const token = get().authToken;
        if (!current || !token) return;
        setBackendAuthToken(token);
        set({ isLoading: true });
        try {
          const synced = await backendService.syncUser(current.clerkId, current);
          setActiveUserStorageSuffix(synced.id);
          set({ user: synced, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.warn('user sync failed', error);
          set({ isLoading: false });
        }
      },

      isAdmin: () => {
        const user = get().user;
        return user?.role === 'admin' || user?.email === process.env.EXPO_PUBLIC_ADMIN_EMAIL;
      },
    })
  )
);
