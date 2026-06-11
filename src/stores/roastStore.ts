import { create } from 'zustand';
import { RoastLog } from '../services/backend/interface';
import { backendService } from '../services/backend';
import { roastTemplates } from '../data/roastTemplates';

export type RoastPersona =
  | 'egyptian_dad'
  | 'egyptian_mom'
  | 'future_self'
  | 'drill_sergeant'
  | 'sigmund_freud'
  | 'david_goggins';

interface RoastState {
  roasts: RoastLog[];
  isLoading: boolean;
  activeRoast: RoastLog | null;
  fetchRoasts: (userId: string) => Promise<void>;
  generateRoast: (userId: string, persona: RoastPersona, trigger: string, context: Record<string, string>) => Promise<RoastLog>;
  dismissRoast: () => void;
}

export const useRoastStore = create<RoastState>((set, get) => ({
  roasts: [],
  isLoading: false,
  activeRoast: null,

  fetchRoasts: async (userId) => {
    set({ isLoading: true });
    try {
      const roasts = await backendService.getRoastLogs(userId);
      set({ roasts, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  generateRoast: async (userId, persona, trigger, context) => {
    // Try AI generation, fall back to offline templates
    let text: string;
    let isOffline = false;

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_MONGO_API_URL}/api/roasts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, persona, trigger, context }),
      });
      const data = await response.json();
      text = data.text;
    } catch {
      // Offline fallback
      const templates = roastTemplates[persona] || roastTemplates.drill_sergeant;
      const template = templates[Math.floor(Math.random() * templates.length)];
      text = template.replace(/\{(\w+)\}/g, (_, key) => context[key] || key);
      isOffline = true;
    }

    const roastLog: Omit<RoastLog, 'id'> = {
      userId,
      persona,
      trigger,
      text,
      isOffline,
      createdAt: new Date().toISOString(),
    };

    const saved = await backendService.createRoastLog(roastLog);
    set({ activeRoast: saved, roasts: [saved, ...get().roasts] });
    return saved;
  },

  dismissRoast: () => set({ activeRoast: null }),
}));
