import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Radius, Sizing } from '../../constants/theme';

type FocusMode = 'pomodoro' | 'deep_work' | 'flow' | 'quick_sprint';

interface FocusTimerProps {
  mode: FocusMode;
  targetMinutes: number;
  taskTitle?: string;
  isActive: boolean;
  remainingSeconds: number;
  distractionCount: number;
  onComplete: () => void;
  onCancel: () => void;
  onDistraction: () => void;
  onPause: () => void;
  onResume: () => void;
}

const MODE_LABELS: Record<FocusMode, string> = {
  pomodoro: 'Pomodoro',
  deep_work: 'Deep Work',
  flow: 'Flow State',
  quick_sprint: 'Quick Sprint',
};

export function FocusTimer({
  mode,
  targetMinutes,
  taskTitle,
  isActive,
  remainingSeconds,
  distractionCount,
  onComplete,
  onCancel,
  onDistraction,
  onPause,
  onResume,
}: FocusTimerProps) {
  const [isPaused, setIsPaused] = useState(false);
  const totalSeconds = targetMinutes * 60;
  const progress = 1 - remainingSeconds / totalSeconds;

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const togglePause = () => {
    if (isPaused) {
      onResume();
    } else {
      onPause();
    }
    setIsPaused(!isPaused);
  };

  const handleDistraction = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDistraction();
  };

  return (
    <Animated.View entering={FadeIn.duration(500)} style={styles.container}>
      <Text style={styles.modeLabel}>{MODE_LABELS[mode]}</Text>
      {taskTitle && <Text style={styles.taskTitle}>{taskTitle}</Text>}

      <View style={styles.timerCircle}>
        <Text style={styles.timerText}>{formatTime(remainingSeconds)}</Text>
        <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
      </View>

      {distractionCount > 0 && (
        <View style={styles.distractionRow}>
          <Ionicons name="pulse-outline" size={Typography.sizes.sm} color={Colors.WARNING} />
          <Text style={styles.distractionCount}>{distractionCount} distractions</Text>
        </View>
      )}

      <View style={styles.controls}>
        <Pressable style={styles.secondaryBtn} onPress={handleDistraction}>
          <Ionicons name="alert-circle-outline" size={Sizing.iconSm} color={Colors.TEXT_PRIMARY} />
          <Text style={styles.secondaryBtnText}>Distracted</Text>
        </Pressable>

        <Pressable
          style={[styles.primaryBtn, isPaused && styles.resumeBtn]}
          onPress={togglePause}
        >
          <Ionicons name={isPaused ? 'play' : 'pause'} size={Sizing.iconSm} color={Colors.TEXT_ON_PRIMARY} />
          <Text style={styles.primaryBtnText}>{isPaused ? 'Resume' : 'Pause'}</Text>
        </Pressable>

        <Pressable style={styles.dangerBtn} onPress={onCancel}>
          <Ionicons name="close" size={Sizing.iconSm} color={Colors.DANGER} />
          <Text style={styles.dangerBtnText}>End</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.BACKGROUND,
  },
  modeLabel: {
    fontSize: Typography.sizes.lg,
    color: Colors.PRIMARY,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  taskTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    marginBottom: Spacing['2xl'],
  },
  timerCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 4,
    borderColor: Colors.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['3xl'],
  },
  timerText: {
    fontSize: 48,
    color: Colors.TEXT_PRIMARY,
    fontWeight: '400',
    fontVariant: ['tabular-nums'],
  },
  progressText: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    marginTop: Spacing.xs,
  },
  distractionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  distractionCount: {
    fontSize: Typography.sizes.sm,
    color: Colors.WARNING,
  },
  controls: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.PRIMARY,
    borderRadius: Radius.md,
  },
  resumeBtn: {
    backgroundColor: Colors.SUCCESS,
  },
  primaryBtnText: {
    color: Colors.TEXT_ON_PRIMARY,
    fontSize: Typography.sizes.md,
    fontWeight: '600',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.SURFACE,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: `${Colors.SECONDARY}44`,
  },
  secondaryBtnText: {
    color: Colors.TEXT_PRIMARY,
    fontSize: Typography.sizes.md,
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: `${Colors.DANGER}22`,
    borderRadius: Radius.md,
  },
  dangerBtnText: {
    color: Colors.DANGER,
    fontSize: Typography.sizes.md,
    fontWeight: '600',
  },
});
