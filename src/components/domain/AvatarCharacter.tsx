import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Path, Circle as SvgCircle, G, Rect } from 'react-native-svg';
import { Colors, Typography, Spacing } from '../../constants/theme';

interface AvatarCharacterProps {
  stage: number;
  size?: number;
}

// Evolution from dull/gray (brain-rotted) to warm champagne/gold (ascended),
// glow ramps in the brand gold to match the premium palette.
const STAGE_COLORS = [
  { skin: '#6E6A60', glow: 'transparent', bg: '#1A140C' },
  { skin: '#8C8576', glow: 'transparent', bg: '#1F1810' },
  { skin: '#A9947D', glow: 'transparent', bg: '#241C12' },
  { skin: '#C6BAAC', glow: '#F3E49C33', bg: '#2A2016' },
  { skin: '#D9CBA8', glow: '#F3E49C66', bg: '#302418' },
  { skin: '#E8D9A8', glow: '#F3E49C99', bg: '#352819' },
  { skin: '#F5EAC0', glow: '#F3E49CCC', bg: '#3A2C1B' },
];

const STAGE_LABELS = [
  'Zombie', 'Waking Up', 'Struggling', 'Recovering',
  'Healing', 'Thriving', 'Ascended',
];

export function AvatarCharacter({ stage, size = 120 }: AvatarCharacterProps) {
  const colors = STAGE_COLORS[Math.min(stage, 6)];
  const label = STAGE_LABELS[Math.min(stage, 6)];
  const headY = 30 - stage * 2;
  const bodyTilt = (6 - stage) * 2;

  return (
    <Animated.View entering={FadeIn.duration(500)} style={[styles.container, { width: size, height: size + 24 }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {stage >= 3 && <SvgCircle cx="50" cy="50" r="45" fill={colors.glow} />}
        <G rotation={bodyTilt} origin="50, 70">
          <Rect x="38" y="50" width="24" height="30" rx="8" fill={colors.skin} opacity={0.8} />
          <Rect x="28" y="52" width="10" height="24" rx="5" fill={colors.skin} opacity={0.7} />
          <Rect x="62" y="52" width="10" height="24" rx="5" fill={colors.skin} opacity={0.7} />
        </G>
        <SvgCircle cx="50" cy={headY} r="18" fill={colors.skin} />
        <SvgCircle cx="44" cy={headY - 2} r={stage < 2 ? 1.5 : 2.5} fill="#333" />
        <SvgCircle cx="56" cy={headY - 2} r={stage < 2 ? 1.5 : 2.5} fill="#333" />
        {stage < 3 && <Rect x="62" y="55" width="8" height="14" rx="2" fill="#4488ff" opacity={0.8} />}
        {stage >= 5 && (
          <>
            <Path d="M 20 20 L 22 18 L 24 20 L 22 22 Z" fill={Colors.PRIMARY} />
            <Path d="M 75 15 L 77 13 L 79 15 L 77 17 Z" fill={Colors.PRIMARY} />
            <Path d="M 80 40 L 82 38 L 84 40 L 82 42 Z" fill={Colors.PRIMARY} />
          </>
        )}
      </Svg>
      <Text style={styles.label}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  label: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
