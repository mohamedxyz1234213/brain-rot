import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

interface QuranProgressRingProps {
  currentJuz: number;
  totalPages: number;
  pagesReadToday: number;
  dailyPageGoal: number;
  khatmCount: number;
  overallProgress: number;
}

export function QuranProgressRing({
  currentJuz,
  totalPages,
  pagesReadToday,
  dailyPageGoal,
  khatmCount,
  overallProgress,
}: QuranProgressRingProps) {
  const juzProgress = (currentJuz / 30) * 100;
  const dailyProgress = (pagesReadToday / dailyPageGoal) * 100;

  return (
    <Animated.View entering={FadeIn.duration(500)} style={styles.container}>
      <View style={styles.rings}>
        <View style={styles.ring}>
          <View style={styles.ringBg}>
            <View style={[styles.ringFill, { height: `${Math.min(juzProgress, 100)}%`, backgroundColor: Colors.PRIMARY }]} />
          </View>
          <Text style={styles.ringLabel}>Juz {currentJuz}/30</Text>
        </View>
        <View style={styles.ring}>
          <View style={styles.ringBg}>
            <View style={[styles.ringFill, { height: `${Math.min(dailyProgress, 100)}%`, backgroundColor: Colors.SUCCESS }]} />
          </View>
          <Text style={styles.ringLabel}>{pagesReadToday}/{dailyPageGoal} pages</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <Text style={styles.stat}>{pagesReadToday} pages today</Text>
        <Text style={styles.stat}>{khatmCount} khatm completed</Text>
        <Text style={styles.stat}>{Math.round(overallProgress * 100)}% overall</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.SURFACE,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: `${Colors.SECONDARY}33`,
  },
  rings: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
  },
  ring: {
    alignItems: 'center',
  },
  ringBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.SECONDARY}33`,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  ringFill: {
    borderRadius: Radius.full,
  },
  ringLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginTop: Spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
  },
});
