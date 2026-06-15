import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInLeft, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Task } from '../../services/backend/interface';
import { Colors, Typography, Spacing, Radius, ANIMATION } from '../../constants/theme';

interface TaskRowProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onPress: (task: Task) => void;
}

const PRIORITY_COLORS: Record<Task['priority'], string> = {
  low: Colors.SECONDARY,
  medium: Colors.PRIMARY,
  high: Colors.WARNING,
  critical: Colors.DANGER,
};

export function TaskRow({ task, onComplete, onPress }: TaskRowProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, ANIMATION.spring);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, ANIMATION.spring);
  };

  const handleComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete(task.id);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInLeft.duration(ANIMATION.timing.normal)} style={animatedStyle}>
      <Pressable
        style={styles.container}
        onPress={() => onPress(task)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Pressable
          style={[styles.checkbox, task.status === 'completed' && styles.checkboxCompleted]}
          onPress={handleComplete}
        >
          {task.status === 'completed' && <Text style={styles.checkmark}>✓</Text>}
        </Pressable>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, task.status === 'completed' && styles.titleCompleted]} numberOfLines={1}>
              {task.title}
            </Text>
            {task.isEatTheFrog && <Text style={styles.frogBadge}>🐸</Text>}
            {task.isAppUnlocker && <Text style={styles.unlockBadge}>🔓</Text>}
          </View>

          <View style={styles.metaRow}>
            <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[task.priority] }]} />
            <Text style={styles.meta}>{task.priority}</Text>
            {task.estimatedMinutes && <Text style={styles.meta}> • {task.estimatedMinutes}min</Text>}
            {task.postponeCount >= 3 && <Text style={styles.avoiderBadge}>⚡ Chronic Avoider</Text>}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.SURFACE,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    borderWidth: 0.5,
    borderColor: `${Colors.SECONDARY}33`,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  checkboxCompleted: {
    backgroundColor: Colors.SUCCESS,
    borderColor: Colors.SUCCESS,
  },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  content: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: Typography.sizes.md, color: Colors.TEXT_PRIMARY, flex: 1 },
  titleCompleted: { textDecorationLine: 'line-through', color: Colors.TEXT_SECONDARY },
  frogBadge: { fontSize: 16, marginLeft: Spacing.sm },
  unlockBadge: { fontSize: 16, marginLeft: Spacing.xs },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs },
  priorityDot: { width: 8, height: 8, borderRadius: 4, marginRight: Spacing.xs },
  meta: { fontSize: Typography.sizes.sm, color: Colors.TEXT_SECONDARY },
  avoiderBadge: { fontSize: Typography.sizes.sm, color: Colors.WARNING, marginLeft: Spacing.sm },
});
