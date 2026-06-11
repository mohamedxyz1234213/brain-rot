import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '../../constants/theme';

interface BrainScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

const LEVEL_LABELS: Record<string, string> = {
  zombie: 'Zombie 🧟',
  waking_up: 'Waking Up 😴',
  struggling: 'Struggling 😤',
  recovering: 'Recovering 💪',
  healing: 'Healing 🌱',
  thriving: 'Thriving ⚡',
  ascended: 'Ascended 🧘',
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
  if (score >= 80) return theme.colors.success;
  if (score >= 50) return theme.colors.primary;
  if (score >= 30) return theme.colors.warning;
  return theme.colors.danger;
}

export function BrainScoreRing({
  score,
  size = 180,
  strokeWidth = 12,
  showLabel = true,
}: BrainScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (score / 100) * circumference;
  const color = getScoreColor(score);
  const level = getScoreLevel(score);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`${theme.colors.secondary}33`}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
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
        {showLabel && (
          <Text style={styles.label}>{LEVEL_LABELS[level]}</Text>
        )}
      </View>
    </View>
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
    fontSize: 42,
    fontWeight: '700',
  },
  label: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
});
