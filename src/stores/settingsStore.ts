import { create } from 'zustand';
import { persist } from '../lib/persistence';

interface SettingsState {
  language: 'en' | 'ar';
  religionEnabled: boolean;
  drivingDetectionEnabled: boolean;
  mirrorFeatureEnabled: boolean;
  voicePromiseEnabled: boolean;
  guardianEnabled: boolean;
  roastPersona: string;
  hourlyRate: number;
  notificationsEnabled: boolean;
  morningBriefingEnabled: boolean;
  taskRemindersEnabled: boolean;
  dailyRoastEnabled: boolean;
  sleepReminderEnabled: boolean;
  prayerNotificationsEnabled: boolean;
  setLanguage: (language: 'en' | 'ar') => void;
  setReligionEnabled: (enabled: boolean) => void;
  setDrivingDetection: (enabled: boolean) => void;
  setMirrorFeature: (enabled: boolean) => void;
  setVoicePromise: (enabled: boolean) => void;
  setGuardian: (enabled: boolean) => void;
  setRoastPersona: (persona: string) => void;
  setHourlyRate: (rate: number) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setMorningBriefing: (enabled: boolean) => void;
  setTaskReminders: (enabled: boolean) => void;
  setDailyRoast: (enabled: boolean) => void;
  setSleepReminder: (enabled: boolean) => void;
  setPrayerNotifications: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    {
      name: 'settings',
    },
    (set) => ({
      language: 'en',
      religionEnabled: false,
      drivingDetectionEnabled: false,
      mirrorFeatureEnabled: false,
      voicePromiseEnabled: false,
      guardianEnabled: true,
      roastPersona: 'egyptian_dad',
      hourlyRate: 25,
      notificationsEnabled: true,
      morningBriefingEnabled: true,
      taskRemindersEnabled: true,
      dailyRoastEnabled: true,
      sleepReminderEnabled: true,
      prayerNotificationsEnabled: true,

      setLanguage: (language) => set({ language }),
      setReligionEnabled: (enabled) => set({ religionEnabled: enabled }),
      setDrivingDetection: (enabled) => set({ drivingDetectionEnabled: enabled }),
      setMirrorFeature: (enabled) => set({ mirrorFeatureEnabled: enabled }),
      setVoicePromise: (enabled) => set({ voicePromiseEnabled: enabled }),
      setGuardian: (enabled) => set({ guardianEnabled: enabled }),
      setRoastPersona: (persona) => set({ roastPersona: persona }),
      setHourlyRate: (rate) => set({ hourlyRate: rate }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setMorningBriefing: (enabled) => set({ morningBriefingEnabled: enabled }),
      setTaskReminders: (enabled) => set({ taskRemindersEnabled: enabled }),
      setDailyRoast: (enabled) => set({ dailyRoastEnabled: enabled }),
      setSleepReminder: (enabled) => set({ sleepReminderEnabled: enabled }),
      setPrayerNotifications: (enabled) => set({ prayerNotificationsEnabled: enabled }),
    })
  )
);
