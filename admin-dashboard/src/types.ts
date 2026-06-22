export type SubscriptionTier = 'free' | 'healed' | 'ascended' | 'family' | 'lifetime';

export interface AdminOverview {
  totalUsers: number;
  activeSubscriptions: number;
  freeUsers: number;
  totalScreenTimeMinutes: number;
  blockedAttempts: number;
  averageBrainScore: number;
  focusMinutes: number;
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

export interface AdminPayload {
  overview: AdminOverview;
  users: AdminUserSummary[];
  subscriptions: AdminSubscriptionSummary[];
  traffic: AdminTrafficMetric[];
}
