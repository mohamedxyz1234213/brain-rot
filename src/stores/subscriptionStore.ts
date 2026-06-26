import { create } from 'zustand';
import { getActiveUserStorageSuffix, persist } from '../lib/persistence';
import { backendService } from '../services/backend';
import { Subscription } from '../services/backend/interface';

type Level = 'Zombie' | 'Waking Up' | 'Struggling' | 'Recovering' | 'Restoring' | 'Thriving' | 'Ascended';

interface SubscriptionState {
  tier: 'free' | 'healed' | 'ascended' | 'family' | 'lifetime';
  isActive: boolean;
  isLoading: boolean;
  subscription: Subscription | null;
  setTier: (tier: SubscriptionState['tier']) => void;
  syncSubscription: (userId: string) => Promise<void>;
  refreshSubscription: (userId: string) => Promise<void>;
  checkFeatureAccess: (feature: string) => boolean;
  resetSubscription: () => void;
}

const TIER_FEATURES: Record<SubscriptionState['tier'], string[]> = {
  free: [],
  healed: [
    'full_blocking', 'unlimited_tasks', 'ai_planner', 'all_personas',
    'focus_sessions', 'religion_section', 'streaks_xp', 'accountability_circles',
    'weekly_brain_scan', 'viral_features', 'offline_sync',
  ],
  ascended: [
    'full_blocking', 'unlimited_tasks', 'ai_planner', 'all_personas',
    'focus_sessions', 'religion_section', 'streaks_xp', 'accountability_circles',
    'weekly_brain_scan', 'viral_features', 'offline_sync',
    'ai_coach', 'life_trailer', 'app_wrapped', 'streak_shields', 'wall_of_shame', 'custom_sounds',
  ],
  family: [
    'full_blocking', 'unlimited_tasks', 'ai_planner', 'all_personas',
    'focus_sessions', 'religion_section', 'streaks_xp', 'accountability_circles',
    'weekly_brain_scan', 'viral_features', 'offline_sync',
    'parent_dashboard', 'child_mode',
  ],
  lifetime: [
    'full_blocking', 'unlimited_tasks', 'ai_planner', 'all_personas',
    'focus_sessions', 'religion_section', 'streaks_xp', 'accountability_circles',
    'weekly_brain_scan', 'viral_features', 'offline_sync',
    'ai_coach', 'life_trailer', 'app_wrapped', 'streak_shields', 'wall_of_shame', 'custom_sounds',
  ],
};

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    {
      name: 'subscription',
      getStorageKeySuffix: getActiveUserStorageSuffix,
      partialize: (state) => ({ tier: state.tier, isActive: state.isActive, subscription: state.subscription }),
    },
    (set, get) => ({
      tier: 'free',
      isActive: false,
      isLoading: false,
      subscription: null,

      setTier: (tier) => {
        set({ tier, isActive: tier !== 'free' });
      },

      syncSubscription: async (userId) => {
        const { tier, isActive, subscription } = get();
        set({ isLoading: true });
        try {
          const synced = await backendService.updateSubscription(userId, {
            ...subscription,
            userId,
            tier,
            isActive,
          });
          set({ subscription: synced, tier: synced.tier, isActive: synced.isActive, isLoading: false });
        } catch (error) {
          console.warn('subscription sync failed', error);
          set({ isLoading: false });
        }
      },

      refreshSubscription: async (userId) => {
        set({ isLoading: true });
        try {
          const subscription = await backendService.getSubscription(userId);
          if (subscription) {
            set({ subscription, tier: subscription.tier, isActive: subscription.isActive, isLoading: false });
          } else {
            set({ subscription: null, tier: 'free', isActive: false, isLoading: false });
          }
        } catch (error) {
          console.warn('subscription refresh failed', error);
          set({ isLoading: false });
        }
      },

      checkFeatureAccess: (feature) => {
        const { tier } = get();
        return TIER_FEATURES[tier as SubscriptionState['tier']]?.includes(feature) ?? false;
      },

      resetSubscription: () => {
        set({ tier: 'free', isActive: false, isLoading: false, subscription: null });
      },
    })
  )
);

export { TIER_FEATURES };
