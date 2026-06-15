import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { ScreenTimeModule } = NativeModules;
const eventEmitter = ScreenTimeModule ? new NativeEventEmitter(ScreenTimeModule) : null;

export interface AppUsageInfo {
  bundleId: string;
  appName: string;
  minutesUsed: number;
  category?: string;
}

export interface InstalledApp {
  bundleId: string;
  name: string;
  category?: string;
}

export interface ScreenTimeNativeModule {
  requestPermission(): Promise<boolean>;
  setAppLimit(bundleId: string, dailyMinutes: number): Promise<void>;
  blockApp(bundleId: string): Promise<void>;
  unblockApp(bundleId: string): Promise<void>;
  getUsageStats(date: string): Promise<AppUsageInfo[]>;
  getInstalledApps(): Promise<InstalledApp[]>;
  startMonitoring(): Promise<void>;
  stopMonitoring(): Promise<void>;
}

export const ScreenTimeEvents = {
  onUsageLimitReached: (callback: (data: { bundleId: string; appName: string }) => void) => {
    return eventEmitter?.addListener('onUsageLimitReached', callback);
  },
  onBlockedAppOpened: (callback: (data: { bundleId: string; appName: string }) => void) => {
    return eventEmitter?.addListener('onBlockedAppOpened', callback);
  },
};

const MockScreenTimeModule: ScreenTimeNativeModule = {
  async requestPermission() { return true; },
  async setAppLimit(bundleId, dailyMinutes) { console.log(`[Mock] Set limit: ${bundleId} = ${dailyMinutes}min`); },
  async blockApp(bundleId) { console.log(`[Mock] Blocked: ${bundleId}`); },
  async unblockApp(bundleId) { console.log(`[Mock] Unblocked: ${bundleId}`); },
  async getUsageStats() {
    return [
      { bundleId: 'com.zhiliaoapp.musically', appName: 'TikTok', minutesUsed: 45 },
      { bundleId: 'com.instagram.android', appName: 'Instagram', minutesUsed: 30 },
      { bundleId: 'com.twitter.android', appName: 'X', minutesUsed: 20 },
      { bundleId: 'com.snapchat.android', appName: 'Snapchat', minutesUsed: 15 },
      { bundleId: 'com.google.android.youtube', appName: 'YouTube', minutesUsed: 35 },
    ];
  },
  async getInstalledApps() {
    return [
      { bundleId: 'com.zhiliaoapp.musically', name: 'TikTok', category: 'social' },
      { bundleId: 'com.instagram.android', name: 'Instagram', category: 'social' },
      { bundleId: 'com.twitter.android', name: 'X', category: 'social' },
      { bundleId: 'com.snapchat.android', name: 'Snapchat', category: 'social' },
      { bundleId: 'com.google.android.youtube', name: 'YouTube', category: 'entertainment' },
      { bundleId: 'com.facebook.katana', name: 'Facebook', category: 'social' },
      { bundleId: 'com.netflix.mediaclient', name: 'Netflix', category: 'entertainment' },
    ];
  },
  async startMonitoring() { console.log('[Mock] Monitoring started'); },
  async stopMonitoring() { console.log('[Mock] Monitoring stopped'); },
};

export const screenTimeModule: ScreenTimeNativeModule =
  ScreenTimeModule || MockScreenTimeModule;
