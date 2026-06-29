export type SubscriptionTier = 'free' | 'healed' | 'ascended' | 'family' | 'lifetime';

export interface AdminOverview {
  totalUsers: number;
  activeSubscriptions: number;
  freeUsers: number;
  totalScreenTimeMinutes: number;
  blockedAttempts: number;
  averageBrainScore: number;
  focusMinutes: number;
  aiRequests: number;
  activeChallenges: number;
  recentRoasts: number;
  prayersToday: number;
  activeStreaks: number;
  generatedAt: string;
}

export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  subscriptionTier: SubscriptionTier;
  role?: 'user' | 'admin';
  brainScore: number;
  xp: number;
  streakDays: number;
  createdAt: string;
  updatedAt: string;
  isBanned?: boolean;
}

export interface AdminSubscriptionSummary {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  isActive: boolean;
  expiresAt?: string;
  revenueCatId?: string;
}

export interface AdminTrafficMetric {
  id: string;
  userId: string;
  appName: string;
  appBundleId: string;
  minutesUsed: number;
  limit: number;
  overageMinutes: number;
  blockedAttempts: number;
  date: string;
}

export interface AdminAIRequest {
  id: string;
  userId: string;
  feature: 'roast' | 'planner' | 'coach' | 'briefing' | string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
  status: 'success' | 'failed' | 'rate_limited';
  createdAt: string;
}

export type ChallengeType = 'app_block' | 'screen_time_reduce' | 'no_social' | 'prayer' | 'focus_hours' | 'task_completion' | 'custom';

export interface ChallengeConfig {
  targetAppBundleId?: string;
  targetAppName?: string;
  originalLimitMinutes?: number;
  challengeLimitMinutes?: number;
  blockedAppIds?: string[];
  requiredPrayers?: string[];
  requiredFocusHours?: number;
  requiredTaskCount?: number;
  customInstructions?: string;
}

export interface AdminChallenge {
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
}

export interface AdminManualRoast {
  id: string;
  title: string;
  body: string;
  persona: string;
  language: 'en' | 'ar';
  isActive: boolean;
  createdAt: string;
}

export interface AdminBroadcast {
  id: string;
  title: string;
  body: string;
  targetTier: 'all' | SubscriptionTier;
  sentAt: string;
  sentBy: string;
}

export interface RoastDistribution {
  count: number;
}

export interface AdminAnalytics {
  dau: number;
  wau: number;
  conversionRate: number;
  churnRiskUsers: number;
  averageSessionMinutes: number;
  topBlockedApps: { appName: string; blockedAttempts: number; minutesUsed: number }[];
  roastDistribution: { [persona: string]: RoastDistribution };
}

export interface AdminPayload {
  overview: AdminOverview;
  users: AdminUserSummary[];
  subscriptions: AdminSubscriptionSummary[];
  traffic: AdminTrafficMetric[];
  aiRequests: AdminAIRequest[];
  challenges: AdminChallenge[];
  manualRoasts: AdminManualRoast[];
  reports: AdminReport[];
  analytics: AdminAnalytics;
}

export interface AdminSession {
  token: string;
  admin: { id: string; email: string; name?: string; role: 'admin' };
}

export type UserUpdateInput = Partial<Pick<AdminUserSummary, 'name' | 'email' | 'subscriptionTier' | 'role' | 'brainScore' | 'xp' | 'streakDays' | 'isBanned'>>;
export type SubscriptionUpdateInput = Partial<Pick<AdminSubscriptionSummary, 'tier' | 'isActive' | 'expiresAt' | 'revenueCatId'>>;
export type ChallengeInput = Omit<AdminChallenge, 'id' | 'createdAt' | 'joinedUserIds' | 'participantCount'>;
export type ManualRoastInput = Omit<AdminManualRoast, 'id' | 'createdAt'>;
export type BroadcastInput = Pick<AdminBroadcast, 'title' | 'body' | 'targetTier'>;

export interface AdminReport {
  id: string;
  userId: string;
  type: 'bug' | 'feature';
  title: string;
  description: string;
  status: 'open' | 'acknowledged' | 'fixed' | 'closed';
  createdAt: string;
  updatedAt: string;
}
