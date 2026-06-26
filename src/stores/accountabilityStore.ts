import { create } from 'zustand';
import { getActiveUserStorageSuffix, persist } from '../lib/persistence';
import { useAuthStore } from './authStore';

interface AccountabilityCircle {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  maxMembers: number;
  createdAt: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  participantCount: number;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isJoined: boolean;
}

interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar?: string;
  score: number;
  streak: number;
  xp: number;
  focusHours: number;
  rank: number;
}

interface AccountabilityState {
  circles: AccountabilityCircle[];
  challenges: Challenge[];
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  addCircle: (name: string) => void;
  joinCircle: (circleId: string) => void;
  leaveCircle: (circleId: string) => void;
  joinChallenge: (challengeId: string) => void;
  setLeaderboard: (entries: LeaderboardEntry[]) => void;
  resetAccountability: () => void;
}

const generateId = () => `circle_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
const getLocalUserId = () => useAuthStore.getState().user?.id ?? 'local_user';

export const useAccountabilityStore = create<AccountabilityState>()(
  persist(
    {
      name: 'accountability',
      getStorageKeySuffix: getActiveUserStorageSuffix,
      partialize: (state: any) => ({
        circles: state.circles,
        challenges: state.challenges,
      }),
    },
    (set, get) => ({
      circles: [],
      challenges: [],
      leaderboard: [],
      isLoading: false,

      addCircle: (name) => {
        const userId = getLocalUserId();
        const circle: AccountabilityCircle = {
          id: generateId(),
          name,
          ownerId: userId,
          memberIds: [userId],
          maxMembers: 8,
          createdAt: new Date().toISOString(),
        };
        set({ circles: [...get().circles, circle] });
      },

      joinCircle: (circleId) => {
        const userId = getLocalUserId();
        set({
          circles: get().circles.map((c: AccountabilityCircle) =>
            c.id === circleId && !c.memberIds.includes(userId) ? { ...c, memberIds: [...c.memberIds, userId] } : c
          ),
        });
      },

      leaveCircle: (circleId) => {
        const userId = getLocalUserId();
        set({
          circles: get().circles.map((c: AccountabilityCircle) =>
            c.id === circleId ? { ...c, memberIds: c.memberIds.filter((m: string) => m !== userId) } : c
          ),
        });
      },

      joinChallenge: (challengeId) => {
        set({
          challenges: get().challenges.map((c: Challenge) =>
            c.id === challengeId ? { ...c, isJoined: true, participantCount: c.participantCount + 1 } : c
          ),
        });
      },

      setLeaderboard: (entries) => {
        set({ leaderboard: entries });
      },

      resetAccountability: () => {
        set({ circles: [], challenges: [], leaderboard: [], isLoading: false });
      },
    })
  )
);
