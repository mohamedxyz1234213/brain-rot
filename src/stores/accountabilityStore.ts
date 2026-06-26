import { create } from 'zustand';
import { getActiveUserStorageSuffix, persist } from '../lib/persistence';
import { useAuthStore } from './authStore';
import { backendService } from '../services/backend';
import { ChallengeType, ChallengeConfig } from '../services/backend/interface';
import { useScreenTimeStore } from './screenTimeStore';

interface AccountabilityCircle {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  maxMembers: number;
  createdAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  challengeType: ChallengeType;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme' | 'legendary';
  durationDays: number;
  rewardXp: number;
  maxParticipants?: number;
  participantCount: number;
  joinedUserIds: string[];
  config: ChallengeConfig;
  rules?: string;
  isActive: boolean;
  createdAt: string;
  isJoined: boolean;
}

interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar?: string | null;
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
  fetchChallenges: () => Promise<void>;
  fetchCircles: () => Promise<void>;
  joinChallenge: (challengeId: string) => Promise<void>;
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

      fetchCircles: async () => {
        try {
          const userId = getLocalUserId();
          const backendCircles = await backendService.getCircles(userId);
          set({ circles: backendCircles });
        } catch (err) {
          console.error('Failed to fetch circles:', err);
        }
      },

      fetchChallenges: async () => {
        try {
          const userId = getLocalUserId();
          const backendChallenges = await backendService.getChallenges();
          const challenges: Challenge[] = backendChallenges.map((ch) => ({
            ...ch,
            isJoined: (ch.joinedUserIds || []).includes(userId),
          }));
          set({ challenges });
        } catch (err) {
          console.error('Failed to fetch challenges:', err);
        }
      },

      joinChallenge: async (challengeId) => {
        try {
          const userId = getLocalUserId();
          const updated = await backendService.joinChallenge(challengeId, userId);
          const challenge = get().challenges.find((c: Challenge) => c.id === challengeId);

          // Enforce challenge rules on the user's device
          if (challenge) {
            const config = updated.config || challenge.config || {};
            const type = updated.challengeType || challenge.challengeType;

            if (type === 'app_block' && config.targetAppBundleId) {
              // Block the target app completely
              await useScreenTimeStore.getState().addLimit({
                userId,
                appBundleId: config.targetAppBundleId,
                appName: config.targetAppName || 'Unknown App',
                dailyLimitMinutes: 0,
                isHardBlock: true,
                isEnabled: true,
              });
            }

            if (type === 'screen_time_reduce' && config.targetAppBundleId && config.challengeLimitMinutes != null) {
              // Reduce the app's daily limit
              const screenTimeStore = useScreenTimeStore.getState();
              const existingLimit = screenTimeStore.limits.find(
                (l) => l.appBundleId === config.targetAppBundleId
              );
              if (existingLimit) {
                await screenTimeStore.updateLimit(existingLimit.id, {
                  dailyLimitMinutes: config.challengeLimitMinutes,
                  isHardBlock: config.challengeLimitMinutes === 0,
                });
              } else {
                await screenTimeStore.addLimit({
                  userId,
                  appBundleId: config.targetAppBundleId,
                  appName: config.targetAppName || 'Unknown App',
                  dailyLimitMinutes: config.challengeLimitMinutes,
                  isHardBlock: config.challengeLimitMinutes === 0,
                  isEnabled: true,
                });
              }
            }

            if (type === 'no_social' && config.blockedAppIds) {
              // Block all selected social apps
              const screenTimeStore = useScreenTimeStore.getState();
              const socialAppNames: Record<string, string> = {
                'com.zhiliaoapp.musically': 'TikTok',
                'com.instagram.android': 'Instagram',
                'com.twitter.android': 'X (Twitter)',
                'com.facebook.katana': 'Facebook',
                'com.snapchat.android': 'Snapchat',
                'com.reddit.frontpage': 'Reddit',
                'com.youtube.android': 'YouTube',
                'com.linkedin.android': 'LinkedIn',
              };
              for (const bundleId of config.blockedAppIds) {
                const existing = screenTimeStore.limits.find((l) => l.appBundleId === bundleId);
                if (existing) {
                  await screenTimeStore.updateLimit(existing.id, {
                    dailyLimitMinutes: 0,
                    isHardBlock: true,
                  });
                } else {
                  await screenTimeStore.addLimit({
                    userId,
                    appBundleId: bundleId,
                    appName: socialAppNames[bundleId] || bundleId,
                    dailyLimitMinutes: 0,
                    isHardBlock: true,
                    isEnabled: true,
                  });
                }
              }
            }
          }

          const challenges = get().challenges.map((c: Challenge) =>
            c.id === challengeId ? { ...updated, isJoined: true } : c
          );
          set({ challenges });
        } catch (err) {
          console.error('Failed to join challenge:', err);
        }
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
