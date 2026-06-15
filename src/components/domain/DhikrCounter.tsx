import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

interface DhikrCounterProps {
  arabicText: string;
  transliteration: string;
  translation: string;
  completedCount: number;
  targetCount: number;
  onIncrement: () => void;
  onComplete: () => void;
}

export function DhikrCounter({
  arabicText,
  transliteration,
  translation,
  completedCount,
  targetCount,
  onIncrement,
  onComplete,
}: DhikrCounterProps) {
  const progress = completedCount / targetCount;
  const isCompleted = completedCount >= targetCount;

  const handleTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isCompleted) {
      onComplete();
    } else {
      onIncrement();
    }
  };

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      <Text style={styles.arabic}>{arabicText}</Text>
      <Text style={styles.transliteration}>{transliteration}</Text>
      <Text style={styles.translation}>{translation}</Text>

      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
      </View>

      <Text style={styles.count}>
        {completedCount} / {targetCount}
      </Text>

      <Pressable style={styles.tapButton} onPress={handleTap}>
        <Text style={styles.tapButtonText}>
          {isCompleted ? '✓ Complete' : 'Tap'}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.SURFACE,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    borderWidth: 0.5,
    borderColor: `${Colors.SECONDARY}33`,
  },
  arabic: {
    fontSize: Typography.sizes['2xl'],
    color: Colors.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    lineHeight: 40,
  },
  transliteration: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  translation: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  progressBg: {
    height: 6,
    backgroundColor: `${Colors.SECONDARY}33`,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.PRIMARY,
    borderRadius: Radius.full,
  },
  count: {
    fontSize: Typography.sizes.xl,
    color: Colors.TEXT_PRIMARY,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  tapButton: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  tapButtonText: {
    color: '#fff',
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
  },
});
