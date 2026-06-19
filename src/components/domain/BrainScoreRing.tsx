import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Typography, Spacing, ANIMATION } from '../../constants/theme';

interface BrainScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

const LEVEL_LABELS: Record<string, string> = {
  zombie: 'Zombie',
  waking_up: 'Waking Up',
  struggling: 'Struggling',
  recovering: 'Recovering',
  healing: 'Healing',
  thriving: 'Thriving',
  ascended: 'Ascended',
};

function getScoreLevel(score: number): string {
  if (score >= 95) return 'ascended';
  if (score >= 80) return 'thriving';
  if (score >= 65) return 'healing';
  if (score >= 50) return 'recovering';
  if (score >= 35) return 'struggling';
  if (score >= 20) return 'waking_up';
  return 'zombie';
}

function getScoreColor(score: number): string {
  if (score >= 80) return Colors.SUCCESS;
  if (score >= 50) return Colors.PRIMARY;
  if (score >= 30) return Colors.WARNING;
  return Colors.DANGER;
}

export function BrainScoreRing({
  score,
  size = 180,
  strokeWidth = 12,
  showLabel = true,
}: BrainScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const color = getScoreColor(score);
  const level = getScoreLevel(score);
  const progress = (score / 100) * circumference;

  return (
    <Animated.View entering={FadeIn.duration(600)} style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`${Colors.SECONDARY}33`}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.score, { color }]}>{score}</Text>
        {showLabel && <Text style={styles.label}>{LEVEL_LABELS[level]}</Text>}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  center: {
    alignItems: 'center',
  },
  score: {
    fontSize: Typography.sizes['4xl'],
    fontWeight: '700',
  },
  label: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginTop: Spacing.xs,
  },
});
