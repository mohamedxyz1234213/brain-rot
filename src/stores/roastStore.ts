import { create } from 'zustand';
import { getActiveUserStorageSuffix, persist } from '../lib/persistence';

type RoastPersona = 'egyptian_dad' | 'egyptian_mom' | 'future_self' | 'drill_sergeant' | 'sigmund_freud' | 'david_goggins';

interface RoastEntry {
  id: string;
  persona: RoastPersona;
  trigger: string;
  text: string;
  isOffline: boolean;
  createdAt: string;
}

interface RoastState {
  roasts: RoastEntry[];
  activeRoast: RoastEntry | null;
  selectedPersona: RoastPersona;
  isLoading: boolean;
  addRoast: (roast: Omit<RoastEntry, 'id' | 'createdAt'>) => void;
  dismissRoast: () => void;
  setPersona: (persona: RoastPersona) => void;
  getLatestRoasts: (limit?: number) => RoastEntry[];
  resetRoasts: () => void;
}

const generateId = () => `roast_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const useRoastStore = create<RoastState>()(
  persist(
    {
      name: 'roasts',
      getStorageKeySuffix: getActiveUserStorageSuffix,
      partialize: (state) => ({
        roasts: state.roasts.slice(0, 10),
        selectedPersona: state.selectedPersona,
      }),
    },
    (set, get) => ({
      roasts: [],
      activeRoast: null,
      selectedPersona: 'egyptian_dad',
      isLoading: false,

      addRoast: (roastData) => {
        const roast: RoastEntry = {
          ...roastData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set({
          activeRoast: roast,
          roasts: [roast, ...get().roasts],
        });
      },

      dismissRoast: () => {
        set({ activeRoast: null });
      },

      setPersona: (persona) => {
        set({ selectedPersona: persona });
      },

      getLatestRoasts: (limit = 10) => {
        return get().roasts.slice(0, limit);
      },

      resetRoasts: () => {
        set({ roasts: [], activeRoast: null, selectedPersona: 'egyptian_dad', isLoading: false });
      },
    })
  )
);

export type { RoastPersona, RoastEntry };
