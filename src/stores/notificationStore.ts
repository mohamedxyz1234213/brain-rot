import { create } from 'zustand';
import { persist } from '../lib/persistence';

interface NotificationEntry {
  id: string;
  type: string;
  title: string;
  body: string;
  scheduledFor: string;
  delivered: boolean;
}

type NotifToggleKey = 'notificationsEnabled' | 'morningBriefing' | 'taskReminder' | 'middayCheckin' | 'screenTimeWarning' | 'dailyRoast' | 'sleepReminder' | 'prayerTimes' | 'drivingAlert';

interface NotificationState {
  notifications: NotificationEntry[];
  notificationsEnabled: boolean;
  morningBriefing: boolean;
  taskReminder: boolean;
  middayCheckin: boolean;
  screenTimeWarning: boolean;
  dailyRoast: boolean;
  sleepReminder: boolean;
  prayerTimes: boolean;
  drivingAlert: boolean;
  toggleSetting: (key: NotifToggleKey) => void;
  addNotification: (notification: Omit<NotificationEntry, 'id' | 'delivered'>) => void;
  removeNotification: (id: string) => void;
}

const generateId = () => `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const useNotificationStore = create<NotificationState>()(
  persist(
    {
      name: 'notifications',
      partialize: (state: any) => ({
        notificationsEnabled: state.notificationsEnabled,
        morningBriefing: state.morningBriefing,
        taskReminder: state.taskReminder,
        middayCheckin: state.middayCheckin,
        screenTimeWarning: state.screenTimeWarning,
        dailyRoast: state.dailyRoast,
        sleepReminder: state.sleepReminder,
        prayerTimes: state.prayerTimes,
        drivingAlert: state.drivingAlert,
      }),
    },
    (set, get) => ({
      notifications: [],
      notificationsEnabled: true,
      morningBriefing: true,
      taskReminder: true,
      middayCheckin: true,
      screenTimeWarning: true,
      dailyRoast: true,
      sleepReminder: true,
      prayerTimes: true,
      drivingAlert: true,

      toggleSetting: (key) => {
        const current = get()[key] as boolean;
        set({ [key]: !current });
      },

      addNotification: (notification) => {
        const entry: NotificationEntry = {
          ...notification,
          id: generateId(),
          delivered: false,
        };
        set({ notifications: [...get().notifications, entry] });
      },

      removeNotification: (id) => {
        set({ notifications: get().notifications.filter((n: NotificationEntry) => n.id !== id) });
      },
    })
  )
);
