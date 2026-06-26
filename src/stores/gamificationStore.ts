import { create } from 'zustand';
import { getActiveUserStorageSuffix, persist } from '../lib/persistence';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: string;
}

interface LootBox {
  id: string;
  type: 'common' | 'rare' | 'legendary';
  contents: LootItem[];
  earnedAt: string;
  opened: boolean;
}

interface LootItem {
  type: 'persona' | 'theme' | 'streak_shield' | 'wallpaper' | 'sound';
  name: string;
  rarity: 'common' | 'rare' | 'legendary';
}

interface GamificationState {
  achievements: Achievement[];
  unlockedAchievements: string[];
  lootBoxes: LootBox[];
  avatarStage: number;
  villainArcActive: boolean;
  villainArcDaysLeft: number;
  unlockAchievement: (achievementId: string) => void;
  addLootBox: (type: LootBox['type']) => void;
  openLootBox: (lootBoxId: string) => LootItem | null;
  updateAvatarStage: (score: number) => void;
  startVillainArc: () => void;
  decrementVillainArcDay: () => void;
  endVillainArc: () => void;
  resetGamification: () => void;
}

const AVATAR_THRESHOLDS = [0, 20, 35, 50, 65, 80, 95];

function getAvatarStage(score: number): number {
  for (let i = AVATAR_THRESHOLDS.length - 1; i >= 0; i--) {
    if (score >= AVATAR_THRESHOLDS[i]) return i;
  }
  return 0;
}

const LOOT_POOLS: Record<LootBox['type'], LootItem[]> = {
  common: [
    { type: 'wallpaper', name: 'Dark Forest', rarity: 'common' },
    { type: 'sound', name: 'Ocean Waves', rarity: 'common' },
    { type: 'theme', name: 'Midnight Blue', rarity: 'common' },
  ],
  rare: [
    { type: 'streak_shield', name: 'Shield of Discipline', rarity: 'rare' },
    { type: 'persona', name: 'Disappointed Uncle', rarity: 'rare' },
    { type: 'theme', name: 'Neon Emerald', rarity: 'rare' },
  ],
  legendary: [
    { type: 'persona', name: 'Prophet Mode (Gentle)', rarity: 'legendary' },
    { type: 'theme', name: 'Golden Hour', rarity: 'legendary' },
    { type: 'streak_shield', name: 'Immortal Shield', rarity: 'legendary' },
  ],
};

export const useGamificationStore = create<GamificationState>()(
  persist(
    {
      name: 'gamification',
      getStorageKeySuffix: getActiveUserStorageSuffix,
      partialize: (state: any) => ({
        unlockedAchievements: state.unlockedAchievements,
        avatarStage: state.avatarStage,
        villainArcActive: state.villainArcActive,
        villainArcDaysLeft: state.villainArcDaysLeft,
      }),
    },
    (set, get) => ({
      achievements: [],
      unlockedAchievements: [],
      lootBoxes: [],
      avatarStage: 0,
      villainArcActive: false,
      villainArcDaysLeft: 0,

      unlockAchievement: (achievementId) => {
        const { unlockedAchievements } = get();
        if (!unlockedAchievements.includes(achievementId)) {
          set({ unlockedAchievements: [...unlockedAchievements, achievementId] });
        }
      },

      addLootBox: (type) => {
        const newBox: LootBox = {
          id: `loot_${Date.now()}`,
          type,
          contents: [],
          earnedAt: new Date().toISOString(),
          opened: false,
        };
        set({ lootBoxes: [...get().lootBoxes, newBox] });
      },

      openLootBox: (lootBoxId) => {
        const box = get().lootBoxes.find((b: LootBox) => b.id === lootBoxId);
        if (!box || box.opened) return null;
        const pool = LOOT_POOLS[box.type as LootBox['type']];
        const item = pool[Math.floor(Math.random() * pool.length)];
        set({
          lootBoxes: get().lootBoxes.map((b: LootBox) =>
            b.id === lootBoxId ? { ...b, opened: true, contents: [item] } : b
          ),
        });
        return item;
      },

      updateAvatarStage: (score) => {
        set({ avatarStage: getAvatarStage(score) });
      },

      startVillainArc: () => {
        set({ villainArcActive: true, villainArcDaysLeft: 3 });
      },

      decrementVillainArcDay: () => {
        const daysLeft = get().villainArcDaysLeft - 1;
        if (daysLeft <= 0) {
          set({ villainArcActive: false, villainArcDaysLeft: 0 });
        } else {
          set({ villainArcDaysLeft: daysLeft });
        }
      },

      endVillainArc: () => {
        set({ villainArcActive: false, villainArcDaysLeft: 0 });
      },

      resetGamification: () => {
        set({ achievements: [], unlockedAchievements: [], lootBoxes: [], avatarStage: 0, villainArcActive: false, villainArcDaysLeft: 0 });
      },
    })
  )
);
