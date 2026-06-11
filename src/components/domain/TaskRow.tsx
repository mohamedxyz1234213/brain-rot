import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Task } from '../../services/backend/interface';
import { theme } from '../../constants/theme';

interface TaskRowProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onPress: (task: Task) => void;
}

const PRIORITY_COLORS = {
  low: theme.colors.secondary,
  medium: theme.colors.primary,
  high: theme.colors.warning,
  critical: theme.colors.danger,
};

export function TaskRow({ task, onComplete, onPress }: TaskRowProps) {
  return (
    <Pressable style={styles.container} onPress={() => onPress(task)}>
      <Pressable
        style={[
          styles.checkbox,
          task.status === 'completed' && styles.checkboxCompleted,
        ]}
        onPress={() => onComplete(task.id)}
      >
        {task.status === 'completed' && <Text style={styles.checkmark}>✓</Text>}
      </Pressable>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.title,
              task.status === 'completed' && styles.titleCompleted,
            ]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          {task.isEatTheFrog && <Text style={styles.frogBadge}>🐸</Text>}
          {task.isAppUnlocker && <Text style={styles.unlockBadge}>🔓</Text>}
        </View>

        <View style={styles.metaRow}>
          <View
            style={[
              styles.priorityDot,
              { backgroundColor: PRIORITY_COLORS[task.priority] },
            ]}
          />
          <Text style={styles.meta}>{task.priority}</Text>
          {task.estimatedMinutes && (
            <Text style={styles.meta}> • {task.estimatedMinutes}min</Text>
          )}
          {task.dueDate && (
            <Text style={styles.meta}>
              {' '}
              • {new Date(task.dueDate).toLocaleDateString()}
            </Text>
          )}
          {task.postponeCount >= 3 && (
            <Text style={styles.avoiderBadge}>⚡ Chronic Avoider</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: `${theme.colors.secondary}33`,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.md,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.textSecondary,
  },
  frogBadge: {
    fontSize: 16,
    marginLeft: 8,
  },
  unlockBadge: {
    fontSize: 16,
    marginLeft: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  meta: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  avoiderBadge: {
    fontSize: theme.typography.sm,
    color: theme.colors.warning,
    marginLeft: 8,
  },
});
