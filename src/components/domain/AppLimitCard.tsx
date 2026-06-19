import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AppLimit } from '../../services/backend/interface';
import { Colors, Typography, Spacing, Radius, ANIMATION } from '../../constants/theme';

interface AppLimitCardProps {
  limit: AppLimit;
  minutesUsed: number;
}

export function AppLimitCard({ limit, minutesUsed }: AppLimitCardProps) {
  const percentage = Math.min((minutesUsed / limit.dailyLimitMinutes) * 100, 150);
  const isOverLimit = minutesUsed >= limit.dailyLimitMinutes;
  const barColor = isOverLimit
    ? Colors.DANGER
    : percentage > 75
      ? Colors.WARNING
      : Colors.PRIMARY;

  return (
    <Animated.View entering={FadeInRight.duration(ANIMATION.timing.normal)} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appName}>{limit.appName}</Text>
        <Text style={[styles.time, isOverLimit && styles.timeOver]}>
          {minutesUsed}m / {limit.dailyLimitMinutes}m
        </Text>
      </View>

      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${Math.min(percentage, 100)}%`, backgroundColor: barColor }]} />
      </View>

      <View style={styles.footer}>
        {limit.isHardBlock && (
          <View style={styles.badge}>
            <Ionicons name="lock-closed" size={12} color={Colors.DANGER} style={styles.badgeIcon} />
            <Text style={styles.badgeText}>Hard Block</Text>
          </View>
        )}
        {isOverLimit && (
          <Text style={styles.overText}>
            +{minutesUsed - limit.dailyLimitMinutes}m over
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 180,
    padding: Spacing.md,
    backgroundColor: Colors.SURFACE,
    borderRadius: Radius.md,
    marginRight: Spacing.md,
    borderWidth: 0.5,
    borderColor: `${Colors.SECONDARY}33`,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  appName: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    fontWeight: '600',
  },
  time: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
  },
  timeOver: {
    color: Colors.DANGER,
  },
  progressBg: {
    height: 6,
    backgroundColor: `${Colors.SECONDARY}33`,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: Typography.sizes.xs,
    color: Colors.DANGER,
  },
  overText: {
    fontSize: Typography.sizes.xs,
    color: Colors.DANGER,
  },
});
