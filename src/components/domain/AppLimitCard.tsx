import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppLimit } from '../../services/backend/interface';
import { theme } from '../../constants/theme';

interface AppLimitCardProps {
  limit: AppLimit;
  minutesUsed: number;
}

export function AppLimitCard({ limit, minutesUsed }: AppLimitCardProps) {
  const percentage = Math.min((minutesUsed / limit.dailyLimitMinutes) * 100, 100);
  const isOverLimit = minutesUsed >= limit.dailyLimitMinutes;
  const barColor = isOverLimit
    ? theme.colors.danger
    : percentage > 75
    ? theme.colors.warning
    : theme.colors.primary;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appName}>{limit.appName}</Text>
        <Text style={[styles.time, isOverLimit && styles.timeOver]}>
          {minutesUsed}m / {limit.dailyLimitMinutes}m
        </Text>
      </View>

      <View style={styles.progressBg}>
        <View
          style={[
            styles.progressFill,
            { width: `${percentage}%`, backgroundColor: barColor },
          ]}
        />
      </View>

      <View style={styles.footer}>
        {limit.isHardBlock && (
          <Text style={styles.badge}>🔒 Hard Block</Text>
        )}
        {isOverLimit && (
          <Text style={styles.overText}>
            +{minutesUsed - limit.dailyLimitMinutes}m over
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 180,
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    marginRight: 12,
    borderWidth: 0.5,
    borderColor: `${theme.colors.secondary}33`,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appName: {
    fontSize: theme.typography.md,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  time: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  timeOver: {
    color: theme.colors.danger,
  },
  progressBg: {
    height: 6,
    backgroundColor: `${theme.colors.secondary}33`,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  badge: {
    fontSize: 11,
    color: theme.colors.danger,
  },
  overText: {
    fontSize: 11,
    color: theme.colors.danger,
  },
});
