import { create } from 'zustand';
import { backendService } from '../services/backend';
import {
  AdminOverview,
  AdminSubscriptionSummary,
  AdminTrafficMetric,
  AdminUserSummary,
} from '../services/backend/interface';

interface AdminState {
  overview: AdminOverview | null;
  users: AdminUserSummary[];
  subscriptions: AdminSubscriptionSummary[];
  traffic: AdminTrafficMetric[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  overview: null,
  users: [],
  subscriptions: [],
  traffic: [],
  isLoading: false,
  error: null,

  refresh: async () => {
    set({ isLoading: true, error: null });
    try {
      const [overview, users, subscriptions, traffic] = await Promise.all([
        backendService.getAdminOverview(),
        backendService.getAdminUsers(50),
        backendService.getAdminSubscriptions(50),
        backendService.getAdminTrafficMetrics(7),
      ]);
      set({ overview, users, subscriptions, traffic, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Admin data refresh failed';
      set({ error: message, isLoading: false });
    }
  },
}));
