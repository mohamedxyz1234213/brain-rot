import { create } from 'zustand';
import { AccountabilityCircle } from '../services/backend/interface';
import { backendService } from '../services/backend';

interface Challenge {
  id: string;
  title: string;
  description: string;
  durationDays: 7 | 14 | 30 | 90;
  startDate: string;
  endDate: string;
  participantCount: number;
  type: 'no_tiktok' | 'brain_detox' | 'ramadan_focus' | 'exam_mode' | 'custom';
  isJoined: boolean;
}

interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar?: string;
  score: number;
  streak: number;
  rank: number;
}

interface AccountabilityState {
  circles: AccountabilityCircle[];
  challenges: Challenge[];
  leaderboard: LeaderboardEntry[];
  wallOfShame: LeaderboardEntry[];
  isLoading: boolean;
  fetchCircles: (userId: string) => Promise<void>;
  createCircle: (name: string, userId: string) => Promise<void>;
  joinCircle: (circleId: string, userId: string) => Promise<void>;
  leaveCircle: (circleId: string, userId: string) => Promise<void>;
  fetchChallenges: () => void;
  joinChallenge: (challengeId: string) => void;
  fetchLeaderboard: () => void;
}

export const useAccountabilityStore = create<AccountabilityState>((set, get) => ({
  circles: [],
  challenges: [],
  leaderboard: [],
  wallOfShame: [],
  isLoading: false,

  fetchCircles: async (userId) => {
    set({ isLoading: true });
    try {
      const circles = await backendService.getCircles(userId);
      set({ circles, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createCircle: async (name, userId) => {
    try {
      const circle = await backendService.createCircle({
        name,
        ownerId: userId,
        memberIds: [userId],
        maxMembers: 8,
      });
      set({ circles: [...get().circles, circle] });
    } catch (error) {
      console.error('Failed to create circle:', error);
    }
  },

  joinCircle: async (circleId, userId) => {
    try {
      const updated = await backendService.joinCircle(circleId, userId);
      set({
        circles: get().circles.map((c) => (c.id === circleId ? updated : c)),
      });
    } catch (error) {
      console.error('Failed to join circle:', error);
    }
  },

  leaveCircle: async (circleId, userId) => {
    try {
      await backendService.leaveCircle(circleId, userId);
      set({ circles: get().circles.filter((c) => c.id !== circleId) });
    } catch (error) {
      console.error('Failed to leave circle:', error);
    }
  },

  fetchChallenges: () => {
    // Mock data for now - would come from backend
    set({
      challenges: [
        {
          id: '1',
          title: 'No TikTok Week',
          description: 'Survive 7 days without TikTok. Your brain will thank you.',
          durationDays: 7,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          participantCount: 234,
          type: 'no_tiktok',
          isJoined: false,
        },
        {
          id: '2',
          title: '30-Day Brain Detox',
          description: 'Full month of screen time discipline. Transform your habits.',
          durationDays: 30,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          participantCount: 89,
          type: 'brain_detox',
          isJoined: false,
        },
        {
          id: '3',
          title: 'Exam Mode',
          description: '14 days of zero social media. Focus on what matters.',
          durationDays: 14,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          participantCount: 156,
          type: 'exam_mode',
          isJoined: false,
        },
      ],
    });
  },

  joinChallenge: (challengeId) => {
    set({
      challenges: get().challenges.map((c) =>
        c.id === challengeId
          ? { ...c, isJoined: true, participantCount: c.participantCount + 1 }
          : c
      ),
    });
  },

  fetchLeaderboard: () => {
    // Mock leaderboard data
    set({
      leaderboard: [
        { userId: '1', name: 'Ahmed M.', score: 94, streak: 45, rank: 1 },
        { userId: '2', name: 'Sarah K.', score: 91, streak: 32, rank: 2 },
        { userId: '3', name: 'Omar A.', score: 87, streak: 28, rank: 3 },
        { userId: '4', name: 'Fatima N.', score: 82, streak: 21, rank: 4 },
        { userId: '5', name: 'Youssef H.', score: 78, streak: 14, rank: 5 },
      ],
      wallOfShame: [
        { userId: '6', name: 'Anonymous', score: 12, streak: 0, rank: 1 },
        { userId: '7', name: 'Anonymous', score: 18, streak: 0, rank: 2 },
        { userId: '8', name: 'Anonymous', score: 23, streak: 1, rank: 3 },
      ],
    });
  },
}));
