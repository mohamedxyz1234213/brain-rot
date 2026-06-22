/**
 * Prayer reminder pipeline.
 *
 * Two layers:
 *  1. Scheduled push notifications — for each of today's prayers, three
 *     reminders fire (at prayer start, +15 min, +30 min) unless the prayer
 *     has been marked. We cancel/reschedule on every refresh so reminders
 *     stop the moment a prayer is logged.
 *  2. Foreground hard-block watcher — `evaluatePrayerBlock` returns the
 *     unmarked prayer whose window is closing within 30 min (or already
 *     expired today and not yet logged). The root layout polls this and
 *     navigates into the prayer-block modal when a match is found.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import i18n from '../i18n';
import type { PrayerName, PrayerLog } from '../stores/religionStore';

const CHANNEL_ID = 'brainrot-prayer';

const PRAYER_ORDER: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export interface PrayerSchedule {
  prayer: PrayerName;
  /** Date object set to today at the prayer's local h:mm. */
  start: Date;
  /** End of this prayer's window (the next prayer's start, or end-of-day). */
  end: Date;
}

let lastScheduledOn: string | null = null;
let scheduledIds: string[] = [];

export function resetPrayerSchedulingGuard() {
  lastScheduledOn = null;
}

export function buildSchedule(prayerTimes: Record<PrayerName, string>): PrayerSchedule[] {
  const now = new Date();
  const dates: Record<PrayerName, Date> = {} as any;
  for (const p of PRAYER_ORDER) {
    const [h, m] = prayerTimes[p].split(':').map(Number);
    const d = new Date(now);
    d.setHours(h, m, 0, 0);
    dates[p] = d;
  }
  return PRAYER_ORDER.map((p, idx) => {
    const next = PRAYER_ORDER[idx + 1];
    const end = next
      ? dates[next]
      : (() => {
          const eod = new Date(now);
          eod.setHours(23, 59, 59, 999);
          return eod;
        })();
    return { prayer: p, start: dates[p], end };
  });
}

async function ensurePermissions(): Promise<boolean> {
  try {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted) return true;
    const req = await Notifications.requestPermissionsAsync();
    return req.granted;
  } catch {
    return false;
  }
}

async function setupChannel() {
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Prayer Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 300, 200, 300],
    });
  } catch {}
}

async function cancelOurNotifications() {
  for (const id of scheduledIds) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {}
  }
  scheduledIds = [];
}

/**
 * Schedule three reminders per prayer (start, +15, +30) for any prayer that
 * is not yet logged today. Safe to call repeatedly — it cancels the prior
 * batch first. No-op for prayers already in the past or already marked.
 */
export async function schedulePrayerReminders(
  prayerTimes: Record<PrayerName, string>,
  todaysLogs: PrayerLog[],
  opts: { force?: boolean } = {}
): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  if (!opts.force && lastScheduledOn === today) return 0;

  const granted = await ensurePermissions();
  if (!granted) return 0;
  await setupChannel();
  await cancelOurNotifications();

  const schedule = buildSchedule(prayerTimes);
  const logged = new Set(
    todaysLogs
      .filter((l) => l.date.startsWith(today) && l.status !== 'pending')
      .map((l) => l.prayer)
  );
  const now = Date.now();
  let count = 0;

  for (const { prayer, start } of schedule) {
    if (logged.has(prayer)) continue;
    const t = (key: string, opts?: Record<string, any>) => i18n.t(key, { prayer: i18n.t(`religion.${prayer}`), ...opts });
    const reminders: { offsetMin: number; title: string; body: string }[] = [
      { offsetMin: 0, title: t('religion.notificationTimeFor'), body: t('religion.notificationStandUp') },
      { offsetMin: 15, title: t('religion.notificationStillWaiting'), body: t('religion.notificationDontLetSlip') },
      { offsetMin: 30, title: t('religion.notificationLastCall'), body: t('religion.notificationWillLock') },
    ];
    for (const r of reminders) {
      const fire = new Date(start.getTime() + r.offsetMin * 60_000);
      if (fire.getTime() <= now + 30_000) continue;
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: r.title,
            body: r.body,
            sound: true,
            data: { type: 'prayer_reminder', prayer },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: fire,
            channelId: CHANNEL_ID,
          } as Notifications.DateTriggerInput,
        });
        scheduledIds.push(id);
        count++;
      } catch {}
    }
  }

  lastScheduledOn = today;
  return count;
}

/**
 * Cancel reminders for a prayer that was just marked. Light wrapper around
 * the scheduling reset — we just rebuild from current logs.
 */
export async function refreshAfterPrayerLogged(
  prayerTimes: Record<PrayerName, string>,
  todaysLogs: PrayerLog[]
) {
  await schedulePrayerReminders(prayerTimes, todaysLogs, { force: true });
}

/**
 * Decide whether the user should be hard-blocked right now.
 * Returns the offending prayer when:
 *   - it is unmarked
 *   - we are inside its window
 *   - the window ends within `warnMinutes` (default 30)
 * Otherwise returns null.
 */
export function evaluatePrayerBlock(
  prayerTimes: Record<PrayerName, string>,
  todaysLogs: PrayerLog[],
  warnMinutes = 30
): PrayerName | null {
  const today = new Date().toISOString().split('T')[0];
  const logged = new Set(
    todaysLogs
      .filter((l) => l.date.startsWith(today) && l.status !== 'pending')
      .map((l) => l.prayer)
  );
  const now = Date.now();
  const schedule = buildSchedule(prayerTimes);

  for (const { prayer, start, end } of schedule) {
    if (logged.has(prayer)) continue;
    if (now < start.getTime()) continue; // prayer not in yet
    const msLeft = end.getTime() - now;
    if (msLeft <= 0) continue; // window already closed — handled by "missed"
    if (msLeft <= warnMinutes * 60_000) return prayer;
  }
  return null;
}

export function getPrayerLabel(prayer: PrayerName): string {
  return i18n.t(`religion.${prayer}`);
}
