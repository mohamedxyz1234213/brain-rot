import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Radius, Sizing, Gradients, LetterSpacing, ANIMATION, Shadow } from '../../src/constants/theme';
import { Card } from '../../src/components/ui/Card';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { CircularProgress } from '../../src/components/ui/CircularProgress';
import { Button } from '../../src/components/ui/Button';
import { SafeScreen } from '../../src/components/ui/SafeScreen';
import { HeroPanel } from '../../src/components/ui/HeroPanel';
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
  const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <SafeScreen tabBarSpacing>
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
        <HeroPanel
          style={styles.heroPanel}
          eyebrow={dateLabel}
          title={greeting}
          subtitle="Let's heal your brain today"
          badge={
            <View style={styles.heroPill}>
              <View style={styles.heroDot} />
              <Text style={styles.heroPillText}>Live</Text>
            </View>
          }
        >
          <View style={styles.heroScore}>
            <CircularProgress progress={brainScore} size={176} strokeWidth={12} backgroundColor="rgba(242,230,218,0.18)" gradient={Gradients.score}>
              <Text style={styles.scoreValue}>{brainScore}</Text>
              <Text style={styles.scoreLabel}>Brain Score</Text>
              <Text style={styles.levelLabel}>{levelName}</Text>
            </CircularProgress>
            <View style={styles.heroProgressWrap}>
              <ProgressBar progress={brainScore} height={6} backgroundColor="rgba(242,230,218,0.18)" gradient={Gradients.score} />
            </View>
          </View>
        </HeroPanel>

        {briefing && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Card glass style={styles.briefingCard}>
              <View style={styles.briefingHeader}>
                <View style={styles.briefingTagRow}>
                  <Ionicons name="sunny-outline" size={Sizing.iconSm} color={Colors.PRIMARY_LIGHT} />
                  <Text style={styles.briefingTag}>Morning Briefing</Text>
                </View>
                <Pressable onPress={dismissBriefing} hitSlop={8} accessibilityRole="button" accessibilityLabel="Dismiss briefing">
                  <Ionicons name="close" size={Sizing.iconMd} color={Colors.TEXT_SECONDARY} />
                </Pressable>
              </View>
              <Text style={styles.briefingText}>{briefing}</Text>
            </Card>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Today</Text>
            <Text style={styles.sectionMeta}>Live overview</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
            <StatCard label="Screen Time" value={`${screenTimeHours}h ${screenTimeMins}m`} progress={Math.min((totalMinutes / 180) * 100, 100)} />
            <StatCard label="Tasks" value={`${completedToday}/${todayTasks.length + completedToday}`} progress={todayTasks.length > 0 ? (completedToday / (todayTasks.length + completedToday)) * 100 : 0} />
            <StatCard label="Focus" value={`${totalFocusMinutes} min`} progress={Math.min((totalFocusMinutes / 60) * 100, 100)} />
            <StatCard label="Prayers" value={`${prayerCount}/5`} progress={prayerCount * 20} />
            <StatCard label="Streak" value={`${streak?.currentDays ?? 0}`} progress={100} />
          </ScrollView>
        </Animated.View>

        {frogTask && (
          <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.sectionBlock}>
            <Card glass style={styles.frogCard}>
              <View style={styles.frogIconWrap}>
                <Ionicons name="flame" size={Sizing.iconLg} color={Colors.WARNING} />
              </View>
              <Text style={styles.frogTitle}>Eat the Frog</Text>
              <Text style={styles.frogTask} numberOfLines={2}>{frogTask.title}</Text>
              <Button title="Complete to unlock apps" onPress={handleCompleteFrog} size="sm" variant="primary" />
            </Card>
          </Animated.View>
        )}

        {limits.length > 0 && (
          <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>App Limits</Text>
              <Text style={styles.sectionMeta}>{limits.length} tracked</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.limitRow}>
              {limits.map((limit, i) => (
                <Animated.View key={limit.id} entering={FadeInRight.duration(300).delay(i * 100)}>
                  <AppLimitPill name={limit.appName} used={usedForLimit(limit.appBundleId)} limit={limit.dailyLimitMinutes} isHard={limit.isHardBlock} />
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(500).delay(500)} style={styles.sectionBlock}>
          <Card glass style={styles.levelCard}>
            <View style={styles.levelHeader}>
              <View>
                <Text style={styles.levelKicker}>Growth</Text>
                <Text style={styles.levelTitle}>Level {level}</Text>
              </View>
              <Text style={styles.levelPercent}>{Math.round(levelInfo.progress * 100)}%</Text>
            </View>
            <Text style={styles.xpText}>{xp} XP to your next unlock</Text>
            <ProgressBar progress={levelInfo.progress * 100} height={7} backgroundColor="rgba(67,104,111,0.10)" gradient={Gradients.brand} />
          </Card>
        </Animated.View>

        {activeSession && (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.sectionBlock}>
            <Card glass style={styles.focusCard}>
              <View style={styles.focusHeader}>
                <View style={styles.focusDot} />
                <Text style={styles.focusTitle}>Focus Active</Text>
              </View>
              <Text style={styles.focusMode}>{activeSession.mode} · {Math.floor((activeSession.targetMinutes * 60 - useFocusStore.getState().remainingSeconds) / 60)} min completed</Text>
            </Card>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(500).delay(600)} style={styles.sectionBlock}>
          <Card glass style={styles.motivationCard}>
            <Text style={styles.motivationText}>"Time is an Amanah. Every minute scrolling is a minute stolen from your purpose."</Text>
          </Card>
        </Animated.View>
      </ScrollView>
    </SafeScreen>
  );
}

function StatCard({ label, value, progress }: { label: string; value: string; progress: number }) {
  return (
    <Card dense glass style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <ProgressBar progress={progress} height={5} gradient={Gradients.brand} />
    </Card>
  );
}

function AppLimitPill({ name, used, limit, isHard }: { name: string; used: number; limit: number; isHard: boolean }) {
  const progress = (used / limit) * 100;
  const color = progress > 90 ? Colors.DANGER : progress > 70 ? Colors.WARNING : Colors.PRIMARY_LIGHT;
  return (
    <Card dense glass style={styles.appLimitPill}>
      <Text style={styles.appName}>{name}</Text>
      <Text style={styles.appTime}>{used}m / {limit}m</Text>
      {isHard && <Text style={styles.hardBadge}>Hard Block</Text>}
      <ProgressBar progress={progress} color={color} height={5} gradient={progress <= 70 ? Gradients.brand : undefined} />
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing['3xl'] },
  heroPanel: { marginBottom: Spacing['2xl'] },
  heroPill: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: 'rgba(242,230,218,0.16)', borderWidth: 1, borderColor: 'rgba(242,230,218,0.32)' },
  heroPillText: { fontSize: Typography.sizes.xs, fontFamily: Typography.families.featureSemi, color: Colors.TEXT_ON_PRIMARY, letterSpacing: LetterSpacing.wide, textTransform: 'uppercase' },
  heroDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.SUCCESS },
  heroScore: { alignItems: 'center', gap: Spacing.lg, width: '100%' },
  heroProgressWrap: { width: '100%', paddingHorizontal: Spacing.xs },
  sectionBlock: { marginBottom: Spacing['2xl'] },
  briefingCard: { marginBottom: Spacing.xl, borderLeftWidth: Spacing.xs, borderLeftColor: Colors.PRIMARY },
  briefingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  briefingTagRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  briefingTag: { fontSize: Typography.sizes.xs, fontFamily: Typography.families.featureSemi, color: Colors.PRIMARY, letterSpacing: LetterSpacing.wide, textTransform: 'uppercase' },
  briefingText: { fontSize: Typography.sizes.md, fontFamily: Typography.families.body, color: Colors.TEXT_PRIMARY, lineHeight: Typography.lineHeight.relaxed },
  scoreValue: { fontSize: Typography.sizes['4xl'] + 4, fontFamily: Typography.families.numeric, color: Colors.TEXT_ON_PRIMARY, letterSpacing: LetterSpacing.tight },
  scoreLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.families.featureMedium, color: 'rgba(242,230,218,0.72)', marginTop: Spacing.xs, letterSpacing: LetterSpacing.wide, textTransform: 'uppercase' },
  levelLabel: { fontSize: Typography.sizes.sm, fontFamily: Typography.families.featureSemi, color: Colors.TEXT_ON_PRIMARY, marginTop: Spacing.xs },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: Spacing.md },
  sectionTitle: { fontSize: Typography.sizes.xl, fontFamily: Typography.families.displaySemi, color: Colors.TEXT_PRIMARY, letterSpacing: LetterSpacing.tight },
  sectionMeta: { fontSize: Typography.sizes.xs, fontFamily: Typography.families.featureSemi, color: Colors.TEXT_SECONDARY, letterSpacing: LetterSpacing.wide, textTransform: 'uppercase', paddingBottom: 2 },
  statsRow: { paddingBottom: Spacing.xs, gap: Spacing.md },
  statCard: { width: 136, minHeight: 116, padding: Spacing.lg, borderColor: 'rgba(67,104,111,0.10)' },
  statValue: { fontSize: Typography.sizes.xl, fontFamily: Typography.families.numeric, color: Colors.TEXT_PRIMARY, letterSpacing: LetterSpacing.tight },
  statLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.families.featureMedium, color: Colors.TEXT_SECONDARY, marginBottom: Spacing.sm, marginTop: 2, letterSpacing: LetterSpacing.wide, textTransform: 'uppercase' },
  frogCard: { alignItems: 'center', borderColor: 'rgba(194,145,78,0.24)', backgroundColor: 'rgba(255,255,255,0.80)' },
  frogIconWrap: { width: 52, height: 52, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md, backgroundColor: Colors.WARNING_LIGHT, borderWidth: 1, borderColor: 'rgba(194,145,78,0.22)' },
  frogTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.families.featureSemi, color: Colors.TEXT_PRIMARY, letterSpacing: LetterSpacing.tight },
  frogTask: { fontSize: Typography.sizes.md, fontFamily: Typography.families.body, color: Colors.TEXT_SECONDARY, marginTop: Spacing.xs, marginBottom: Spacing.lg, textAlign: 'center', lineHeight: Typography.lineHeight.normal },
  limitRow: { paddingBottom: Spacing.xs, gap: Spacing.md },
  levelCard: { borderColor: 'rgba(67,104,111,0.12)' },
  levelHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: Spacing.sm },
  levelKicker: { fontSize: Typography.sizes.xs, fontFamily: Typography.families.featureSemi, color: Colors.PRIMARY, letterSpacing: LetterSpacing.wide, textTransform: 'uppercase', marginBottom: 2 },
  levelTitle: { fontSize: Typography.sizes.xl, fontFamily: Typography.families.displaySemi, color: Colors.TEXT_PRIMARY, letterSpacing: LetterSpacing.tight },
  levelPercent: { fontSize: Typography.sizes['2xl'], fontFamily: Typography.families.numeric, color: Colors.PRIMARY_DARK, letterSpacing: LetterSpacing.tight },
  xpText: { fontSize: Typography.sizes.sm, fontFamily: Typography.families.bodyMedium, color: Colors.TEXT_SECONDARY, marginBottom: Spacing.md },
  focusCard: { borderColor: 'rgba(87,126,134,0.22)', backgroundColor: 'rgba(255,255,255,0.82)' },
  focusHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  focusDot: { width: 9, height: 9, borderRadius: Radius.full, backgroundColor: Colors.SUCCESS },
  focusTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.families.featureSemi, color: Colors.TEXT_PRIMARY },
  focusMode: { fontSize: Typography.sizes.md, fontFamily: Typography.families.body, color: Colors.TEXT_SECONDARY, marginTop: Spacing.xs, lineHeight: Typography.lineHeight.normal },
  motivationCard: { borderColor: 'rgba(40,49,51,0.08)' },
  motivationText: { fontSize: Typography.sizes.md, fontFamily: Typography.families.body, color: Colors.TEXT_PRIMARY, lineHeight: Typography.lineHeight.relaxed, fontStyle: 'italic' },
  appLimitPill: { width: 150, minHeight: 118, padding: Spacing.lg, borderColor: 'rgba(40,49,51,0.08)', ...Shadow.sm },
  appName: { fontSize: Typography.sizes.md, fontFamily: Typography.families.featureSemi, color: Colors.TEXT_PRIMARY, letterSpacing: LetterSpacing.tight },
  appTime: { fontSize: Typography.sizes.sm, fontFamily: Typography.families.body, color: Colors.TEXT_SECONDARY, marginVertical: Spacing.xs },
  hardBadge: { fontSize: Typography.sizes.xs, fontFamily: Typography.families.featureSemi, color: Colors.DANGER, marginBottom: Spacing.xs, letterSpacing: LetterSpacing.wide, textTransform: 'uppercase' },
});
