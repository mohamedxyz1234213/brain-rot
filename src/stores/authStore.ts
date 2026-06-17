import { create } from 'zustand';
import { User } from '../services/backend/interface';
import { persist } from '../lib/persistence';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  setUser: (user: User | null) => void;
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
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: (data) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, ...data } });
        }
      },
    })
  )
);
