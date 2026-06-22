import { create } from 'zustand';
import { User } from '../services/backend/interface';
import { backendService, setBackendAuthToken } from '../services/backend';
import { persist } from '../lib/persistence';

interface AuthState {
  user: User | null;
  authToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  setUser: (user: User | null) => void;
  setAuthToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  syncCurrentUser: () => Promise<void>;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    {
      name: 'auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onHydrate: (set) => set({ isHydrated: true }),
    },
    (set, get) => ({
      user: null,
      authToken: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      setAuthToken: (token) => {
        set({ authToken: token });
        setBackendAuthToken(token);
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      logout: () => {
        set({ user: null, authToken: null, isAuthenticated: false });
        setBackendAuthToken(null);
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
        if (!current) return;
        set({ isLoading: true });
        try {
          const synced = await backendService.syncUser(current.clerkId, current);
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
