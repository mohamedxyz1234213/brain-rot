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
  generatedAt: string;
}

export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
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

export interface AdminChallenge {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  durationDays: number;
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

export interface AdminAnalytics {
  dau: number;
  wau: number;
  conversionRate: number;
  churnRiskUsers: number;
  averageSessionMinutes: number;
  topBlockedApps: { appName: string; blockedAttempts: number; minutesUsed: number }[];
}

export interface AdminPayload {
  overview: AdminOverview;
  users: AdminUserSummary[];
  subscriptions: AdminSubscriptionSummary[];
  traffic: AdminTrafficMetric[];
  aiRequests: AdminAIRequest[];
  challenges: AdminChallenge[];
  manualRoasts: AdminManualRoast[];
  analytics: AdminAnalytics;
}

export interface AdminSession {
  token: string;
  admin: { id: string; email: string; name?: string; role: 'admin' };
}

export type UserUpdateInput = Partial<Pick<AdminUserSummary, 'name' | 'email' | 'subscriptionTier' | 'role' | 'brainScore' | 'xp' | 'streakDays' | 'isBanned'>>;
export type SubscriptionUpdateInput = Partial<Pick<AdminSubscriptionSummary, 'tier' | 'isActive' | 'expiresAt' | 'revenueCatId'>>;
export type ChallengeInput = Omit<AdminChallenge, 'id' | 'createdAt'>;
export type ManualRoastInput = Omit<AdminManualRoast, 'id' | 'createdAt'>;
