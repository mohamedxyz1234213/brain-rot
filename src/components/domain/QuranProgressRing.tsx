import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '../../constants/theme';

interface QuranProgressRingProps {
  currentJuz: number;
  totalJuz?: number;
  currentPage: number;
  dailyPageGoal: number;
  pagesReadToday: number;
  khatmCount: number;
}

export function QuranProgressRing({
  currentJuz,
  totalJuz = 30,
  currentPage,
  dailyPageGoal,
  pagesReadToday,
  khatmCount,
}: QuranProgressRingProps) {
  const juzProgress = (currentJuz / totalJuz) * 100;
  const dailyProgress = dailyPageGoal > 0 ? (pagesReadToday / dailyPageGoal) * 100 : 0;

  const size = 160;
  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const juzDash = (juzProgress / 100) * circumference;

  const innerRadius = radius - strokeWidth - 4;
  const innerCircumference = innerRadius * 2 * Math.PI;
  const dailyDash = (Math.min(dailyProgress, 100) / 100) * innerCircumference;

  return (
    <View style={styles.container}>
      <View style={[styles.ringContainer, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          {/* Outer ring bg */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`${theme.colors.secondary}33`}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Outer ring - Juz progress */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.colors.primary}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${juzDash} ${circumference}`}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
          {/* Inner ring bg */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={innerRadius}
            stroke={`${theme.colors.secondary}22`}
            strokeWidth={strokeWidth - 2}
            fill="none"
          />
          {/* Inner ring - Daily progress */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={innerRadius}
            stroke={theme.colors.success}
            strokeWidth={strokeWidth - 2}
            fill="none"
            strokeDasharray={`${dailyDash} ${innerCircumference}`}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={styles.centerContent}>
          <Text style={styles.juzText}>Juz {currentJuz}</Text>
          <Text style={styles.pageText}>p. {currentPage}</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{pagesReadToday}/{dailyPageGoal}</Text>
          <Text style={styles.statLabel}>Pages today</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{khatmCount}</Text>
          <Text style={styles.statLabel}>Khatm</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Math.round(juzProgress)}%</Text>
          <Text style={styles.statLabel}>Overall</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
  },
  juzText: {
    fontSize: theme.typography.lg,
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  pageText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statValue: {
    fontSize: theme.typography.lg,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: `${theme.colors.secondary}44`,
  },
});
