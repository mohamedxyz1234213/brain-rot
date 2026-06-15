import { create } from 'zustand';
import { persist } from '../lib/persistence';

interface DrivingSession {
  startedAt: string;
  endedAt?: string;
  phoneAttempts: number;
}

interface DrivingState {
  isDriving: boolean;
  drivingStartedAt: string | null;
  phonePickedWhileDriving: boolean;
  drivingSessions: DrivingSession[];
  setDriving: (isDriving: boolean) => void;
  setPhonePicked: () => void;
  resetSession: () => void;
}

export const useDrivingStore = create<DrivingState>()(
  persist(
    {
      name: 'driving',
      partialize: (state) => ({
        drivingSessions: state.drivingSessions.slice(0, 20),
      }),
    },
    (set, get) => ({
      isDriving: false,
      drivingStartedAt: null,
      phonePickedWhileDriving: false,
      drivingSessions: [],

      setDriving: (isDriving) => {
        if (isDriving) {
          set({
            isDriving: true,
            drivingStartedAt: new Date().toISOString(),
            phonePickedWhileDriving: false,
          });
        } else {
          const { drivingStartedAt, phonePickedWhileDriving, drivingSessions } = get();
          if (drivingStartedAt) {
            const session: DrivingSession = {
              startedAt: drivingStartedAt,
              endedAt: new Date().toISOString(),
              phoneAttempts: phonePickedWhileDriving ? 1 : 0,
            };
            set({
              isDriving: false,
              drivingStartedAt: null,
              phonePickedWhileDriving: false,
              drivingSessions: [...drivingSessions, session],
            });
          } else {
            set({ isDriving: false, drivingStartedAt: null, phonePickedWhileDriving: false });
          }
        }
      },

      setPhonePicked: () => {
        set({ phonePickedWhileDriving: true });
      },

      resetSession: () => {
        set({
          isDriving: false,
          drivingStartedAt: null,
          phonePickedWhileDriving: false,
        });
      },
    })
  )
);
