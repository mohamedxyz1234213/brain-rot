import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Sizing, Shadow, LetterSpacing } from '../../src/constants/theme';
import { SafeScreen } from '../../src/components/ui';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useTaskStore } from '../../src/stores/taskStore';
import { useScreenTimeStore } from '../../src/stores/screenTimeStore';

export default function AppBlockedScreen() {
  const params = useLocalSearchParams<{ app?: string }>();
  const limits = useScreenTimeStore((s) => s.limits);
  const appName = params.app ?? limits[0]?.appName ?? 'This app';
  const unlockerTasks = useTaskStore((s) => s.getTaskUnlockerTasks());

  const handleTaskUnlock = () => {
    if (unlockerTasks.length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      useTaskStore.getState().completeTask(unlockerTasks[0].id);
      router.back();
    }
  };

  const handleSlotMachine = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/(modals)/slot-machine');
  };

  const handleHardBlock = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    router.back();
  };

  return (
    <SafeScreen style={{ backgroundColor: Colors.BACKGROUND }}>
      <Animated.View entering={FadeIn.duration(500)} style={styles.content}>
        <Text style={styles.blockEmoji}>🔒</Text>
        <Text style={styles.blockTitle}>{appName} is Blocked</Text>
        <Text style={styles.blockReason}>You've hit your daily limit</Text>

        <Text style={styles.roastText}>"Your phone called. It's embarrassed."</Text>

        <View style={styles.options}>
          {unlockerTasks.length > 0 && (
            <Card glass style={styles.optionCard}>
              <Text style={styles.optionEmoji}>✅</Text>
              <Text style={styles.optionTitle}>Task Unlock</Text>
              <Text style={styles.optionDesc}>Complete "{unlockerTasks[0].title}" for 15 min access</Text>
              <Button title="Complete Task" onPress={handleTaskUnlock} size="sm" />
            </Card>
          )}

          <Card glass style={styles.optionCard}>
            <Text style={styles.optionEmoji}>🎰</Text>
            <Text style={styles.optionTitle}>Slot Machine</Text>
            <Text style={styles.optionDesc}>Spin for a chance to unlock</Text>
            <Button title="Spin" onPress={handleSlotMachine} size="sm" />
          </Card>

          <Card glass style={styles.optionCard}>
            <Text style={styles.optionEmoji}>⏰</Text>
            <Text style={styles.optionTitle}>Timer Wait</Text>
            <Text style={styles.optionDesc}>Wait 10 min then re-spin</Text>
            <Button title="Wait" onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }} size="sm" variant="secondary" />
          </Card>

          <Card glass style={styles.optionCard}>
            <Text style={styles.optionEmoji}>🚫</Text>
            <Text style={styles.optionTitle}>Hard Block</Text>
            <Text style={styles.optionDesc}>No access until tomorrow</Text>
            <Button title="Accept" onPress={handleHardBlock} size="sm" variant="danger" />
          </Card>
        </View>

        <Pressable style={styles.softExit} onPress={() => { router.back(); }} accessibilityRole="button" accessibilityLabel="Accept weakness and exit">
          <Text style={styles.softExitText}>I accept my weakness 😔</Text>
        </Pressable>
      </Animated.View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: Spacing.xl, justifyContent: 'center' },
  blockEmoji: { fontSize: Sizing.avatarMd, textAlign: 'center', marginBottom: Spacing.lg },
  blockTitle: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.bold, color: Colors.TEXT_PRIMARY, textAlign: 'center', marginBottom: Spacing.sm, letterSpacing: LetterSpacing.tight },
  blockReason: { fontSize: Typography.sizes.md, color: Colors.TEXT_SECONDARY, textAlign: 'center', marginBottom: Spacing.lg },
  roastText: { fontSize: Typography.sizes.lg, color: Colors.DANGER, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: Typography.lineHeight.relaxed },
  options: { gap: Spacing.md, marginBottom: Spacing.xl },
  optionCard: { alignItems: 'center', ...Shadow.sm },
  optionEmoji: { fontSize: Sizing.iconLg, marginBottom: Spacing.sm },
  optionTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.semibold, color: Colors.TEXT_PRIMARY, marginBottom: Spacing.xs },
  optionDesc: { fontSize: Typography.sizes.sm, color: Colors.TEXT_SECONDARY, marginBottom: Spacing.md },
  softExit: { paddingVertical: Spacing.lg, alignItems: 'center' },
  softExitText: { fontSize: Typography.sizes.md, color: Colors.TEXT_SECONDARY },
});
