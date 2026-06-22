/**
 * Schedules automated roast / motivation notifications throughout the day.
 * Uses expo-notifications. Safe in Expo Go (no-ops if permission denied).
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  arabicRoastNotifications,
  englishRoastNotifications,
  fillTokens,
  RoastNotif,
} from '../data/notificationRoasts';

const CHANNEL_ID = 'brainrot-roasts';

// Hours of the day we are willing to fire a roast at (local time, 24h).
// Avoids early-morning and late-night windows.
const ROAST_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

interface ScheduleContext {
  lang: 'en' | 'ar';
  name?: string;
  topApp?: string;
  topMinutes?: number;
  pendingTasks?: number;
  perDay?: number; // how many roasts to schedule per day (default 6)
}

interface UsageRoastContext extends ScheduleContext {
  totalMinutes?: number;
  limitMinutes?: number;
}

let lastScheduledOn: string | null = null;
let lastUsageRoastKey: string | null = null;

export async function ensurePermissions(): Promise<boolean> {
  try {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted) return true;
    const req = await Notifications.requestPermissionsAsync();
    return req.granted;
  } catch (err) {
    console.warn('notification permission check failed', err);
    return false;
  }
}

async function setupAndroidChannel() {
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Roasts & Motivation',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  } catch (err) {
    console.warn('android channel setup failed', err);
  }
}

function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Cancel anything previously scheduled and queue a fresh batch for today.
 * Idempotent per-day: re-running on the same day won't double-schedule.
 */
export async function scheduleDailyRoasts(ctx: ScheduleContext): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  if (lastScheduledOn === today) return 0;

  const granted = await ensurePermissions();
  if (!granted) return 0;
  await setupAndroidChannel();

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}

  const bank: RoastNotif[] = ctx.lang === 'ar' ? arabicRoastNotifications : englishRoastNotifications;
  const perDay = ctx.perDay ?? 6;
  const hours = shuffle(ROAST_HOURS).slice(0, perDay).sort((a, b) => a - b);
  const picks = pickN(bank, perDay);

  let scheduled = 0;
  for (let i = 0; i < hours.length; i++) {
    const hour = hours[i];
    const minute = Math.floor(Math.random() * 50) + 5; // 5–54 to dodge the :00 stampede
    const fireDate = new Date();
    fireDate.setHours(hour, minute, 0, 0);
    if (fireDate.getTime() <= Date.now() + 60_000) continue; // already passed

    const notif = picks[i] ?? bank[Math.floor(Math.random() * bank.length)];
    const ctxFill = {
      name: ctx.name,
      minutes: ctx.topMinutes ?? 30,
      app: ctx.topApp ?? (ctx.lang === 'ar' ? 'تيك توك' : 'TikTok'),
      tasks: ctx.pendingTasks ?? 3,
    };

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: fillTokens(notif.title, ctxFill),
          body: fillTokens(notif.body, ctxFill),
          sound: true,
          data: { type: 'roast', tone: notif.tone },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fireDate,
          channelId: CHANNEL_ID,
        } as Notifications.DateTriggerInput,
      });
      scheduled++;
    } catch (err) {
      console.warn('failed to schedule roast notification', err);
    }
  }

  lastScheduledOn = today;
  return scheduled;
}

/**
 * Fire one roast immediately. Useful for "send me one now" buttons.
 */
export async function fireRoastNow(ctx: ScheduleContext): Promise<void> {
  const granted = await ensurePermissions();
  if (!granted) return;
  await setupAndroidChannel();

  const bank = ctx.lang === 'ar' ? arabicRoastNotifications : englishRoastNotifications;
  const notif = bank[Math.floor(Math.random() * bank.length)];
  const ctxFill = {
    name: ctx.name,
    minutes: ctx.topMinutes ?? 30,
    app: ctx.topApp ?? (ctx.lang === 'ar' ? 'تيك توك' : 'TikTok'),
    tasks: ctx.pendingTasks ?? 3,
  };

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: fillTokens(notif.title, ctxFill),
        body: fillTokens(notif.body, ctxFill),
        sound: true,
        data: { type: 'roast', tone: notif.tone, immediate: true },
      },
      trigger: null,
    });
  } catch (err) {
    console.warn('failed to fire immediate roast', err);
  }
}

export async function fireUsageRoast(ctx: UsageRoastContext): Promise<void> {
  const total = ctx.totalMinutes ?? ctx.topMinutes ?? 0;
  const limit = ctx.limitMinutes;
  const bucket = limit && total >= limit ? `limit-${limit}` : `usage-${Math.floor(total / 30)}`;
  const today = new Date().toISOString().split('T')[0];
  const key = `${today}-${ctx.lang}-${ctx.topApp ?? 'overall'}-${bucket}`;

  if (total < 30 && (!limit || total < limit)) return;
  if (lastUsageRoastKey === key) return;

  lastUsageRoastKey = key;
  await fireRoastNow({
    ...ctx,
    topMinutes: total,
  });
}

/** Reset the once-a-day guard (e.g. when the user changes language). */
export function resetSchedulingGuard() {
  lastScheduledOn = null;
  lastUsageRoastKey = null;
}
