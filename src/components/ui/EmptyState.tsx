import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Typography, Spacing } from '../../constants/theme';

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function EmptyState({ emoji, title, subtitle, action }: EmptyStateProps) {
  return (
    <Animated.View entering={FadeInDown.duration(500)} style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {action && <View style={styles.action}>{action}</View>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  emoji: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: 600,
    color: Colors.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.normal,
    marginBottom: Spacing.xl,
  },
  action: {
    marginTop: Spacing.lg,
  },
});
