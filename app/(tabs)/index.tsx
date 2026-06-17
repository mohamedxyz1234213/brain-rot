import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Radius, Sizing, Shadow } from '../../src/constants/theme';
import { Card } from '../../src/components/ui/Card';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Button } from '../../src/components/ui/Button';
import { SafeScreen } from '../../src/components/ui/SafeScreen';
import { useAuthStore } from '../../src/stores/authStore';
import { useBrainScoreStore } from '../../src/stores/brainScoreStore';
import { useScreenTimeStore } from '../../src/stores/screenTimeStore';
import { useTaskStore } from '../../src/stores/taskStore';
import { useFocusStore } from '../../src/stores/focusStore';
import { useStreakStore } from '../../src/stores/streakStore';
import { useXPStore } from '../../src/stores/xpStore';
import { useReligionStore } from '../../src/stores/religionStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { generateMorningBriefing } from '../../src/services/aiService';

const todayKey = () => new Date().toISOString().split('T')[0];

// Tracks the day the briefing was dismissed, for the lifetime of the app session.
let briefingDismissedOn: string | null = null;

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const brainScore = useBrainScoreStore((s) => s.currentScore);
  const levelName = useBrainScoreStore((s) => s.getLevelName());
  const totalMinutes = useScreenTimeStore((s) => s.totalMinutesToday);
  const limits = useScreenTimeStore((s) => s.limits);
  const logs = useScreenTimeStore((s) => s.logs);
  const prayerLogs = useReligionStore((s) => s.prayerLogs);
  const tasks = useTaskStore((s) => s.tasks);
  const frogTask = useTaskStore((s) => s.getEatTheFrogTask());
  const activeSession = useFocusStore((s) => s.activeSession);
  const totalFocusMinutes = useFocusStore((s) => s.totalFocusMinutesToday);
  const streak = useStreakStore((s) => s.getStreak('screen_time'));
  const xp = useXPStore((s) => s.xp);
  const level = useXPStore((s) => s.level);
  const levelInfo = useXPStore((s) => s.levelInfo);

  const todayTasks = tasks.filter((t) => t.status === 'pending');
  const completedToday = tasks.filter((t) => t.status === 'completed').length;
  const today = todayKey();
  const prayerCount = prayerLogs.filter(
    (l) => l.date.startsWith(today) && (l.status === 'on_time' || l.status === 'late')
  ).length;
  const screenTimeHours = Math.floor(totalMinutes / 60);
  const screenTimeMins = totalMinutes % 60;

  const usedForLimit = useCallback(
    (appBundleId: string) =>
      logs
        .filter((lg) => lg.appBundleId === appBundleId)
        .reduce((sum, lg) => sum + lg.minutesUsed, 0),
    [logs]
  );

  const morningBriefingEnabled = useSettingsStore((s) => s.morningBriefingEnabled);
  const scores = useBrainScoreStore((s) => s.scores);
  const [briefing, setBriefing] = useState<string | null>(null);

  useEffect(() => {
    if (!morningBriefingEnabled) return;
    if (briefingDismissedOn === todayKey()) return;
    let cancelled = false;
    const yesterday = scores.length > 1 ? scores[1] : scores[0];
    generateMorningBriefing(user?.name ?? 'you', {
      screenTime: totalMinutes,
      tasksCompleted: completedToday,
      tasksTotal: todayTasks.length + completedToday,
      brainScore: yesterday?.score ?? brainScore,
      streakDays: streak?.currentDays ?? 0,
    }).then((text) => {
      if (!cancelled) setBriefing(text);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [morningBriefingEnabled]);

  const dismissBriefing = () => {
    Haptics.selectionAsync();
    briefingDismissedOn = todayKey();
    setBriefing(null);
  };

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const stMinutes = useScreenTimeStore.getState().calculateTotalMinutes();
    const allTasks = useTaskStore.getState().tasks;
    const done = allTasks.filter((t) => t.status === 'completed').length;
    const stLimit =
      useScreenTimeStore.getState().limits.reduce((s, l) => s + l.dailyLimitMinutes, 0) || 180;
    const focusMin = useFocusStore.getState().totalFocusMinutesToday;
    const religionEnabled = useSettingsStore.getState().religionEnabled;
    const day = todayKey();
    const prayed = useReligionStore
      .getState()
      .prayerLogs.filter(
        (l) => l.date.startsWith(day) && (l.status === 'on_time' || l.status === 'late')
      ).length;

    useBrainScoreStore.getState().calculateScore({
      screenTimeMinutes: stMinutes,
      screenTimeLimit: stLimit,
      tasksCompleted: done,
      tasksTotal: Math.max(allTasks.length, 1),
      focusSessions: focusMin >= 50 ? 2 : focusMin > 0 ? 1 : 0,
      prayersCompleted: prayed,
      prayersTotal: 5,
      sleepHour: 23,
      religionEnabled,
    });
    setRefreshing(false);
  }, []);

  const handleCompleteFrog = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (frogTask) {
      useTaskStore.getState().completeTask(frogTask.id);
      useXPStore.getState().addXP(75, 'Eat the Frog completed');
      useStreakStore.getState().incrementStreak('tasks');
    }
  };

  const greeting = user?.name ? `Hey ${user.name}` : 'Assalamu Alaikum';

  return (
    <SafeScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.PRIMARY_LIGHT}
            colors={[Colors.PRIMARY_LIGHT]}
          />
        }
      >
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.subtitle}>Let's heal your brain today</Text>
          </View>
          <View style={styles.syncDot} />
        </Animated.View>

        {briefing && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Card style={styles.briefingCard}>
              <View style={styles.briefingHeader}>
                <Text style={styles.briefingTag}>📺 Morning Briefing</Text>
                <Pressable onPress={dismissBriefing} hitSlop={8} accessibilityRole="button" accessibilityLabel="Dismiss briefing">
                  <Text style={styles.briefingDismiss}>✕</Text>
                </Pressable>
              </View>
              <Text style={styles.briefingText}>{briefing}</Text>
            </Card>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <Card style={styles.scoreCard}>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreValue}>{brainScore}</Text>
              <Text style={styles.scoreLabel}>Brain Score</Text>
              <Text style={styles.levelLabel}>{levelName}</Text>
              <ProgressBar progress={brainScore} height={4} />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow}>
            <StatCard label="Screen Time" value={`${screenTimeHours}h ${screenTimeMins}m`} progress={Math.min((totalMinutes / 180) * 100, 100)} />
            <StatCard label="Tasks" value={`${completedToday}/${todayTasks.length + completedToday}`} progress={todayTasks.length > 0 ? (completedToday / (todayTasks.length + completedToday)) * 100 : 0} />
            <StatCard label="Focus" value={`${totalFocusMinutes} min`} progress={Math.min((totalFocusMinutes / 60) * 100, 100)} />
            <StatCard label="Prayers" value={`${prayerCount}/5`} progress={prayerCount * 20} />
            <StatCard label="Streak" value={`${streak?.currentDays ?? 0}`} progress={100} />
          </ScrollView>
        </Animated.View>

        {frogTask && (
          <Animated.View entering={FadeInDown.duration(500).delay(300)}>
            <Card style={styles.frogCard}>
              <Text style={styles.frogEmoji}>🐸</Text>
              <Text style={styles.frogTitle}>Eat the Frog</Text>
              <Text style={styles.frogTask}>{frogTask.title}</Text>
              <Button title="Complete to unlock apps" onPress={handleCompleteFrog} size="sm" variant="primary" />
            </Card>
          </Animated.View>
        )}

        {limits.length > 0 && (
          <Animated.View entering={FadeInDown.duration(500).delay(400)}>
            <Text style={styles.sectionTitle}>App Limits</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {limits.map((limit, i) => (
                <Animated.View key={limit.id} entering={FadeInRight.duration(300).delay(i * 100)}>
                  <AppLimitPill name={limit.appName} used={usedForLimit(limit.appBundleId)} limit={limit.dailyLimitMinutes} isHard={limit.isHardBlock} />
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(500).delay(500)}>
          <Card style={styles.levelCard}>
            <Text style={styles.levelTitle}>Level {level}</Text>
            <Text style={styles.xpText}>{xp} XP · {Math.round(levelInfo.progress * 100)}% to next</Text>
            <ProgressBar progress={levelInfo.progress * 100} height={4} />
          </Card>
        </Animated.View>

        {activeSession && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Card style={styles.focusCard}>
              <Text style={styles.focusTitle}>Focus Active</Text>
              <Text style={styles.focusMode}>{activeSession.mode} · {Math.floor((activeSession.targetMinutes * 60 - useFocusStore.getState().remainingSeconds) / 60)} min</Text>
            </Card>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(500).delay(600)}>
          <Card style={styles.motivationCard}>
            <Text style={styles.motivationText}>"Time is an Amanah. Every minute scrolling is a minute stolen from your purpose."</Text>
          </Card>
        </Animated.View>
      </ScrollView>
    </SafeScreen>
  );
}

function StatCard({ label, value, progress }: { label: string; value: string; progress: number }) {
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <ProgressBar progress={progress} height={4} />
    </Card>
  );
}

function AppLimitPill({ name, used, limit, isHard }: { name: string; used: number; limit: number; isHard: boolean }) {
  const progress = (used / limit) * 100;
  const color = progress > 90 ? Colors.DANGER : progress > 70 ? Colors.WARNING : Colors.PRIMARY_LIGHT;
  return (
    <Card style={styles.appLimitPill}>
      <Text style={styles.appName}>{name}</Text>
      <Text style={styles.appTime}>{used}m / {limit}m</Text>
      {isHard && <Text style={styles.hardBadge}>Hard Block</Text>}
      <ProgressBar progress={progress} color={color} height={4} />
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  greeting: { fontSize: Typography.sizes['2xl'], fontWeight: 700, color: Colors.TEXT_PRIMARY },
  subtitle: { fontSize: Typography.sizes.md, color: Colors.TEXT_SECONDARY, marginTop: Spacing.xs },
  syncDot: { width: Sizing.iconSm, height: Sizing.iconSm, borderRadius: Sizing.iconSm / 2, backgroundColor: Colors.SUCCESS },
  briefingCard: { marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.PRIMARY_LIGHT },
  briefingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  briefingTag: { fontSize: Typography.sizes.sm, fontWeight: 700, color: Colors.PRIMARY_LIGHT },
  briefingDismiss: { fontSize: Typography.sizes.md, color: Colors.TEXT_SECONDARY },
  briefingText: { fontSize: Typography.sizes.md, color: Colors.TEXT_PRIMARY, lineHeight: Typography.lineHeight.relaxed },
  scoreCard: { alignItems: 'center', marginBottom: Spacing.xl },
  scoreContainer: { alignItems: 'center' },
  scoreValue: { fontSize: Typography.sizes['4xl'], fontWeight: 800, color: Colors.TEXT_PRIMARY },
  scoreLabel: { fontSize: Typography.sizes.md, color: Colors.TEXT_SECONDARY, marginTop: Spacing.xs },
  levelLabel: { fontSize: Typography.sizes.sm, color: Colors.PRIMARY_LIGHT, marginTop: Spacing.xs },
  statsRow: { marginBottom: Spacing.xl },
  statCard: { width: 120, marginRight: Spacing.sm, padding: Spacing.md },
  statValue: { fontSize: Typography.sizes.lg, fontWeight: 700, color: Colors.TEXT_PRIMARY },
  statLabel: { fontSize: Typography.sizes.sm, color: Colors.TEXT_SECONDARY, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: Typography.sizes.lg, fontWeight: 600, color: Colors.TEXT_PRIMARY, marginBottom: Spacing.md },
  frogCard: { alignItems: 'center', marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.WARNING },
  frogEmoji: { fontSize: Typography.sizes['3xl'], marginBottom: Spacing.sm },
  frogTitle: { fontSize: Typography.sizes.lg, fontWeight: 600, color: Colors.TEXT_PRIMARY, marginTop: Spacing.sm },
  frogTask: { fontSize: Typography.sizes.md, color: Colors.TEXT_SECONDARY, marginTop: Spacing.xs, marginBottom: Spacing.md },
  levelCard: { marginBottom: Spacing.xl },
  levelTitle: { fontSize: Typography.sizes.lg, fontWeight: 600, color: Colors.TEXT_PRIMARY },
  xpText: { fontSize: Typography.sizes.sm, color: Colors.TEXT_SECONDARY, marginTop: Spacing.xs, marginBottom: Spacing.sm },
  focusCard: { marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.PRIMARY_LIGHT },
  focusTitle: { fontSize: Typography.sizes.lg, fontWeight: 600, color: Colors.TEXT_PRIMARY },
  focusMode: { fontSize: Typography.sizes.md, color: Colors.TEXT_SECONDARY, marginTop: Spacing.xs },
  motivationCard: { marginBottom: Spacing.xl },
  motivationText: { fontSize: Typography.sizes.md, color: Colors.TEXT_SECONDARY, lineHeight: Typography.lineHeight.relaxed },
  appLimitPill: { width: 140, marginRight: Spacing.sm, padding: Spacing.md },
  appName: { fontSize: Typography.sizes.md, fontWeight: 600, color: Colors.TEXT_PRIMARY },
  appTime: { fontSize: Typography.sizes.sm, color: Colors.TEXT_SECONDARY, marginVertical: Spacing.xs },
  hardBadge: { fontSize: Typography.sizes.xs, color: Colors.DANGER, fontWeight: 700, marginBottom: Spacing.xs },
});
