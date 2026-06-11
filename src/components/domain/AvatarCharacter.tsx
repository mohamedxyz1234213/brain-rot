import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle as SvgCircle, G, Rect } from 'react-native-svg';
import { theme } from '../../constants/theme';

interface AvatarCharacterProps {
  stage: number; // 0 = zombie, 6 = ascended
  size?: number;
}

const STAGE_COLORS = [
  { skin: '#666666', glow: 'transparent', bg: '#1a1a1a' },     // Zombie
  { skin: '#888888', glow: 'transparent', bg: '#1a2020' },     // Waking Up
  { skin: '#99aa99', glow: 'transparent', bg: '#1a2525' },     // Struggling
  { skin: '#aabbaa', glow: '#43686F33', bg: '#1a2a2a' },       // Recovering
  { skin: '#bbccbb', glow: '#43686F66', bg: '#1a3030' },       // Healing
  { skin: '#ccddcc', glow: '#43686F99', bg: '#1a3535' },       // Thriving
  { skin: '#eeffee', glow: '#43686FCC', bg: '#1a3a3a' },       // Ascended
];

const STAGE_LABELS = [
  'Zombie 🧟',
  'Waking Up 😴',
  'Struggling 😤',
  'Recovering 💪',
  'Healing 🌱',
  'Thriving ⚡',
  'Ascended 🧘',
];

export function AvatarCharacter({ stage, size = 120 }: AvatarCharacterProps) {
  const colors = STAGE_COLORS[Math.min(stage, 6)];
  const label = STAGE_LABELS[Math.min(stage, 6)];

  // Posture: zombie is hunched, ascended is upright
  const headY = 30 - stage * 2;
  const bodyTilt = (6 - stage) * 2;

  return (
    <View style={[styles.container, { width: size, height: size + 24 }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Glow effect for higher stages */}
        {stage >= 3 && (
          <SvgCircle
            cx="50"
            cy="50"
            r="45"
            fill={colors.glow}
          />
        )}

        {/* Body */}
        <G rotation={bodyTilt} origin="50, 70">
          {/* Torso */}
          <Rect
            x="38"
            y="50"
            width="24"
            height="30"
            rx="8"
            fill={colors.skin}
            opacity={0.8}
          />
          {/* Arms */}
          <Rect x="28" y="52" width="10" height="24" rx="5" fill={colors.skin} opacity={0.7} />
          <Rect x="62" y="52" width="10" height="24" rx="5" fill={colors.skin} opacity={0.7} />
        </G>

        {/* Head */}
        <SvgCircle cx="50" cy={headY} r="18" fill={colors.skin} />

        {/* Eyes */}
        <SvgCircle cx="44" cy={headY - 2} r={stage < 2 ? 1.5 : 2.5} fill="#333" />
        <SvgCircle cx="56" cy={headY - 2} r={stage < 2 ? 1.5 : 2.5} fill="#333" />

        {/* Phone (only for zombie/low stages) */}
        {stage < 3 && (
          <Rect x="62" y="55" width="8" height="14" rx="2" fill="#4488ff" opacity={0.8} />
        )}

        {/* Sparkles for high stages */}
        {stage >= 5 && (
          <>
            <Path d="M 20 20 L 22 18 L 24 20 L 22 22 Z" fill={theme.colors.primary} />
            <Path d="M 75 15 L 77 13 L 79 15 L 77 17 Z" fill={theme.colors.primary} />
            <Path d="M 80 40 L 82 38 L 84 40 L 82 42 Z" fill={theme.colors.primary} />
          </>
        )}
      </Svg>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
});
