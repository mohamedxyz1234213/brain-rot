/**
 * IBackendService — the single interface both backends must implement.
 * Switching backends = changing EXPO_PUBLIC_BACKEND env var only.
 */

// ---------- Domain Types ----------

export interface User {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  avatar?: string;
  brainScore: number;
  xp: number;
  level: string;
  streakDays: number;
  roastPersona: string;
  language: 'en' | 'ar';
  religionEnabled: boolean;
  subscriptionTier: 'free' | 'healed' | 'ascended' | 'family' | 'lifetime';
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  estimatedMinutes?: number;
  isEatTheFrog: boolean;
  isAppUnlocker: boolean;
  isRecurring: boolean;
  recurringPattern?: string;
  status: 'pending' | 'completed' | 'abandoned';
  completedAt?: string;
  postponeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScreenTimeLog {
  id: string;
  userId: string;
  date: string;
  appBundleId: string;
  appName: string;
  minutesUsed: number;
  limit: number;
  overageMinutes: number;
  blockedAttempts: number;
}

export interface AppLimit {
  id: string;
  userId: string;
  appBundleId: string;
  appName: string;
  dailyLimitMinutes: number;
  isHardBlock: boolean;
  isEnabled: boolean;
}

export interface FocusSession {
  id: string;
  userId: string;
  mode: 'pomodoro' | 'deep_work' | 'flow' | 'quick_sprint';
  startedAt: string;
  endedAt?: string;
  targetMinutes: number;
  actualMinutes?: number;
  taskId?: string;
  distractionCount: number;
  completed: boolean;
}

export interface RoastLog {
  id: string;
  userId: string;
  persona: string;
  trigger: string;
  text: string;
  isOffline: boolean;
  createdAt: string;
}

export interface PrayerLog {
  id: string;
  userId: string;
  date: string;
  prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  status: 'on_time' | 'late' | 'missed';
  prayedAt?: string;
}

export interface QuranProgress {
  id: string;
  userId: string;
  surah: number;
  ayah: number;
  juz: number;
  page: number;
  dailyPageGoal: number;
  khatmGoal: number;
  khatmCount: number;
  lastReadAt: string;
}

export interface Streak {
  id: string;
  userId: string;
  type: 'screen_time' | 'tasks' | 'prayers' | 'focus' | 'no_social' | 'fasting';
  currentDays: number;
  longestDays: number;
  lastDate: string;
  shieldsUsed: number;
}

export interface BrainScore {
  id: string;
  userId: string;
  date: string;
  score: number;
  screenTimeScore: number;
  taskScore: number;
  focusScore: number;
  prayerScore: number;
  sleepScore: number;
}

export interface AccountabilityCircle {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  maxMembers: number;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: 'free' | 'healed' | 'ascended' | 'family' | 'lifetime';
  revenueCatId?: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  morningBriefing: boolean;
  taskReminder: boolean;
  middayCheckin: boolean;
  screenTimeWarning: boolean;
  dailyRoast: boolean;
  sleepReminder: boolean;
  prayerTimes: boolean;
  drivingAlert: boolean;
}

// ---------- Service Interface ----------

export interface IBackendService {
  // Auth
  syncUser(clerkId: string, data: Partial<User>): Promise<User>;
  getUser(userId: string): Promise<User | null>;
  updateUser(userId: string, data: Partial<User>): Promise<User>;

  // Tasks
  getTasks(userId: string, status?: Task['status']): Promise<Task[]>;
  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
  updateTask(taskId: string, data: Partial<Task>): Promise<Task>;
  deleteTask(taskId: string): Promise<void>;

  // Screen Time
  getScreenTimeLogs(userId: string, date: string): Promise<ScreenTimeLog[]>;
  logScreenTime(log: Omit<ScreenTimeLog, 'id'>): Promise<ScreenTimeLog>;

  // App Limits
  getAppLimits(userId: string): Promise<AppLimit[]>;
  setAppLimit(limit: Omit<AppLimit, 'id'>): Promise<AppLimit>;
  updateAppLimit(limitId: string, data: Partial<AppLimit>): Promise<AppLimit>;
  deleteAppLimit(limitId: string): Promise<void>;

  // Focus Sessions
  getFocusSessions(userId: string, date?: string): Promise<FocusSession[]>;
  createFocusSession(session: Omit<FocusSession, 'id'>): Promise<FocusSession>;
  updateFocusSession(sessionId: string, data: Partial<FocusSession>): Promise<FocusSession>;

  // Roasts
  getRoastLogs(userId: string, limit?: number): Promise<RoastLog[]>;
  createRoastLog(log: Omit<RoastLog, 'id'>): Promise<RoastLog>;

  // Prayer
  getPrayerLogs(userId: string, date: string): Promise<PrayerLog[]>;
  logPrayer(log: Omit<PrayerLog, 'id'>): Promise<PrayerLog>;

  // Quran
  getQuranProgress(userId: string): Promise<QuranProgress | null>;
  updateQuranProgress(userId: string, data: Partial<QuranProgress>): Promise<QuranProgress>;

  // Streaks
  getStreaks(userId: string): Promise<Streak[]>;
  updateStreak(userId: string, type: Streak['type'], data: Partial<Streak>): Promise<Streak>;

  // Brain Score
  getBrainScores(userId: string, days?: number): Promise<BrainScore[]>;
  calculateBrainScore(userId: string, date: string): Promise<BrainScore>;

  // Accountability
  getCircles(userId: string): Promise<AccountabilityCircle[]>;
  createCircle(circle: Omit<AccountabilityCircle, 'id' | 'createdAt'>): Promise<AccountabilityCircle>;
  joinCircle(circleId: string, userId: string): Promise<AccountabilityCircle>;
  leaveCircle(circleId: string, userId: string): Promise<void>;

  // Subscriptions
  getSubscription(userId: string): Promise<Subscription | null>;
  updateSubscription(userId: string, data: Partial<Subscription>): Promise<Subscription>;

  // Notifications
  getNotificationSettings(userId: string): Promise<NotificationSettings | null>;
  updateNotificationSettings(userId: string, data: Partial<NotificationSettings>): Promise<NotificationSettings>;
}
