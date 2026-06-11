import { create } from 'zustand';
import { NotificationSettings } from '../services/backend/interface';
import { backendService } from '../services/backend';

interface ScheduledNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  scheduledFor: string;
  delivered: boolean;
}

interface NotificationState {
  settings: NotificationSettings | null;
  scheduledNotifications: ScheduledNotification[];
  isLoading: boolean;
  fetchSettings: (userId: string) => Promise<void>;
  updateSettings: (userId: string, data: Partial<NotificationSettings>) => Promise<void>;
  scheduleNotification: (notification: Omit<ScheduledNotification, 'id' | 'delivered'>) => void;
  cancelNotification: (notificationId: string) => void;
  scheduleDailyNotifications: (userId: string) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  settings: null,
  scheduledNotifications: [],
  isLoading: false,

  fetchSettings: async (userId) => {
    set({ isLoading: true });
    try {
      const settings = await backendService.getNotificationSettings(userId);
      set({ settings, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  updateSettings: async (userId, data) => {
    try {
      const updated = await backendService.updateNotificationSettings(userId, data);
      set({ settings: updated });
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
  },

  scheduleNotification: (notification) => {
    const newNotification: ScheduledNotification = {
      ...notification,
      id: Date.now().toString(),
      delivered: false,
    };
    set({
      scheduledNotifications: [...get().scheduledNotifications, newNotification],
    });
  },

  cancelNotification: (notificationId) => {
    set({
      scheduledNotifications: get().scheduledNotifications.filter(
        (n) => n.id !== notificationId
      ),
    });
  },

  scheduleDailyNotifications: (userId) => {
    const { settings } = get();
    if (!settings) return;

    const today = new Date();
    const notifications: Omit<ScheduledNotification, 'id' | 'delivered'>[] = [];

    if (settings.morningBriefing) {
      notifications.push({
        type: 'morning_briefing',
        title: '🌅 Morning Briefing',
        body: 'Previously on your life... Time for a new episode.',
        scheduledFor: new Date(today.setHours(7, 0, 0, 0)).toISOString(),
      });
    }

    if (settings.taskReminder) {
      notifications.push({
        type: 'task_reminder',
        title: '📋 Task Reminder',
        body: "You have tasks waiting. Don't let them down.",
        scheduledFor: new Date(today.setHours(9, 0, 0, 0)).toISOString(),
      });
    }

    if (settings.middayCheckin) {
      notifications.push({
        type: 'midday_checkin',
        title: '☀️ Midday Check-in',
        body: "How's your screen time looking? Stay strong.",
        scheduledFor: new Date(today.setHours(13, 0, 0, 0)).toISOString(),
      });
    }

    if (settings.screenTimeWarning) {
      notifications.push({
        type: 'screen_time_warning',
        title: '⚠️ Screen Time Warning',
        body: "You're approaching your daily limit. Wind down.",
        scheduledFor: new Date(today.setHours(18, 0, 0, 0)).toISOString(),
      });
    }

    if (settings.dailyRoast) {
      notifications.push({
        type: 'daily_roast',
        title: '🔥 Daily Roast',
        body: 'Time for your daily reality check...',
        scheduledFor: new Date(today.setHours(21, 0, 0, 0)).toISOString(),
      });
    }

    if (settings.sleepReminder) {
      notifications.push({
        type: 'sleep_reminder',
        title: '🌙 Sleep Reminder',
        body: 'Put the phone down. Your brain needs rest.',
        scheduledFor: new Date(today.setHours(23, 0, 0, 0)).toISOString(),
      });
    }

    notifications.forEach((n) => get().scheduleNotification(n));
  },
}));
