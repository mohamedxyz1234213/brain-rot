import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';
import { Colors, Typography, LetterSpacing, ANIMATION } from '../../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface BrainScoreOrbProps {
  score: number;
  size?: number;
}

function getZoneColor(score: number): string {
  if (score >= 80) return '#5A8F7B';
  if (score >= 60) return '#577E86';
  if (score >= 40) return '#C2914E';
  return '#B85C5C';
}

/**
 * Minimal score ring: a single gradient progress arc on a light track,
 * with the score number centered. No halos, no pulse, no shimmer.
 */
export function BrainScoreOrb({ score, size = 220 }: BrainScoreOrbProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const center = size / 2;
  const stroke = 14;
  const radius = (size - stroke) / 2 - 8;
  const circumference = radius * 2 * Math.PI;
  const zone = getZoneColor(clampedScore);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(clampedScore / 100, {
      duration: ANIMATION.timing.slow,
      easing: Easing.out(Easing.cubic),
    });
  }, [clampedScore]);

  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgLinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={zone} stopOpacity={0.95} />
            <Stop offset="100%" stopColor={zone} stopOpacity={0.7} />
          </SvgLinearGradient>
        </Defs>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="rgba(40,49,51,0.08)"
          strokeWidth={stroke}
          fill="none"
        />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          animatedProps={arcProps}
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.kicker}>Brain Score</Text>
        <Text style={[styles.value, { color: zone }]}>{Math.round(clampedScore)}</Text>
        <Text style={styles.outOf}>/ 100</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  kicker: {
    fontSize: 10,
    fontFamily: Typography.families.featureSemi,
    color: Colors.TEXT_SECONDARY,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: 64,
    lineHeight: 68,
    fontFamily: Typography.families.numeric,
    letterSpacing: -2,
    fontWeight: '700',
  },
  outOf: {
    fontSize: 12,
    fontFamily: Typography.families.featureMedium,
    color: Colors.TEXT_SECONDARY,
    marginTop: 2,
    letterSpacing: 0.5,
  },
});
