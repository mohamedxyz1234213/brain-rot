import type { AdminPayload } from './types';

const API_URL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:3001/api';
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || '';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true' || !ADMIN_TOKEN;

const headers = () => ({
  'Content-Type': 'application/json',
  ...(ADMIN_TOKEN ? { Authorization: `Bearer ${ADMIN_TOKEN}` } : {}),
});

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { headers: headers() });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${response.status} ${body || response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchAdminPayload(): Promise<AdminPayload> {
  if (USE_MOCKS) return mockPayload;

  const [overview, users, subscriptions, traffic] = await Promise.all([
    getJson<AdminPayload['overview']>('/admin/overview'),
    getJson<AdminPayload['users']>('/admin/users?limit=50'),
    getJson<AdminPayload['subscriptions']>('/admin/subscriptions?limit=50'),
    getJson<AdminPayload['traffic']>('/admin/traffic?days=7'),
  ]);

  return { overview, users, subscriptions, traffic };
}

const mockPayload: AdminPayload = {
  overview: {
    totalUsers: 1284,
    activeSubscriptions: 312,
    freeUsers: 972,
    totalScreenTimeMinutes: 184920,
    blockedAttempts: 7431,
    averageBrainScore: 67,
    focusMinutes: 42880,
    generatedAt: new Date().toISOString(),
  },
  users: [
    { id: 'u_1', name: 'Ahmed Nabil', email: 'ahmed@example.com', subscriptionTier: 'ascended', role: 'admin', brainScore: 82, xp: 12400, streakDays: 18, createdAt: '2026-05-01T10:00:00Z', updatedAt: '2026-06-22T16:00:00Z' },
    { id: 'u_2', name: 'Mariam Hassan', email: 'mariam@example.com', subscriptionTier: 'healed', brainScore: 74, xp: 6200, streakDays: 9, createdAt: '2026-05-11T10:00:00Z', updatedAt: '2026-06-22T14:20:00Z' },
    { id: 'u_3', name: 'Omar Ali', email: 'omar@example.com', subscriptionTier: 'free', brainScore: 43, xp: 1800, streakDays: 2, createdAt: '2026-06-01T10:00:00Z', updatedAt: '2026-06-22T12:10:00Z' },
    { id: 'u_4', name: 'Sara Youssef', email: 'sara@example.com', subscriptionTier: 'family', brainScore: 91, xp: 17000, streakDays: 26, createdAt: '2026-04-18T10:00:00Z', updatedAt: '2026-06-22T11:34:00Z' },
  ],
  subscriptions: [
    { id: 'sub_1', userId: 'u_1', tier: 'ascended', isActive: true, revenueCatId: 'rc_ahmed' },
    { id: 'sub_2', userId: 'u_2', tier: 'healed', isActive: true, revenueCatId: 'rc_mariam' },
    { id: 'sub_3', userId: 'u_3', tier: 'free', isActive: false },
    { id: 'sub_4', userId: 'u_4', tier: 'family', isActive: true, revenueCatId: 'rc_sara' },
  ],
  traffic: [
    { id: 'tr_1', userId: 'u_1', appName: 'TikTok', appBundleId: 'com.zhiliaoapp.musically', minutesUsed: 96, limit: 30, overageMinutes: 66, blockedAttempts: 12, date: '2026-06-22' },
    { id: 'tr_2', userId: 'u_2', appName: 'Instagram', appBundleId: 'com.instagram.android', minutesUsed: 71, limit: 45, overageMinutes: 26, blockedAttempts: 7, date: '2026-06-22' },
    { id: 'tr_3', userId: 'u_3', appName: 'YouTube', appBundleId: 'com.google.android.youtube', minutesUsed: 144, limit: 60, overageMinutes: 84, blockedAttempts: 24, date: '2026-06-22' },
    { id: 'tr_4', userId: 'u_4', appName: 'X/Twitter', appBundleId: 'com.twitter.android', minutesUsed: 38, limit: 25, overageMinutes: 13, blockedAttempts: 5, date: '2026-06-22' },
  ],
};
