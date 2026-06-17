import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Radius, Sizing, Shadow, Gradients, LetterSpacing, ANIMATION } from '../../src/constants/theme';
import { Button } from '../../src/components/ui/Button';
import { CircularProgress } from '../../src/components/ui/CircularProgress';
import { SafeScreen } from '../../src/components/ui/SafeScreen';
import { useFocusStore, FocusMode } from '../../src/stores/focusStore';
import { useXPStore } from '../../src/stores/xpStore';
import { useStreakStore } from '../../src/stores/streakStore';

const MODES: { id: FocusMode; name: string; duration: number; emoji: string }[] = [
  { id: 'pomodoro', name: 'Pomodoro', duration: 25, emoji: '🍅' },
  { id: 'deep_work', name: 'Deep Work', duration: 90, emoji: '🧠' },
  { id: 'flow', name: 'Flow', duration: 60, emoji: '🌊' },
  { id: 'quick_sprint', name: 'Quick Sprint', duration: 15, emoji: '⚡' },
];

export default function FocusScreen() {
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

  const [selectedMode, setSelectedMode] = useState<FocusMode>('pomodoro');
  const [isPaused, setIsPaused] = useState(false);
  const [completed, setCompleted] = useState<{ mode: FocusMode; minutes: number; xp: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const handleStartSession = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    startSession(selectedMode);
    setIsPaused(false);
  };

  const handleCompleteSession = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const session = useFocusStore.getState().activeSession;
    const mode = session?.mode ?? selectedMode;
    const minutes = session?.targetMinutes ?? 0;
    endSession(true);
    const xpMap: Record<FocusMode, number> = { pomodoro: 30, deep_work: 50, flow: 40, quick_sprint: 30 };
    const xp = xpMap[mode] ?? 30;
    useXPStore.getState().addXP(xp, `Focus session completed: ${mode}`);
    useStreakStore.getState().incrementStreak('focus');
    setIsPaused(false);
    setCompleted({ mode, minutes, xp });
  };

  const handleEndSession = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    endSession(false);
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

  if (activeSession) {
    const progress = 1 - remainingSeconds / (activeSession.targetMinutes * 60);
    return (
      <SafeScreen>
        <Animated.View entering={FadeInDown.duration(ANIMATION.entrance.duration)} style={styles.timerContainer}>
          <Text style={styles.modeLabel}>{MODES.find((m) => m.id === activeSession.mode)?.name ?? activeSession.mode}</Text>
          <View style={[styles.timerCircle, isActive && !isPaused && styles.timerCircleActive]}>
            <CircularProgress progress={progress * 100} size={240} strokeWidth={14} gradient={Gradients.brand}>
            <Text style={styles.timerText}>{formatTime(remainingSeconds)}</Text>
            <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
            </CircularProgress>
          </View>
          {distractionCount > 0 && <Text style={styles.distractionText}>{distractionCount} distractions</Text>}
          <View style={styles.controls}>
            <Pressable style={styles.secondaryBtn} onPress={handleLogDistraction} accessibilityRole="button" accessibilityLabel="Log distraction">
              <Text style={styles.secondaryBtnText}>Distraction</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryBtn, isPaused && styles.resumeBtn]}
              onPress={() => { setIsPaused(!isPaused); if (isPaused) resumeSession(); else pauseSession(); }}
              accessibilityRole="button"
              accessibilityLabel={isPaused ? 'Resume' : 'Pause'}
            >
              <Text style={styles.primaryBtnText}>{isPaused ? 'Resume' : 'Pause'}</Text>
            </Pressable>
            <Pressable style={styles.dangerBtn} onPress={handleEndSession} accessibilityRole="button" accessibilityLabel="End session">
              <Text style={styles.dangerBtnText}>End</Text>
            </Pressable>
          </View>
        </Animated.View>
      </SafeScreen>
    );
  }

  if (completed) {
    return (
      <SafeScreen>
        <Animated.View entering={FadeInDown.duration(ANIMATION.entrance.duration)} style={styles.timerContainer}>
          <Text style={styles.celebrateEmoji}>🎉</Text>
          <Text style={styles.celebrateTitle}>Session Complete</Text>
          <Text style={styles.celebrateSub}>
            {completed.minutes} min of {MODES.find((m) => m.id === completed.mode)?.name ?? completed.mode}
          </Text>
          <View style={styles.xpPill}>
            <Text style={styles.xpPillText}>+{completed.xp} XP</Text>
          </View>
          <View style={{ height: Spacing['2xl'] }} />
          <Button title="Done" onPress={() => { Haptics.selectionAsync(); setCompleted(null); }} size="lg" />
        </Animated.View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <Animated.View entering={FadeInDown.duration(ANIMATION.entrance.duration)} style={styles.header}>
        <Text style={styles.title}>Focus Session</Text>
        <Text style={styles.subtitle}>Total today: {totalFocusMinutes} min</Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.duration(ANIMATION.entrance.duration).delay(ANIMATION.stagger)} style={styles.modes}>
        {MODES.map((mode, index) => (
          <Animated.View key={mode.id} entering={FadeInDown.duration(300).delay(index * ANIMATION.stagger)} style={styles.modeCardWrap}>
          <Pressable
            style={[styles.modeCard, selectedMode === mode.id && styles.modeCardActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedMode(mode.id); }}
            accessibilityRole="button"
            accessibilityLabel={mode.name}
          >
            <Text style={styles.modeEmoji}>{mode.emoji}</Text>
            <Text style={styles.modeName}>{mode.name}</Text>
            <Text style={styles.modeDuration}>{mode.duration} min</Text>
          </Pressable>
          </Animated.View>
        ))}
      </Animated.View>
      <Button title="Start Focus Session" onPress={handleStartSession} size="lg" />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  header: { padding: Spacing.xl, paddingTop: Spacing.lg },
  title: { fontSize: Typography.sizes['2xl'], fontWeight: 700, color: Colors.TEXT_PRIMARY, letterSpacing: LetterSpacing.tight },
  subtitle: { fontSize: Typography.sizes.md, color: Colors.TEXT_SECONDARY, marginTop: Spacing.sm },
  modes: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing['2xl'], paddingHorizontal: Spacing.xl },
  modeCardWrap: { width: '47%' },
  modeCard: { alignItems: 'center', padding: Spacing.xl, backgroundColor: Colors.SURFACE, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.BORDER, minHeight: 150, ...Shadow.sm },
  modeCardActive: { borderColor: Colors.PRIMARY_LIGHT, borderWidth: 2, backgroundColor: Colors.PRIMARY_DARK, ...Shadow.glow },
  modeEmoji: { fontSize: Typography.sizes['3xl'], marginBottom: Spacing.sm },
  modeName: { fontSize: Typography.sizes.lg, fontWeight: 600, color: Colors.TEXT_PRIMARY },
  modeDuration: { fontSize: Typography.sizes.sm, color: Colors.TEXT_SECONDARY, marginTop: Spacing.xs },
  timerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  modeLabel: { fontSize: Typography.sizes.md, color: Colors.PRIMARY_LIGHT, fontWeight: 600, marginBottom: Spacing.lg, textTransform: 'uppercase', letterSpacing: LetterSpacing.wide },
  timerCircle: { width: 240, height: 240, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing['2xl'] },
  timerCircleActive: { ...Shadow.glow },
  timerText: { fontSize: Typography.sizes['4xl'], color: Colors.TEXT_PRIMARY, fontWeight: 300, letterSpacing: LetterSpacing.tight },
  progressText: { fontSize: Typography.sizes.md, color: Colors.TEXT_SECONDARY, marginTop: Spacing.xs },
  distractionText: { fontSize: Typography.sizes.sm, color: Colors.WARNING, marginBottom: Spacing.lg },
  controls: { flexDirection: 'row', gap: Spacing.md },
  primaryBtn: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, backgroundColor: Colors.PRIMARY, borderRadius: Radius.lg, minHeight: Sizing.touchTarget, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  resumeBtn: { backgroundColor: Colors.SUCCESS },
  primaryBtnText: { color: Colors.TEXT_ON_PRIMARY, fontSize: Typography.sizes.md, fontWeight: 600 },
  secondaryBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.SURFACE, borderRadius: Radius.lg, minHeight: Sizing.touchTarget, alignItems: 'center', justifyContent: 'center' },
  secondaryBtnText: { color: Colors.TEXT_PRIMARY, fontSize: Typography.sizes.md },
  dangerBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.DANGER_LIGHT, borderRadius: Radius.lg, minHeight: Sizing.touchTarget, alignItems: 'center', justifyContent: 'center' },
  dangerBtnText: { color: Colors.DANGER, fontSize: Typography.sizes.md, fontWeight: 600 },
  celebrateEmoji: { fontSize: Sizing.avatarLg, marginBottom: Spacing.lg },
  celebrateTitle: { fontSize: Typography.sizes['3xl'], fontWeight: 800, color: Colors.TEXT_PRIMARY, marginBottom: Spacing.sm },
  celebrateSub: { fontSize: Typography.sizes.md, color: Colors.TEXT_SECONDARY, marginBottom: Spacing.xl },
  xpPill: { backgroundColor: `${Colors.SUCCESS}22`, borderRadius: Radius.full, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderWidth: 1, borderColor: Colors.SUCCESS },
  xpPillText: { color: Colors.SUCCESS, fontSize: Typography.sizes.lg, fontWeight: 700 },
});
