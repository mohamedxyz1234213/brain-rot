import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../constants/theme';

type FocusMode = 'pomodoro' | 'deep_work' | 'flow' | 'quick_sprint';

interface FocusTimerProps {
  mode: FocusMode;
  targetMinutes: number;
  taskTitle?: string;
  isActive: boolean;
  onComplete: () => void;
  onCancel: () => void;
  onDistraction: () => void;
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
  onComplete,
  onCancel,
  onDistraction,
}: FocusTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(targetMinutes * 60);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = targetMinutes * 60;
  const progress = 1 - secondsLeft / totalSeconds;

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isPaused, onComplete]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.modeLabel}>{MODE_LABELS[mode]}</Text>

      {taskTitle && <Text style={styles.taskTitle}>{taskTitle}</Text>}

      <View style={styles.timerCircle}>
        <View style={styles.progressRing}>
          <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
          <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.secondaryBtn} onPress={onDistraction}>
          <Text style={styles.secondaryBtnText}>😵 Distracted</Text>
        </Pressable>

        <Pressable
          style={[styles.primaryBtn, isPaused && styles.resumeBtn]}
          onPress={togglePause}
        >
          <Text style={styles.primaryBtnText}>
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </Text>
        </Pressable>

        <Pressable style={styles.dangerBtn} onPress={onCancel}>
          <Text style={styles.dangerBtnText}>✗ End</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: theme.colors.background,
  },
  modeLabel: {
    fontSize: theme.typography.lg,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  taskTitle: {
    fontSize: theme.typography.md,
    color: theme.colors.textSecondary,
    marginBottom: 32,
  },
  timerCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 4,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  progressRing: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    color: theme.colors.textPrimary,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
  progressText: {
    fontSize: theme.typography.md,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
  },
  resumeBtn: {
    backgroundColor: theme.colors.success,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: theme.typography.md,
    fontWeight: '600',
  },
  secondaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: `${theme.colors.secondary}44`,
  },
  secondaryBtnText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.md,
  },
  dangerBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: `${theme.colors.danger}22`,
    borderRadius: theme.radius.md,
  },
  dangerBtnText: {
    color: theme.colors.danger,
    fontSize: theme.typography.md,
    fontWeight: '600',
  },
});
