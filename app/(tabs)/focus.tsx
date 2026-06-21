import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Sizing, Shadow, Gradients, LetterSpacing, ANIMATION } from '../../src/constants/theme';
import { Button } from '../../src/components/ui/Button';
import { CircularProgress } from '../../src/components/ui/CircularProgress';
import { Card } from '../../src/components/ui/Card';
import { SafeScreen, TabHeader } from '../../src/components/ui/SafeScreen';
import { useFocusStore, FocusMode } from '../../src/stores/focusStore';
import { useXPStore } from '../../src/stores/xpStore';
import { useStreakStore } from '../../src/stores/streakStore';
import { useTaskStore } from '../../src/stores/taskStore';
import { screenTimeModule } from '../../src/native/ScreenTime';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
const MODES: { id: FocusMode; nameKey: string; duration: number; icon: IoniconName }[] = [
  { id: 'pomodoro', nameKey: 'focus.pomodoro', duration: 25, icon: 'timer-outline' },
  { id: 'deep_work', nameKey: 'focus.deepWork', duration: 90, icon: 'bulb-outline' },
  { id: 'flow', nameKey: 'focus.flow', duration: 60, icon: 'water-outline' },
  { id: 'quick_sprint', nameKey: 'focus.quickSprint', duration: 15, icon: 'flash-outline' },
];

async function blockDistractingApps() {
  try {
    const apps = await screenTimeModule.getInstalledApps();
    await Promise.all(apps.map((a) => screenTimeModule.blockApp(a.bundleId).catch(() => {})));
  } catch (err) {
    console.warn('Failed to block apps:', err);
  }
}

async function unblockDistractingApps() {
  try {
    const apps = await screenTimeModule.getInstalledApps();
    await Promise.all(apps.map((a) => screenTimeModule.unblockApp(a.bundleId).catch(() => {})));
  } catch (err) {
    console.warn('Failed to unblock apps:', err);
  }
}

export default function FocusScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ taskId?: string }>();

  const activeSession = useFocusStore((s) => s.activeSession);
  const isActive = useFocusStore((s) => s.isActive);
  const remainingSeconds = useFocusStore((s) => s.remainingSeconds);
  const distractionCount = useFocusStore((s) => s.activeSession?.distractionCount ?? 0);
  const startSession = useFocusStore((s) => s.startSession);
  const endSession = useFocusStore((s) => s.endSession);
  const pauseSession = useFocusStore((s) => s.pauseSession);
  const resumeSession = useFocusStore((s) => s.resumeSession);
  const logDistraction = useFocusStore((s) => s.logDistraction);
  const totalFocusMinutes = useFocusStore((s) => s.totalFocusMinutesToday);
  const tickTimer = useFocusStore((s) => s.tickTimer);

  const tasks = useTaskStore((s) => s.tasks);
  const completeTask = useTaskStore((s) => s.completeTask);
  const pendingTasks = useMemo(() => tasks.filter((t) => t.status === 'pending'), [tasks]);

  const [selectedMode, setSelectedMode] = useState<FocusMode>('pomodoro');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(params.taskId ?? pendingTasks[0]?.id ?? null);
  const [isPaused, setIsPaused] = useState(false);
  const [completed, setCompleted] = useState<{ mode: FocusMode; minutes: number; xp: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (params.taskId && pendingTasks.some((p) => p.id === params.taskId)) {
      setSelectedTaskId(params.taskId);
    }
  }, [params.taskId, pendingTasks]);

  useEffect(() => {
    if (!selectedTaskId && pendingTasks.length > 0) {
      setSelectedTaskId(pendingTasks[0].id);
    }
  }, [pendingTasks, selectedTaskId]);

  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => { tickTimer(); }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, isPaused]);

  useEffect(() => {
    if (remainingSeconds <= 0 && isActive) { handleCompleteSession(); }
  }, [remainingSeconds, isActive]);

  // Auto-unblock if the session is cleared (safety guard)
  useEffect(() => {
    return () => {
      if (!useFocusStore.getState().activeSession) {
        unblockDistractingApps();
      }
    };
  }, []);

  const handleStartSession = async () => {
    if (!selectedTaskId) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    startSession(selectedMode, selectedTaskId);
    setIsPaused(false);
    blockDistractingApps();
  };

  const handleCompleteSession = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const session = useFocusStore.getState().activeSession;
    const mode = session?.mode ?? selectedMode;
    const minutes = session?.targetMinutes ?? 0;
    const taskId = session?.taskId;
    endSession(true);
    const xpMap: Record<FocusMode, number> = { pomodoro: 30, deep_work: 50, flow: 40, quick_sprint: 30 };
    const xp = xpMap[mode] ?? 30;
    useXPStore.getState().addXP(xp, `Focus session completed: ${mode}`);
    useStreakStore.getState().incrementStreak('focus');
    if (taskId) {
      completeTask(taskId);
      useXPStore.getState().addXP(20, 'Task completed via focus');
      useStreakStore.getState().incrementStreak('tasks');
    }
    await unblockDistractingApps();
    setIsPaused(false);
    setCompleted({ mode, minutes, xp });
  };

  const handleEndSession = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    endSession(false);
    await unblockDistractingApps();
  };

  const handleFinishTaskNow = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    handleCompleteSession();
  };

  const handleLogDistraction = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    logDistraction();
    useXPStore.getState().deductXP(5, 'Distraction logged');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeTask = activeSession?.taskId ? tasks.find((t) => t.id === activeSession.taskId) : null;

  if (activeSession) {
    const progress = 1 - remainingSeconds / (activeSession.targetMinutes * 60);
    return (
      <SafeScreen tabBarSpacing>
        <ScrollView contentContainerStyle={styles.timerScroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(ANIMATION.entrance.duration)} style={styles.timerContainer}>
            <Text style={styles.modeLabel}>{t(MODES.find((m) => m.id === activeSession.mode)?.nameKey ?? activeSession.mode)}</Text>
            <View style={[styles.timerCircle, isActive && !isPaused && styles.timerCircleActive]}>
              <CircularProgress progress={progress * 100} size={240} strokeWidth={14} gradient={Gradients.brand}>
                <Text style={styles.timerText}>{formatTime(remainingSeconds)}</Text>
                <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
              </CircularProgress>
            </View>

            {activeTask && (
              <View style={styles.activeTaskCard}>
                <Text style={styles.activeTaskKicker}>{t('focus.selectedTask')}</Text>
                <Text style={styles.activeTaskTitle} numberOfLines={2}>{activeTask.title}</Text>
                <View style={styles.lockRow}>
                  <Ionicons name="lock-closed" size={Sizing.iconSm} color={Colors.DANGER} />
                  <Text style={styles.lockText} numberOfLines={1}>{t('focus.appsBlocked')}</Text>
                </View>
              </View>
            )}

            {distractionCount > 0 && <Text style={styles.distractionText}>{distractionCount} {t('focus.distraction')}</Text>}

            <View style={styles.controls}>
              <Pressable style={styles.secondaryBtn} onPress={handleLogDistraction} accessibilityRole="button" accessibilityLabel="Log distraction">
                <Text style={styles.secondaryBtnText} numberOfLines={1}>{t('focus.distraction')}</Text>
              </Pressable>
              <Pressable
                style={[styles.primaryBtn, isPaused && styles.resumeBtn]}
                onPress={() => { setIsPaused(!isPaused); if (isPaused) resumeSession(); else pauseSession(); }}
                accessibilityRole="button"
                accessibilityLabel={isPaused ? 'Resume' : 'Pause'}
              >
                <Text style={styles.primaryBtnText} numberOfLines={1}>{isPaused ? t('focus.resume') : t('focus.pause')}</Text>
              </Pressable>
              <Pressable style={styles.dangerBtn} onPress={handleEndSession} accessibilityRole="button" accessibilityLabel="End session">
                <Text style={styles.dangerBtnText} numberOfLines={1}>{t('focus.end')}</Text>
              </Pressable>
            </View>

            <Pressable style={styles.finishTaskBtn} onPress={handleFinishTaskNow} accessibilityRole="button">
              <Ionicons name="checkmark-done" size={Sizing.iconSm} color={Colors.SUCCESS} />
              <Text style={styles.finishTaskText} numberOfLines={1}>{t('common.done')}</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </SafeScreen>
    );
  }

  if (completed) {
    return (
      <SafeScreen tabBarSpacing>
        <ScrollView contentContainerStyle={styles.timerScroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(ANIMATION.entrance.duration)} style={styles.timerContainer}>
            <Ionicons name="sparkles" size={Sizing.avatarLg} color={Colors.PRIMARY_LIGHT} style={styles.celebrateEmoji} />
            <Text style={styles.celebrateTitle}>{t('focus.sessionComplete')}</Text>
            <Text style={styles.celebrateSub} numberOfLines={2}>
              {t('focus.minOf', { minutes: completed.minutes, mode: t(MODES.find((m) => m.id === completed.mode)?.nameKey ?? completed.mode) })}
            </Text>
            <View style={styles.unlockRow}>
              <Ionicons name="lock-open" size={Sizing.iconSm} color={Colors.SUCCESS} />
              <Text style={styles.unlockText} numberOfLines={1}>{t('focus.appsUnlocked')}</Text>
            </View>
            <View style={styles.xpPill}>
              <Text style={styles.xpPillText}>{t('focus.xpEarned', { xp: completed.xp })}</Text>
            </View>
            <View style={{ height: Spacing['2xl'] }} />
            <Button title={t('common.done')} onPress={() => { Haptics.selectionAsync(); setCompleted(null); }} size="lg" />
          </Animated.View>
        </ScrollView>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen tabBarSpacing>
      <TabHeader
        eyebrow={t('focus.totalToday', { count: totalFocusMinutes })}
        title={t('focus.startSession')}
        rightAction={
          <View style={styles.livePill}>
            <Ionicons name="lock-closed-outline" size={Sizing.iconSm} color={Colors.SUCCESS} />
            <Text style={styles.liveText}>{t('focus.blockingEnforced')}</Text>
          </View>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing['3xl'] }}>
        <Animated.View entering={FadeInDown.duration(ANIMATION.entrance.duration)} style={styles.lockoutBanner}>
          <Ionicons name="shield-checkmark" size={Sizing.iconMd} color={Colors.PRIMARY} />
          <View style={{ flex: 1 }}>
            <Text style={styles.lockoutTitle}>{t('focus.blockingEnforced')}</Text>
            <Text style={styles.lockoutSub}>{t('focus.blockingEnforcedHint')}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(ANIMATION.entrance.duration).delay(ANIMATION.stagger)} style={styles.taskPickerWrap}>
          <Text style={styles.sectionTitle}>{t('focus.pickTaskFirst')}</Text>
          {pendingTasks.length === 0 ? (
            <Card glass style={styles.emptyTask}>
              <Ionicons name="add-circle-outline" size={Sizing.iconLg} color={Colors.PRIMARY_LIGHT} />
              <Text style={styles.emptyTaskText}>{t('focus.noTasksAvailable')}</Text>
            </Card>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.taskRow}>
              {pendingTasks.map((task) => {
                const active = selectedTaskId === task.id;
                return (
                  <Pressable
                    key={task.id}
                    onPress={() => { Haptics.selectionAsync(); setSelectedTaskId(task.id); }}
                    style={[styles.taskChip, active && styles.taskChipActive]}
                    accessibilityRole="button"
                  >
                    {task.isEatTheFrog && <Ionicons name="flame" size={14} color={active ? Colors.TEXT_ON_PRIMARY : Colors.WARNING} />}
                    <Text style={[styles.taskChipText, active && styles.taskChipTextActive]} numberOfLines={1}>
                      {task.title}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(ANIMATION.entrance.duration).delay(ANIMATION.stagger * 2)} style={styles.modes}>
          {MODES.map((mode) => (
            <View key={mode.id} style={styles.modeCardWrap}>
              <Pressable
                style={[styles.modeCard, selectedMode === mode.id && styles.modeCardActive]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedMode(mode.id); }}
                accessibilityRole="button"
                accessibilityLabel={t(mode.nameKey)}
              >
                <Ionicons name={mode.icon} size={Typography.sizes['3xl']} color={selectedMode === mode.id ? Colors.PRIMARY_DARK : Colors.PRIMARY_LIGHT} style={styles.modeEmoji} />
                <Text style={[styles.modeName, selectedMode === mode.id && styles.modeNameActive]}>{t(mode.nameKey)}</Text>
                <Text style={[styles.modeDuration, selectedMode === mode.id && styles.modeDurationActive]}>{mode.duration} {t('common.min')}</Text>
              </Pressable>
            </View>
          ))}
        </Animated.View>

        <View style={{ paddingHorizontal: Spacing.xl }}>
          <Button
            title={t('focus.startSession')}
            onPress={handleStartSession}
            size="lg"
            disabled={!selectedTaskId}
          />
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  livePill: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.SUCCESS_LIGHT, borderWidth: 1, borderColor: 'rgba(90,143,123,0.25)' },
  liveText: { fontSize: Typography.sizes.xs, fontFamily: Typography.families.featureSemi, color: Colors.SUCCESS, letterSpacing: LetterSpacing.wide, textTransform: 'uppercase' },
  lockoutBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginHorizontal: Spacing.xl, marginBottom: Spacing.lg, padding: Spacing.lg, borderRadius: Radius.lg, backgroundColor: 'rgba(67,104,111,0.10)', borderWidth: 1, borderColor: 'rgba(67,104,111,0.20)' },
  lockoutTitle: { fontSize: Typography.sizes.md, fontFamily: Typography.families.featureSemi, color: Colors.PRIMARY_DARK, letterSpacing: LetterSpacing.tight },
  lockoutSub: { fontSize: Typography.sizes.sm, fontFamily: Typography.families.body, color: Colors.TEXT_SECONDARY, marginTop: 2, lineHeight: Typography.lineHeight.normal },
  sectionTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.families.displaySemi, color: Colors.TEXT_PRIMARY, marginBottom: Spacing.md, paddingHorizontal: Spacing.xl, letterSpacing: LetterSpacing.tight },
  taskPickerWrap: { marginBottom: Spacing.xl },
  taskRow: { gap: Spacing.sm, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xs },
  taskChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.full, backgroundColor: Colors.SURFACE, borderWidth: 1, borderColor: Colors.BORDER, minHeight: Sizing.touchTarget, maxWidth: 220 },
  taskChipActive: { backgroundColor: Colors.PRIMARY, borderColor: Colors.PRIMARY, ...Shadow.sm },
  taskChipText: { fontSize: Typography.sizes.sm, fontFamily: Typography.families.bodyMedium, color: Colors.TEXT_PRIMARY, flexShrink: 1 },
  taskChipTextActive: { color: Colors.TEXT_ON_PRIMARY, fontFamily: Typography.families.featureSemi },
  emptyTask: { alignItems: 'center', gap: Spacing.sm, marginHorizontal: Spacing.xl, padding: Spacing.xl },
  emptyTaskText: { fontSize: Typography.sizes.md, fontFamily: Typography.families.body, color: Colors.TEXT_SECONDARY, textAlign: 'center', lineHeight: Typography.lineHeight.normal },
  modes: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing['2xl'], paddingHorizontal: Spacing.xl },
  modeCardWrap: { width: '47%', flexGrow: 1 },
  modeCard: { alignItems: 'center', padding: Spacing.xl, backgroundColor: Colors.SURFACE, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.BORDER, minHeight: 150, ...Shadow.sm },
  modeCardActive: { borderColor: Colors.PRIMARY_LIGHT, backgroundColor: '#EEF3F1', ...Shadow.sm },
  modeEmoji: { marginBottom: Spacing.sm },
  modeName: { fontSize: Typography.sizes.lg, fontFamily: Typography.families.featureSemi, color: Colors.TEXT_PRIMARY, letterSpacing: LetterSpacing.tight },
  modeNameActive: { color: Colors.PRIMARY_DARK },
  modeDuration: { fontSize: Typography.sizes.sm, fontFamily: Typography.families.numeric, color: Colors.TEXT_SECONDARY, marginTop: Spacing.xs, letterSpacing: LetterSpacing.tight },
  modeDurationActive: { color: Colors.PRIMARY },
  timerScroll: { flexGrow: 1, justifyContent: 'center' },
  timerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  modeLabel: { fontSize: Typography.sizes.sm, fontFamily: Typography.families.featureSemi, color: Colors.PRIMARY, marginBottom: Spacing.lg, textTransform: 'uppercase', letterSpacing: LetterSpacing.wide },
  timerCircle: { width: 240, height: 240, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
  timerCircleActive: { ...Shadow.glow },
  timerText: { fontSize: Typography.sizes['4xl'], fontFamily: Typography.families.numeric, color: Colors.TEXT_PRIMARY, letterSpacing: LetterSpacing.tight },
  progressText: { fontSize: Typography.sizes.md, fontFamily: Typography.families.featureMedium, color: Colors.TEXT_SECONDARY, marginTop: Spacing.xs, letterSpacing: LetterSpacing.wide },
  activeTaskCard: { width: '100%', maxWidth: 360, padding: Spacing.lg, borderRadius: Radius.lg, backgroundColor: 'rgba(255,255,255,0.86)', borderWidth: 1, borderColor: Colors.BORDER, alignItems: 'center', marginBottom: Spacing.lg, ...Shadow.sm },
  activeTaskKicker: { fontSize: Typography.sizes.xs, fontFamily: Typography.families.featureSemi, color: Colors.PRIMARY, textTransform: 'uppercase', letterSpacing: LetterSpacing.wide, marginBottom: Spacing.xs },
  activeTaskTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.families.featureSemi, color: Colors.TEXT_PRIMARY, letterSpacing: LetterSpacing.tight, textAlign: 'center', marginBottom: Spacing.sm },
  lockRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radius.full, backgroundColor: Colors.DANGER_LIGHT },
  lockText: { fontSize: Typography.sizes.xs, fontFamily: Typography.families.featureSemi, color: Colors.DANGER, textTransform: 'uppercase', letterSpacing: 0.4 },
  unlockRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radius.full, backgroundColor: Colors.SUCCESS_LIGHT, marginBottom: Spacing.md },
  unlockText: { fontSize: Typography.sizes.xs, fontFamily: Typography.families.featureSemi, color: Colors.SUCCESS, textTransform: 'uppercase', letterSpacing: 0.4 },
  distractionText: { fontSize: Typography.sizes.sm, fontFamily: Typography.families.featureMedium, color: Colors.WARNING, marginBottom: Spacing.lg, letterSpacing: 0.3 },
  controls: { flexDirection: 'row', gap: Spacing.md },
  primaryBtn: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, backgroundColor: Colors.PRIMARY, borderRadius: Radius.lg, minHeight: Sizing.touchTarget, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  resumeBtn: { backgroundColor: Colors.SUCCESS },
  primaryBtnText: { color: Colors.TEXT_ON_PRIMARY, fontSize: Typography.sizes.md, fontFamily: Typography.families.featureSemi, letterSpacing: 0.2 },
  secondaryBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.SURFACE, borderRadius: Radius.lg, minHeight: Sizing.touchTarget, alignItems: 'center', justifyContent: 'center' },
  secondaryBtnText: { color: Colors.TEXT_PRIMARY, fontSize: Typography.sizes.md, fontFamily: Typography.families.featureMedium },
  dangerBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.DANGER_LIGHT, borderRadius: Radius.lg, minHeight: Sizing.touchTarget, alignItems: 'center', justifyContent: 'center' },
  dangerBtnText: { color: Colors.DANGER, fontSize: Typography.sizes.md, fontFamily: Typography.families.featureSemi, letterSpacing: 0.2 },
  finishTaskBtn: { marginTop: Spacing.lg, flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.full, backgroundColor: Colors.SUCCESS_LIGHT, borderWidth: 1, borderColor: 'rgba(90,143,123,0.30)' },
  finishTaskText: { fontSize: Typography.sizes.sm, fontFamily: Typography.families.featureSemi, color: Colors.SUCCESS, letterSpacing: 0.3 },
  celebrateEmoji: { marginBottom: Spacing.lg },
  celebrateTitle: { fontSize: Typography.sizes['3xl'], fontFamily: Typography.families.display, color: Colors.TEXT_PRIMARY, marginBottom: Spacing.sm, letterSpacing: LetterSpacing.tight },
  celebrateSub: { fontSize: Typography.sizes.md, fontFamily: Typography.families.body, color: Colors.TEXT_SECONDARY, marginBottom: Spacing.md },
  xpPill: { backgroundColor: `${Colors.SUCCESS}22`, borderRadius: Radius.full, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderWidth: 1, borderColor: Colors.SUCCESS },
  xpPillText: { color: Colors.SUCCESS, fontSize: Typography.sizes.lg, fontFamily: Typography.families.numeric, letterSpacing: LetterSpacing.tight },
});
