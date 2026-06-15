import { create } from 'zustand';
import { persist } from '../lib/persistence';

type Level = 'Zombie' | 'Waking Up' | 'Struggling' | 'Recovering' | 'Healing' | 'Thriving' | 'Ascended';

interface SubscriptionState {
  tier: 'free' | 'healed' | 'ascended' | 'family' | 'lifetime';
  isActive: boolean;
  isLoading: boolean;
  setTier: (tier: SubscriptionState['tier']) => void;
  checkFeatureAccess: (feature: string) => boolean;
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
      partialize: (state) => ({ tier: state.tier, isActive: state.isActive }),
    },
    (set, get) => ({
      tier: 'free',
      isActive: false,
      isLoading: false,

      setTier: (tier) => {
        set({ tier, isActive: tier !== 'free' });
      },

      checkFeatureAccess: (feature) => {
        const { tier } = get();
        return TIER_FEATURES[tier as SubscriptionState['tier']]?.includes(feature) ?? false;
      },
    })
  )
);

export { TIER_FEATURES };
