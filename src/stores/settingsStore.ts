import { create } from 'zustand';

interface SettingsState {
  language: 'en' | 'ar';
  religionEnabled: boolean;
  drivingDetectionEnabled: boolean;
  mirrorFeatureEnabled: boolean;
  voicePromiseEnabled: boolean;
  guardianEnabled: boolean; // 3AM Guardian
  roastPersona: string;
  hourlyRate: number; // for cost calculations
  setLanguage: (lang: 'en' | 'ar') => void;
  setReligionEnabled: (enabled: boolean) => void;
  setDrivingDetection: (enabled: boolean) => void;
  setMirrorFeature: (enabled: boolean) => void;
  setRoastPersona: (persona: string) => void;
  setHourlyRate: (rate: number) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  language: 'en',
  religionEnabled: true,
  drivingDetectionEnabled: true,
  mirrorFeatureEnabled: false,
  voicePromiseEnabled: true,
  guardianEnabled: true,
  roastPersona: 'egyptian_dad',
  hourlyRate: 25,
  setLanguage: (language) => set({ language }),
  setReligionEnabled: (religionEnabled) => set({ religionEnabled }),
  setDrivingDetection: (drivingDetectionEnabled) => set({ drivingDetectionEnabled }),
  setMirrorFeature: (mirrorFeatureEnabled) => set({ mirrorFeatureEnabled }),
  setRoastPersona: (roastPersona) => set({ roastPersona }),
  setHourlyRate: (hourlyRate) => set({ hourlyRate }),
}));
