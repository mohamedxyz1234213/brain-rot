import { create } from 'zustand';
import { User } from '../services/backend/interface';
import { setBackendAuthToken } from '../services/backend';
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
    })
  )
);
