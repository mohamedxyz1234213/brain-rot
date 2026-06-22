/**
 * Supabase Backend Service
 * Connects directly to Supabase (PostgreSQL + Realtime + Edge Functions).
 */

import {
  IBackendService,
  User,
  Task,
  ScreenTimeLog,
  AppLimit,
  FocusSession,
  RoastLog,
  PrayerLog,
  QuranProgress,
  Streak,
  BrainScore,
  AccountabilityCircle,
  Subscription,
  NotificationSettings,
  AdminOverview,
  AdminUserSummary,
  AdminSubscriptionSummary,
  AdminTrafficMetric,
} from './interface';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

let _authToken: string | null = null;

function authHeaders(): Record<string, string> {
  return _authToken ? { Authorization: `Bearer ${_authToken}` } : {};
}

async function supabaseRequest<T>(
  path: string,
  options?: RequestInit & { query?: Record<string, string> }
): Promise<T> {
  const url = new URL(`${SUPABASE_URL}/rest/v1${path}`);
  if (options?.query) {
    Object.entries(options.query).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const anonAuth = 'Bearer ' + SUPABASE_ANON_KEY;
  const response = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: _authToken ? `Bearer ${_authToken}` : anonAuth,
      Prefer: options?.method === 'POST' ? 'return=representation' : 'return=representation',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase Error ${response.status}: ${error}`);
  }

  const data = await response.json();
  return Array.isArray(data) && options?.method !== 'GET' ? data[0] : data;
}

export class SupabaseBackendService implements IBackendService {
  setAuthToken(token: string | null): void {
    _authToken = token;
  }

  // Auth
  async syncUser(clerkId: string, data: Partial<User>): Promise<User> {
    return supabaseRequest<User>('/users', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify({ clerk_id: clerkId, ...this.toSnakeCase(data) }),
    });
  }

  async getUser(userId: string): Promise<User | null> {
    const results = await supabaseRequest<User[]>(`/users`, {
      method: 'GET',
      query: { id: `eq.${userId}`, select: '*' },
    });
    return results[0] || null;
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    return supabaseRequest<User>(`/users?id=eq.${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(this.toSnakeCase(data)),
    });
  }

  // Tasks
  async getTasks(userId: string, status?: Task['status']): Promise<Task[]> {
    const query: Record<string, string> = { user_id: `eq.${userId}`, select: '*' };
    if (status) query.status = `eq.${status}`;
    return supabaseRequest<Task[]>('/tasks', { method: 'GET', query });
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    return supabaseRequest<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(this.toSnakeCase(task)),
    });
  }

  async updateTask(taskId: string, data: Partial<Task>): Promise<Task> {
    return supabaseRequest<Task>(`/tasks?id=eq.${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(this.toSnakeCase(data)),
    });
  }

  async deleteTask(taskId: string): Promise<void> {
    await supabaseRequest(`/tasks?id=eq.${taskId}`, { method: 'DELETE' });
  }

  // Screen Time
  async getScreenTimeLogs(userId: string, date: string): Promise<ScreenTimeLog[]> {
    return supabaseRequest<ScreenTimeLog[]>('/screen_time_logs', {
      method: 'GET',
      query: { user_id: `eq.${userId}`, date: `eq.${date}`, select: '*' },
    });
  }

  async logScreenTime(log: Omit<ScreenTimeLog, 'id'>): Promise<ScreenTimeLog> {
    return supabaseRequest<ScreenTimeLog>('/screen_time_logs', {
      method: 'POST',
      body: JSON.stringify(this.toSnakeCase(log)),
    });
  }

  // App Limits
  async getAppLimits(userId: string): Promise<AppLimit[]> {
    return supabaseRequest<AppLimit[]>('/app_limits', {
      method: 'GET',
      query: { user_id: `eq.${userId}`, select: '*' },
    });
  }

  async setAppLimit(limit: Omit<AppLimit, 'id'>): Promise<AppLimit> {
    return supabaseRequest<AppLimit>('/app_limits', {
      method: 'POST',
      body: JSON.stringify(this.toSnakeCase(limit)),
    });
  }

  async updateAppLimit(limitId: string, data: Partial<AppLimit>): Promise<AppLimit> {
    return supabaseRequest<AppLimit>(`/app_limits?id=eq.${limitId}`, {
      method: 'PATCH',
      body: JSON.stringify(this.toSnakeCase(data)),
    });
  }

  async deleteAppLimit(limitId: string): Promise<void> {
    await supabaseRequest(`/app_limits?id=eq.${limitId}`, { method: 'DELETE' });
  }

  // Focus Sessions
  async getFocusSessions(userId: string, date?: string): Promise<FocusSession[]> {
    const query: Record<string, string> = { user_id: `eq.${userId}`, select: '*' };
    if (date) query.started_at = `gte.${date}T00:00:00`;
    return supabaseRequest<FocusSession[]>('/focus_sessions', { method: 'GET', query });
  }

  async createFocusSession(session: Omit<FocusSession, 'id'>): Promise<FocusSession> {
    return supabaseRequest<FocusSession>('/focus_sessions', {
      method: 'POST',
      body: JSON.stringify(this.toSnakeCase(session)),
    });
  }

  async updateFocusSession(sessionId: string, data: Partial<FocusSession>): Promise<FocusSession> {
    return supabaseRequest<FocusSession>(`/focus_sessions?id=eq.${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify(this.toSnakeCase(data)),
    });
  }

  // Roasts
  async getRoastLogs(userId: string, limit = 10): Promise<RoastLog[]> {
    return supabaseRequest<RoastLog[]>('/roast_logs', {
      method: 'GET',
      query: {
        user_id: `eq.${userId}`,
        select: '*',
        order: 'created_at.desc',
        limit: limit.toString(),
      },
    });
  }

  async createRoastLog(log: Omit<RoastLog, 'id'>): Promise<RoastLog> {
    return supabaseRequest<RoastLog>('/roast_logs', {
      method: 'POST',
      body: JSON.stringify(this.toSnakeCase(log)),
    });
  }

  // Prayer
  async getPrayerLogs(userId: string, date: string): Promise<PrayerLog[]> {
    return supabaseRequest<PrayerLog[]>('/prayer_logs', {
      method: 'GET',
      query: { user_id: `eq.${userId}`, date: `eq.${date}`, select: '*' },
    });
  }

  async logPrayer(log: Omit<PrayerLog, 'id'>): Promise<PrayerLog> {
    return supabaseRequest<PrayerLog>('/prayer_logs', {
      method: 'POST',
      body: JSON.stringify(this.toSnakeCase(log)),
    });
  }

  // Quran
  async getQuranProgress(userId: string): Promise<QuranProgress | null> {
    const results = await supabaseRequest<QuranProgress[]>('/quran_progress', {
      method: 'GET',
      query: { user_id: `eq.${userId}`, select: '*' },
    });
    return results[0] || null;
  }

  async updateQuranProgress(userId: string, data: Partial<QuranProgress>): Promise<QuranProgress> {
    return supabaseRequest<QuranProgress>(`/quran_progress?user_id=eq.${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(this.toSnakeCase(data)),
    });
  }

  // Streaks
  async getStreaks(userId: string): Promise<Streak[]> {
    return supabaseRequest<Streak[]>('/streaks', {
      method: 'GET',
      query: { user_id: `eq.${userId}`, select: '*' },
    });
  }

  async updateStreak(userId: string, type: Streak['type'], data: Partial<Streak>): Promise<Streak> {
    return supabaseRequest<Streak>(`/streaks?user_id=eq.${userId}&type=eq.${type}`, {
      method: 'PATCH',
      body: JSON.stringify(this.toSnakeCase(data)),
    });
  }

  // Brain Score
  async getBrainScores(userId: string, days = 30): Promise<BrainScore[]> {
    return supabaseRequest<BrainScore[]>('/brain_scores', {
      method: 'GET',
      query: {
        user_id: `eq.${userId}`,
        select: '*',
        order: 'date.desc',
        limit: days.toString(),
      },
    });
  }

  async calculateBrainScore(userId: string, date: string): Promise<BrainScore> {
    // Use Supabase Edge Function for calculation
    const authHeader = 'Bearer ' + SUPABASE_ANON_KEY;
    const response = await fetch(`${SUPABASE_URL}/functions/v1/calculate-brain-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({ userId, date }),
    });
    return response.json();
  }

  // Accountability
  async getCircles(userId: string): Promise<AccountabilityCircle[]> {
    return supabaseRequest<AccountabilityCircle[]>('/accountability_circles', {
      method: 'GET',
      query: { member_ids: `cs.{${userId}}`, select: '*' },
    });
  }

  async createCircle(circle: Omit<AccountabilityCircle, 'id' | 'createdAt'>): Promise<AccountabilityCircle> {
    return supabaseRequest<AccountabilityCircle>('/accountability_circles', {
      method: 'POST',
      body: JSON.stringify(this.toSnakeCase(circle)),
    });
  }

  async joinCircle(circleId: string, userId: string): Promise<AccountabilityCircle> {
    // Use RPC function for atomic array append
    const authHeader = 'Bearer ' + SUPABASE_ANON_KEY;
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/join_circle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: authHeader,
      },
      body: JSON.stringify({ circle_id: circleId, user_id: userId }),
    });
    return response.json();
  }

  async leaveCircle(circleId: string, userId: string): Promise<void> {
    const authHeader = 'Bearer ' + SUPABASE_ANON_KEY;
    await fetch(`${SUPABASE_URL}/rest/v1/rpc/leave_circle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: authHeader,
      },
      body: JSON.stringify({ circle_id: circleId, user_id: userId }),
    });
  }

  // Subscriptions
  async getSubscription(userId: string): Promise<Subscription | null> {
    const results = await supabaseRequest<Subscription[]>('/subscriptions', {
      method: 'GET',
      query: { user_id: `eq.${userId}`, select: '*' },
    });
    return results[0] || null;
  }

  async updateSubscription(userId: string, data: Partial<Subscription>): Promise<Subscription> {
    return supabaseRequest<Subscription>(`/subscriptions?user_id=eq.${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(this.toSnakeCase(data)),
    });
  }

  // Notifications
  async getNotificationSettings(userId: string): Promise<NotificationSettings | null> {
    const results = await supabaseRequest<NotificationSettings[]>('/notification_settings', {
      method: 'GET',
      query: { user_id: `eq.${userId}`, select: '*' },
    });
    return results[0] || null;
  }

  async updateNotificationSettings(
    userId: string,
    data: Partial<NotificationSettings>
  ): Promise<NotificationSettings> {
    return supabaseRequest<NotificationSettings>(`/notification_settings?user_id=eq.${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(this.toSnakeCase(data)),
    });
  }

  // Admin
  async getAdminOverview(): Promise<AdminOverview> {
    return supabaseRequest<AdminOverview>('/rpc/admin_overview', { method: 'POST' });
  }

  async getAdminUsers(limit = 50): Promise<AdminUserSummary[]> {
    return supabaseRequest<AdminUserSummary[]>('/admin_user_summaries', {
      method: 'GET',
      query: { select: '*', order: 'updated_at.desc', limit: String(limit) },
    });
  }

  async getAdminSubscriptions(limit = 50): Promise<AdminSubscriptionSummary[]> {
    return supabaseRequest<AdminSubscriptionSummary[]>('/admin_subscription_summaries', {
      method: 'GET',
      query: { select: '*', order: 'is_active.desc', limit: String(limit) },
    });
  }

  async getAdminTrafficMetrics(days = 7): Promise<AdminTrafficMetric[]> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return supabaseRequest<AdminTrafficMetric[]>('/screen_time_logs', {
      method: 'GET',
      query: { date: `gte.${since}`, select: '*', order: 'date.desc' },
    });
  }

  // Helper: convert camelCase to snake_case for Supabase
  private toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      result[snakeKey] = value;
    }
    return result;
  }
}
