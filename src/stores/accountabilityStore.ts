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

const DEFAULT_CHALLENGES: Challenge[] = [
  { id: 'ch_1', title: 'No TikTok Week', description: '7 days without TikTok.', durationDays: 7, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 7*24*60*60*1000).toISOString(), participantCount: 234, type: 'no_tiktok', difficulty: 'medium', isJoined: false },
  { id: 'ch_2', title: '30-Day Brain Detox', description: 'Full month of discipline.', durationDays: 30, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString(), participantCount: 89, type: 'brain_detox', difficulty: 'hard', isJoined: false },
  { id: 'ch_3', title: 'Exam Mode', description: '14 days zero social media.', durationDays: 14, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 14*24*60*60*1000).toISOString(), participantCount: 156, type: 'exam_mode', difficulty: 'medium', isJoined: false },
  { id: 'ch_4', title: 'Quick Detox', description: '3-day mini challenge.', durationDays: 3, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 3*24*60*60*1000).toISOString(), participantCount: 567, type: 'custom', difficulty: 'easy', isJoined: false },
];

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { userId: '1', name: 'Ahmed M.', score: 94, streak: 45, xp: 18500, focusHours: 32, rank: 1 },
  { userId: '2', name: 'Sarah K.', score: 91, streak: 32, xp: 14200, focusHours: 28, rank: 2 },
  { userId: '3', name: 'Omar A.', score: 87, streak: 28, xp: 9800, focusHours: 24, rank: 3 },
];

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
      challenges: DEFAULT_CHALLENGES,
      leaderboard: DEFAULT_LEADERBOARD,
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
