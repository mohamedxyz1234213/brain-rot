import { NativeModules, NativeEventEmitter } from 'react-native';

const { MotionModule } = NativeModules;
const eventEmitter = MotionModule ? new NativeEventEmitter(MotionModule) : null;

export interface MotionNativeModule {
  requestPermission(): Promise<boolean>;
  startDrivingDetection(): Promise<void>;
  stopDrivingDetection(): Promise<void>;
}

export const MotionEvents = {
  onDrivingStarted: (callback: () => void) => {
    return eventEmitter?.addListener('onDrivingStarted', callback);
  },
  onDrivingStopped: (callback: () => void) => {
    return eventEmitter?.addListener('onDrivingStopped', callback);
  },
  onPhonePickedWhileDriving: (callback: () => void) => {
    return eventEmitter?.addListener('onPhonePickedWhileDriving', callback);
  },
};

const MockMotionModule: MotionNativeModule = {
  async requestPermission() { return true; },
  async startDrivingDetection() { console.log('[Mock] Driving detection started'); },
  async stopDrivingDetection() { console.log('[Mock] Driving detection stopped'); },
};

export const motionModule: MotionNativeModule = MotionModule || MockMotionModule;
