import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow, LetterSpacing } from '../../src/constants/theme';
import { SafeScreen } from '../../src/components/ui';
import { useRoastStore, RoastPersona } from '../../src/stores/roastStore';
import { useBrainScoreStore } from '../../src/stores/brainScoreStore';
import { useScreenTimeStore } from '../../src/stores/screenTimeStore';
import { useTaskStore } from '../../src/stores/taskStore';
import { useStreakStore } from '../../src/stores/streakStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useAuthStore } from '../../src/stores/authStore';
import { roastPersonas } from '../../src/data/roastPersonas';
import { generateRoast } from '../../src/services/aiService';

const PERSONA_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = { egyptian_dad: 'person-outline', egyptian_mom: 'heart-outline', future_self: 'time-outline', drill_sergeant: 'shield-outline', sigmund_freud: 'hardware-chip-outline', david_goggins: 'fitness-outline' };

const EVIDENCE_LABELS: Record<string, string> = { app_limit: 'App Limit Exceeded', task_missed: 'Task Missed', daily_review: 'Daily Review', morning: 'Morning Shame', intervention: 'Intervention Mode', driving: 'Driving + Phone' };

export default function RoastModal() {
  const [displayText, setDisplayText] = useState('');
  const [fullText, setFullText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const activeRoast = useRoastStore((s) => s.activeRoast);
  const selectedPersona = useRoastStore((s) => s.selectedPersona);
  const dismissRoast = useRoastStore((s) => s.dismissRoast);
  const brainScore = useBrainScoreStore((s) => s.currentScore);
  const totalMinutes = useScreenTimeStore((s) => s.totalMinutesToday);
  const tasksCompleted = useTaskStore((s) => s.tasks.filter((t) => t.status === 'completed').length);
  const streak = useStreakStore((s) => s.getStreak('screen_time'));

  useEffect(() => {
    if (activeRoast) return;
    let cancelled = false;
    const persona = (selectedPersona || 'drill_sergeant') as RoastPersona;
    const st = useScreenTimeStore.getState();
    const taskState = useTaskStore.getState();
    const topApp = st.getOverageApps()[0] ?? st.limits[0];
    const topMinutes = topApp
      ? st.logs.filter((l) => l.appBundleId === topApp.appBundleId).reduce((s, l) => s + l.minutesUsed, 0)
      : st.totalMinutesToday;

    generateRoast(persona, 'daily_review', {
      userName: useAuthStore.getState().user?.name ?? 'there',
      screenTimeToday: st.totalMinutesToday,
      screenTimeLimit: st.limits.reduce((s, l) => s + l.dailyLimitMinutes, 0) || 180,
      tasksCompleted: taskState.tasks.filter((t) => t.status === 'completed').length,
      tasksTotal: Math.max(taskState.tasks.length, 1),
      topWastedApp: topApp?.appName ?? 'social media',
      topWastedMinutes: topMinutes,
      blockedAttempts: 0,
      streakDays: useStreakStore.getState().getStreak('screen_time')?.currentDays ?? 0,
    }).then((result) => {
      if (cancelled) return;
      useRoastStore.getState().addRoast({
        persona,
        trigger: 'daily_review',
        text: result.text,
        isOffline: result.isOffline,
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeRoast) return;
    setFullText(activeRoast.text);
    setIsTyping(true);
    setDisplayText('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < activeRoast.text.length) { setDisplayText(activeRoast.text.slice(0, i + 1)); i++; }
      else { setIsTyping(false); clearInterval(interval); }
    }, 30);
    return () => clearInterval(interval);
  }, [activeRoast?.id]);

  const handleDeserved = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    dismissRoast();
    router.back();
  };

  const handleProveThemWrong = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    dismissRoast();
    router.replace('/(tabs)/tasks');
  };

  const personaConfig = roastPersonas.find((p) => p.id === (activeRoast?.persona || selectedPersona));
  const icon = PERSONA_ICONS[activeRoast?.persona || selectedPersona] || 'shield-outline';

  return (
    <SafeScreen>
      <Animated.View entering={FadeIn.duration(500)} style={styles.content}>
        <View style={styles.personaHeader}>
          <Ionicons name={icon} size={48} color={Colors.DANGER} />
          <Text style={styles.personaName}>{personaConfig?.name ?? 'Drill Sergeant'}</Text>
          {activeRoast?.isOffline && <Text style={styles.offlineBadge}>offline mode</Text>}
        </View>

        <View style={styles.evidence}>
          <Text style={styles.evidenceTitle}>Evidence:</Text>
          <Text style={styles.evidenceItem}>Screen time: {totalMinutes} min</Text>
          <Text style={styles.evidenceItem}>Tasks done: {tasksCompleted}</Text>
          <Text style={styles.evidenceItem}>Brain score: {brainScore}/100</Text>
          <Text style={styles.evidenceItem}>Streak: {streak?.currentDays ?? 0} days</Text>
        </View>

        <View style={styles.roastBox}>
          <Text style={styles.roastText}>{displayText}</Text>
          {isTyping && <Text style={styles.cursor}>|</Text>}
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.deservedBtn} onPress={handleDeserved} accessibilityRole="button" accessibilityLabel="I deserved this">
            <Text style={styles.deservedBtnText}>I Deserved This</Text>
          </Pressable>
          <Pressable style={styles.proveBtn} onPress={handleProveThemWrong} accessibilityRole="button" accessibilityLabel="Prove them wrong">
            <Text style={styles.proveBtnText}>Prove Them Wrong →</Text>
          </Pressable>
        </View>
      </Animated.View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: Spacing.xl, justifyContent: 'center' },
  personaHeader: { alignItems: 'center', marginBottom: Spacing.lg },
  personaName: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.TEXT_PRIMARY, marginTop: Spacing.sm, letterSpacing: LetterSpacing.tight },
  offlineBadge: { fontSize: Typography.sizes.xs, color: Colors.WARNING, backgroundColor: Colors.WARNING_LIGHT, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: Radius.full, marginTop: Spacing.xs },
  evidence: { marginBottom: Spacing.xl, padding: Spacing.md, backgroundColor: Colors.PRIMARY_DARK, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.PRIMARY_LIGHT },
  evidenceTitle: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, color: Colors.TEXT_SECONDARY, marginBottom: Spacing.xs },
  evidenceItem: { fontSize: Typography.sizes.sm, color: Colors.TEXT_SECONDARY },
  roastBox: { marginBottom: Spacing['2xl'], backgroundColor: Colors.SURFACE, borderRadius: Radius.xl, padding: Spacing.xl, borderWidth: 1, borderColor: Colors.DANGER_LIGHT, ...Shadow.sm },
  roastText: { fontSize: Typography.sizes.lg, color: Colors.TEXT_PRIMARY, lineHeight: Typography.lineHeight.relaxed },
  cursor: { fontSize: Typography.sizes.lg, color: Colors.PRIMARY_LIGHT },
  actions: { gap: Spacing.md },
  deservedBtn: { backgroundColor: Colors.DANGER_LIGHT, borderRadius: Radius.lg, paddingVertical: Spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.DANGER },
  deservedBtnText: { color: Colors.DANGER, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
  proveBtn: { backgroundColor: Colors.PRIMARY, borderRadius: Radius.lg, paddingVertical: Spacing.lg, alignItems: 'center', ...Shadow.sm },
  proveBtnText: { color: Colors.TEXT_ON_PRIMARY, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
});
