import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../stores/authStore';
import { useScreenTimeStore } from '../stores/screenTimeStore';
import { useBrainScoreStore } from '../stores/brainScoreStore';
import { useTaskStore } from '../stores/taskStore';
import { useFocusStore } from '../stores/focusStore';
import { useReligionStore } from '../stores/religionStore';
import { useStreakStore } from '../stores/streakStore';
import { useXPStore } from '../stores/xpStore';
import { useAccountabilityStore } from '../stores/accountabilityStore';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { backendService } from '../services/backend';
import { useSettingsStore } from '../stores/settingsStore';

/**
 * Hook that provides a single refresh function to sync all app data from the backend.
 * Use with PullToRefresh: <PullToRefresh onRefresh={refreshAll}>
 */
export function useRefreshAll() {
  const refreshAll = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    const today = new Date().toISOString().split('T')[0];

    // Fire all backend syncs in parallel
    const results = await Promise.allSettled([
      // Screen time + limits
      useScreenTimeStore.getState().syncToday(userId),
      // Brain scores
      useBrainScoreStore.getState().syncScores(userId),
      // Tasks from backend
      backendService.getTasks(userId),
      // Focus sessions from backend
      backendService.getFocusSessions(userId, today),
      // Prayer logs from backend
      backendService.getPrayerLogs(userId, today),
      // Quran progress from backend
      backendService.getQuranProgress(userId),
      // Streaks from backend
      backendService.getStreaks(userId),
      // Challenges + circles
      useAccountabilityStore.getState().fetchChallenges(),
      useAccountabilityStore.getState().fetchCircles(),
      // Subscription (pick up admin changes)
      useSubscriptionStore.getState().refreshSubscription(userId),
    ]);

    // Apply tasks to store
    const tasksResult = results[2];
    if (tasksResult.status === 'fulfilled' && Array.isArray(tasksResult.value)) {
      useTaskStore.setState({ tasks: tasksResult.value });
    }

    // Apply focus sessions to store
    const focusResult = results[3];
    if (focusResult.status === 'fulfilled' && Array.isArray(focusResult.value)) {
      const sessions = focusResult.value;
      const todaySessions = sessions.filter(
        (s) => s.startedAt.startsWith(today)
      );
      const totalFocusMinutesToday = todaySessions.reduce(
        (sum, s) => sum + (s.actualMinutes ?? 0),
        0
      );
      const focusSessions = sessions.map(({ userId, actualMinutes, ...rest }) => ({
        ...rest,
        actualMinutes: actualMinutes ?? 0,
      }));
      useFocusStore.setState({ sessions: focusSessions, totalFocusMinutesToday });
    }

    // Apply prayer logs to store
    const prayerResult = results[4];
    if (prayerResult.status === 'fulfilled' && Array.isArray(prayerResult.value)) {
      const prayerLogs = prayerResult.value.map((p) => ({
        id: p.id,
        prayer: p.prayer,
        status: p.status,
        prayedAt: p.prayedAt,
        date: p.date,
      }));
      useReligionStore.setState({ prayerLogs });
    }

    // Apply quran progress to store
    const quranResult = results[5];
    if (quranResult.status === 'fulfilled' && quranResult.value) {
      const q = quranResult.value;
      useReligionStore.setState({
        quranProgress: {
          currentSurah: q.surah,
          currentAyah: q.ayah,
          currentJuz: q.juz,
          currentPage: q.page,
          dailyPageGoal: q.dailyPageGoal,
          khatmGoal: q.khatmGoal,
          khatmCount: q.khatmCount,
          pagesReadToday: 0,
          lastReadAt: q.lastReadAt,
        },
      });
    }

    // Apply streaks to store
    const streaksResult = results[6];
    if (streaksResult.status === 'fulfilled' && Array.isArray(streaksResult.value)) {
      const streaks = streaksResult.value.map((s) => ({
        id: s.id,
        type: s.type,
        currentDays: s.currentDays,
        longestDays: s.longestDays,
        lastDate: s.lastDate,
        shieldsUsed: s.shieldsUsed,
        maxShields: 3,
        fireLevel: s.currentDays >= 30 ? 3 : s.currentDays >= 7 ? 2 : s.currentDays >= 1 ? 1 : 0,
      }));
      useStreakStore.setState({ streaks });
    }

    // Recalculate brain score with fresh data
    const stState = useScreenTimeStore.getState();
    const tkState = useTaskStore.getState();
    const fcState = useFocusStore.getState();
    const rlState = useReligionStore.getState();
    const settings = useSettingsStore.getState();

    const stMinutes = stState.calculateTotalMinutes();
    const allTasks = tkState.tasks;
    const done = allTasks.filter((t) => t.status === 'completed').length;
    const limits = stState.limits;
    const focusMin = fcState.totalFocusMinutesToday;
    const day = today;
    const prayed = rlState.prayerLogs.filter(
      (l) => l.date.startsWith(day) && (l.status === 'on_time' || l.status === 'late')
    ).length;

    const stLimit = limits.reduce((s, l) => s + l.dailyLimitMinutes, 0);
    const religionEnabled = settings.religionEnabled;

    const hasScoreInput =
      stMinutes > 0 || focusMin > 0 || done > 0 || prayed > 0 || allTasks.length > 0;

    if (hasScoreInput) {
      useBrainScoreStore.getState().calculateScore({
        screenTimeMinutes: stMinutes,
        screenTimeLimit: stLimit,
        tasksCompleted: done,
        tasksTotal: allTasks.length,
        focusSessions: focusMin >= 50 ? 2 : focusMin > 0 ? 1 : 0,
        prayersCompleted: prayed,
        prayersTotal: 5,
        sleepHour: 23,
        religionEnabled,
      });
    }
  }, []);

  return refreshAll;
}
