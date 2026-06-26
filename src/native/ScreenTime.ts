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
    return [];
  },
  async getInstalledApps() {
    return [];
  },
  async startMonitoring() { console.log('[Mock] Monitoring started'); },
  async stopMonitoring() { console.log('[Mock] Monitoring stopped'); },
};

export const screenTimeModule: ScreenTimeNativeModule =
  ScreenTimeModule || MockScreenTimeModule;
