import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Radius, Sizing, Shadow, Gradients, LetterSpacing, ANIMATION } from '../../src/constants/theme';
import { Button } from '../../src/components/ui/Button';
import { CircularProgress } from '../../src/components/ui/CircularProgress';
import { SafeScreen, TabHeader } from '../../src/components/ui/SafeScreen';
import { useFocusStore, FocusMode } from '../../src/stores/focusStore';
import { useXPStore } from '../../src/stores/xpStore';
import { useStreakStore } from '../../src/stores/streakStore';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
const MODES: { id: FocusMode; name: string; duration: number; icon: IoniconName }[] = [
  { id: 'pomodoro', name: 'Pomodoro', duration: 25, icon: 'timer-outline' },
  { id: 'deep_work', name: 'Deep Work', duration: 90, icon: 'bulb-outline' },
  { id: 'flow', name: 'Flow', duration: 60, icon: 'water-outline' },
  { id: 'quick_sprint', name: 'Quick Sprint', duration: 15, icon: 'flash-outline' },
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
      <SafeScreen tabBarSpacing>
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
      <SafeScreen tabBarSpacing>
        <Animated.View entering={FadeInDown.duration(ANIMATION.entrance.duration)} style={styles.timerContainer}>
          <Ionicons name="sparkles" size={Sizing.avatarLg} color={Colors.PRIMARY_LIGHT} style={styles.celebrateEmoji} />
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
    <SafeScreen tabBarSpacing>
      <TabHeader
        eyebrow={`${totalFocusMinutes} min today`}
        title="Focus Session"
        rightAction={
          <View style={styles.livePill}>
            <Ionicons name="leaf-outline" size={Sizing.iconSm} color={Colors.SUCCESS} />
            <Text style={styles.liveText}>Deep work</Text>
          </View>
        }
      />
      <Animated.View entering={FadeInDown.duration(ANIMATION.entrance.duration).delay(ANIMATION.stagger)} style={styles.modes}>
        {MODES.map((mode, index) => (
          <View key={mode.id} style={styles.modeCardWrap}>
          <Pressable
            style={[styles.modeCard, selectedMode === mode.id && styles.modeCardActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedMode(mode.id); }}
            accessibilityRole="button"
            accessibilityLabel={mode.name}
          >
            <Ionicons name={mode.icon} size={Typography.sizes['3xl']} color={selectedMode === mode.id ? Colors.PRIMARY_DARK : Colors.PRIMARY_LIGHT} style={styles.modeEmoji} />
            <Text style={[styles.modeName, selectedMode === mode.id && styles.modeNameActive]}>{mode.name}</Text>
            <Text style={[styles.modeDuration, selectedMode === mode.id && styles.modeDurationActive]}>{mode.duration} min</Text>
          </Pressable>
          </View>
        ))}
      </Animated.View>
      <Button title="Start Focus Session" onPress={handleStartSession} size="lg" />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  livePill: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.SUCCESS_LIGHT, borderWidth: 1, borderColor: 'rgba(90,143,123,0.25)' },
  liveText: { fontSize: Typography.sizes.xs, fontFamily: Typography.families.featureSemi, color: Colors.SUCCESS, letterSpacing: LetterSpacing.wide, textTransform: 'uppercase' },
  modes: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing['2xl'], paddingHorizontal: Spacing.xl },
  modeCardWrap: { width: '47%', flexGrow: 1 },
  modeCard: { alignItems: 'center', padding: Spacing.xl, backgroundColor: Colors.SURFACE, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.BORDER, minHeight: 150, ...Shadow.sm },
  modeCardActive: { borderColor: Colors.PRIMARY_LIGHT, backgroundColor: '#EEF3F1', ...Shadow.sm },
  modeEmoji: { marginBottom: Spacing.sm },
  modeName: { fontSize: Typography.sizes.lg, fontFamily: Typography.families.featureSemi, color: Colors.TEXT_PRIMARY, letterSpacing: LetterSpacing.tight },
  modeNameActive: { color: Colors.PRIMARY_DARK },
  modeDuration: { fontSize: Typography.sizes.sm, fontFamily: Typography.families.numeric, color: Colors.TEXT_SECONDARY, marginTop: Spacing.xs, letterSpacing: LetterSpacing.tight },
  modeDurationActive: { color: Colors.PRIMARY },
  timerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  modeLabel: { fontSize: Typography.sizes.sm, fontFamily: Typography.families.featureSemi, color: Colors.PRIMARY, marginBottom: Spacing.lg, textTransform: 'uppercase', letterSpacing: LetterSpacing.wide },
  timerCircle: { width: 240, height: 240, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing['2xl'] },
  timerCircleActive: { ...Shadow.glow },
  timerText: { fontSize: Typography.sizes['4xl'], fontFamily: Typography.families.numeric, color: Colors.TEXT_PRIMARY, letterSpacing: LetterSpacing.tight },
  progressText: { fontSize: Typography.sizes.md, fontFamily: Typography.families.featureMedium, color: Colors.TEXT_SECONDARY, marginTop: Spacing.xs, letterSpacing: LetterSpacing.wide },
  distractionText: { fontSize: Typography.sizes.sm, fontFamily: Typography.families.featureMedium, color: Colors.WARNING, marginBottom: Spacing.lg, letterSpacing: 0.3 },
  controls: { flexDirection: 'row', gap: Spacing.md },
  primaryBtn: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, backgroundColor: Colors.PRIMARY, borderRadius: Radius.lg, minHeight: Sizing.touchTarget, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  resumeBtn: { backgroundColor: Colors.SUCCESS },
  primaryBtnText: { color: Colors.TEXT_ON_PRIMARY, fontSize: Typography.sizes.md, fontFamily: Typography.families.featureSemi, letterSpacing: 0.2 },
  secondaryBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.SURFACE, borderRadius: Radius.lg, minHeight: Sizing.touchTarget, alignItems: 'center', justifyContent: 'center' },
  secondaryBtnText: { color: Colors.TEXT_PRIMARY, fontSize: Typography.sizes.md, fontFamily: Typography.families.featureMedium },
  dangerBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.DANGER_LIGHT, borderRadius: Radius.lg, minHeight: Sizing.touchTarget, alignItems: 'center', justifyContent: 'center' },
  dangerBtnText: { color: Colors.DANGER, fontSize: Typography.sizes.md, fontFamily: Typography.families.featureSemi, letterSpacing: 0.2 },
  celebrateEmoji: { marginBottom: Spacing.lg },
  celebrateTitle: { fontSize: Typography.sizes['3xl'], fontFamily: Typography.families.display, color: Colors.TEXT_PRIMARY, marginBottom: Spacing.sm, letterSpacing: LetterSpacing.tight },
  celebrateSub: { fontSize: Typography.sizes.md, fontFamily: Typography.families.body, color: Colors.TEXT_SECONDARY, marginBottom: Spacing.xl },
  xpPill: { backgroundColor: `${Colors.SUCCESS}22`, borderRadius: Radius.full, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderWidth: 1, borderColor: Colors.SUCCESS },
  xpPillText: { color: Colors.SUCCESS, fontSize: Typography.sizes.lg, fontFamily: Typography.families.numeric, letterSpacing: LetterSpacing.tight },
});
