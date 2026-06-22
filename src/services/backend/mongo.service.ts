/**
 * MongoDB + Express Backend Service
 * Connects to Node.js/Express API backed by MongoDB Atlas.
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

const API_URL = process.env.EXPO_PUBLIC_MONGO_API_URL || 'http://localhost:3001/api';

let _authToken: string | null = null;

function authHeaders(): Record<string, string> {
  return _authToken ? { Authorization: `Bearer ${_authToken}` } : {};
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
  }

  return response.json();
}

export class MongoBackendService implements IBackendService {
  setAuthToken(token: string | null): void {
    _authToken = token;
  }

  // Auth
  async syncUser(clerkId: string, data: Partial<User>): Promise<User> {
    return request<User>('/users/sync', {
      method: 'POST',
      body: JSON.stringify({ clerkId, ...data }),
    });
  }

  async getUser(userId: string): Promise<User | null> {
    return request<User | null>(`/users/${userId}`);
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    return request<User>(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Tasks
  async getTasks(userId: string, status?: Task['status']): Promise<Task[]> {
    const query = status ? `?status=${status}` : '';
    return request<Task[]>(`/tasks/${userId}${query}`);
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    return request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(taskId: string, data: Partial<Task>): Promise<Task> {
    return request<Task>(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(taskId: string): Promise<void> {
    await request(`/tasks/${taskId}`, { method: 'DELETE' });
  }

  // Screen Time
  async getScreenTimeLogs(userId: string, date: string): Promise<ScreenTimeLog[]> {
    return request<ScreenTimeLog[]>(`/screen-time/${userId}?date=${date}`);
  }

  async logScreenTime(log: Omit<ScreenTimeLog, 'id'>): Promise<ScreenTimeLog> {
    return request<ScreenTimeLog>('/screen-time', {
      method: 'POST',
      body: JSON.stringify(log),
    });
  }

  // App Limits
  async getAppLimits(userId: string): Promise<AppLimit[]> {
    return request<AppLimit[]>(`/app-limits/${userId}`);
  }

  async setAppLimit(limit: Omit<AppLimit, 'id'>): Promise<AppLimit> {
    return request<AppLimit>('/app-limits', {
      method: 'POST',
      body: JSON.stringify(limit),
    });
  }

  async updateAppLimit(limitId: string, data: Partial<AppLimit>): Promise<AppLimit> {
    return request<AppLimit>(`/app-limits/${limitId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAppLimit(limitId: string): Promise<void> {
    await request(`/app-limits/${limitId}`, { method: 'DELETE' });
  }

  // Focus Sessions
  async getFocusSessions(userId: string, date?: string): Promise<FocusSession[]> {
    const query = date ? `?date=${date}` : '';
    return request<FocusSession[]>(`/focus-sessions/${userId}${query}`);
  }

  async createFocusSession(session: Omit<FocusSession, 'id'>): Promise<FocusSession> {
    return request<FocusSession>('/focus-sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    });
  }

  async updateFocusSession(sessionId: string, data: Partial<FocusSession>): Promise<FocusSession> {
    return request<FocusSession>(`/focus-sessions/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Roasts
  async getRoastLogs(userId: string, limit = 10): Promise<RoastLog[]> {
    return request<RoastLog[]>(`/roasts/${userId}?limit=${limit}`);
  }

  async createRoastLog(log: Omit<RoastLog, 'id'>): Promise<RoastLog> {
    return request<RoastLog>('/roasts', {
      method: 'POST',
      body: JSON.stringify(log),
    });
  }

  // Prayer
  async getPrayerLogs(userId: string, date: string): Promise<PrayerLog[]> {
    return request<PrayerLog[]>(`/prayers/${userId}?date=${date}`);
  }

  async logPrayer(log: Omit<PrayerLog, 'id'>): Promise<PrayerLog> {
    return request<PrayerLog>('/prayers', {
      method: 'POST',
      body: JSON.stringify(log),
    });
  }

  // Quran
  async getQuranProgress(userId: string): Promise<QuranProgress | null> {
    return request<QuranProgress | null>(`/quran/${userId}`);
  }

  async updateQuranProgress(userId: string, data: Partial<QuranProgress>): Promise<QuranProgress> {
    return request<QuranProgress>(`/quran/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Streaks
  async getStreaks(userId: string): Promise<Streak[]> {
    return request<Streak[]>(`/streaks/${userId}`);
  }

  async updateStreak(userId: string, type: Streak['type'], data: Partial<Streak>): Promise<Streak> {
    return request<Streak>(`/streaks/${userId}/${type}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Brain Score
  async getBrainScores(userId: string, days = 30): Promise<BrainScore[]> {
    return request<BrainScore[]>(`/brain-score/${userId}?days=${days}`);
  }

  async calculateBrainScore(userId: string, date: string): Promise<BrainScore> {
    return request<BrainScore>(`/brain-score/${userId}/calculate`, {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
  }

  // Accountability
  async getCircles(userId: string): Promise<AccountabilityCircle[]> {
    return request<AccountabilityCircle[]>(`/circles?userId=${userId}`);
  }

  async createCircle(circle: Omit<AccountabilityCircle, 'id' | 'createdAt'>): Promise<AccountabilityCircle> {
    return request<AccountabilityCircle>('/circles', {
      method: 'POST',
      body: JSON.stringify(circle),
    });
  }

  async joinCircle(circleId: string, userId: string): Promise<AccountabilityCircle> {
    return request<AccountabilityCircle>(`/circles/${circleId}/join`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async leaveCircle(circleId: string, userId: string): Promise<void> {
    await request(`/circles/${circleId}/leave`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  // Subscriptions
  async getSubscription(userId: string): Promise<Subscription | null> {
    return request<Subscription | null>(`/subscriptions/${userId}`);
  }

  async updateSubscription(userId: string, data: Partial<Subscription>): Promise<Subscription> {
    return request<Subscription>(`/subscriptions/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Notifications
  async getNotificationSettings(userId: string): Promise<NotificationSettings | null> {
    return request<NotificationSettings | null>(`/notifications/settings/${userId}`);
  }

  async updateNotificationSettings(userId: string, data: Partial<NotificationSettings>): Promise<NotificationSettings> {
    return request<NotificationSettings>(`/notifications/settings/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Admin
  async getAdminOverview(): Promise<AdminOverview> {
    return request<AdminOverview>('/admin/overview');
  }

  async getAdminUsers(limit = 50): Promise<AdminUserSummary[]> {
    return request<AdminUserSummary[]>(`/admin/users?limit=${limit}`);
  }

  async getAdminSubscriptions(limit = 50): Promise<AdminSubscriptionSummary[]> {
    return request<AdminSubscriptionSummary[]>(`/admin/subscriptions?limit=${limit}`);
  }

  async getAdminTrafficMetrics(days = 7): Promise<AdminTrafficMetric[]> {
    return request<AdminTrafficMetric[]>(`/admin/traffic?days=${days}`);
  }
}
