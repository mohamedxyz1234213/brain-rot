import { create } from 'zustand';
import { Subscription } from '../services/backend/interface';
import { backendService } from '../services/backend';

type Tier = 'free' | 'healed' | 'ascended' | 'family' | 'lifetime';

type Feature =
  | 'full_blocking'
  | 'unlimited_tasks'
  | 'ai_planner'
  | 'all_personas'
  | 'focus_sessions'
  | 'religion_section'
  | 'streaks_xp'
  | 'accountability_circles'
  | 'weekly_brain_scan'
  | 'viral_features'
  | 'offline_sync'
  | 'ai_coach'
  | 'life_trailer'
  | 'app_wrapped'
  | 'streak_shields'
  | 'wall_of_shame'
  | 'custom_sounds'
  | 'parent_dashboard'
  | 'child_mode';

const TIER_FEATURES: Record<Tier, Feature[]> = {
  free: [],
  healed: [
    'full_blocking',
    'unlimited_tasks',
    'ai_planner',
    'all_personas',
    'focus_sessions',
    'religion_section',
    'streaks_xp',
    'accountability_circles',
    'weekly_brain_scan',
    'viral_features',
    'offline_sync',
  ],
  ascended: [
    'full_blocking',
    'unlimited_tasks',
    'ai_planner',
    'all_personas',
    'focus_sessions',
    'religion_section',
    'streaks_xp',
    'accountability_circles',
    'weekly_brain_scan',
    'viral_features',
    'offline_sync',
    'ai_coach',
    'life_trailer',
    'app_wrapped',
    'streak_shields',
    'wall_of_shame',
    'custom_sounds',
  ],
  family: [
    'full_blocking',
    'unlimited_tasks',
    'ai_planner',
    'all_personas',
    'focus_sessions',
    'religion_section',
    'streaks_xp',
    'accountability_circles',
    'weekly_brain_scan',
    'viral_features',
    'offline_sync',
    'parent_dashboard',
    'child_mode',
  ],
  lifetime: [
    'full_blocking',
    'unlimited_tasks',
    'ai_planner',
    'all_personas',
    'focus_sessions',
    'religion_section',
    'streaks_xp',
    'accountability_circles',
    'weekly_brain_scan',
    'viral_features',
    'offline_sync',
    'ai_coach',
    'life_trailer',
    'app_wrapped',
    'streak_shields',
    'wall_of_shame',
    'custom_sounds',
  ],
};

interface SubscriptionState {
  subscription: Subscription | null;
  tier: Tier;
  isLoading: boolean;
  fetchSubscription: (userId: string) => Promise<void>;
  checkFeatureAccess: (feature: Feature) => boolean;
  updateTier: (userId: string, tier: Tier) => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscription: null,
  tier: 'free',
  isLoading: false,

  fetchSubscription: async (userId) => {
    set({ isLoading: true });
    try {
      const subscription = await backendService.getSubscription(userId);
      const tier = subscription?.tier ?? 'free';
      set({ subscription, tier, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  checkFeatureAccess: (feature) => {
    const { tier } = get();
    return TIER_FEATURES[tier]?.includes(feature) ?? false;
  },

  updateTier: async (userId, tier) => {
    try {
      const updated = await backendService.updateSubscription(userId, { tier, isActive: true });
      set({ subscription: updated, tier });
    } catch (error) {
      console.error('Failed to update subscription:', error);
    }
  },
}));
