import { create } from 'zustand';
import { persist } from '../lib/persistence';

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
}

const generateId = () => `circle_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const useAccountabilityStore = create<AccountabilityState>()(
  persist(
    {
      name: 'accountability',
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
        const circle: AccountabilityCircle = {
          id: generateId(),
          name,
          ownerId: 'current_user',
          memberIds: ['current_user'],
          maxMembers: 8,
          createdAt: new Date().toISOString(),
        };
        set({ circles: [...get().circles, circle] });
      },

      joinCircle: (circleId) => {
        set({
          circles: get().circles.map((c: AccountabilityCircle) =>
            c.id === circleId ? { ...c, memberIds: [...c.memberIds, 'current_user'] } : c
          ),
        });
      },

      leaveCircle: (circleId) => {
        set({
          circles: get().circles.map((c: AccountabilityCircle) =>
            c.id === circleId ? { ...c, memberIds: c.memberIds.filter((m: string) => m !== 'current_user') } : c
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
    })
  )
);
