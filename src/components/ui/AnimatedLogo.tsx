import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
  useDerivedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { Colors } from '../../constants/theme';

interface AnimatedLogoProps {
  size?: number;
  color?: string;
  animated?: boolean;
  style?: object;
}

// The brain/neural-network SVG paths — 6 segments of the logo
const LOGO_PATHS = [
  'M 64 192 C 64 227.346 35.346 256 0 256 L 0 192 C 0 156.654 28.654 128 64 128 Z',
  'M 128 128 C 163.346 128 192 156.654 192 192 L 192 256 C 156.654 256 128 227.346 128 192 C 128 227.346 99.346 256 64 256 L 64 192 C 64 156.654 92.654 128 128 128 Z',
  'M 192 128 C 227.346 128 256 156.654 256 192 L 256 256 C 220.654 256 192 227.346 192 192 Z',
  'M 0 0 C 35.346 0 64 28.654 64 64 L 64 128 C 28.654 128 0 99.346 0 64 Z',
  'M 192 64 C 192 99.346 163.346 128 128 128 C 92.654 128 64 99.346 64 64 L 64 0 C 99.346 0 128 28.654 128 64 C 128 28.654 156.654 0 192 0 Z',
  'M 256 64 C 256 99.346 227.346 128 192 128 L 192 64 C 192 28.654 220.654 0 256 0 Z',
];

const AnimatedPath = Animated.createAnimatedComponent(Path);

/**
 * Individual animated path — each gets its own hooks (rules-of-hooks safe).
 * Animates staggered opacity for a wave-like breathing effect across the logo.
 */
function AnimatedLogoPath({
  d,
  index,
  breathe,
  gradientId,
}: {
  d: string;
  index: number;
  breathe: SharedValue<number>;
  gradientId: string;
}) {
  const offset = index * 0.14;

  const pathOpacity = useDerivedValue(() => {
    const t = Math.max(0, Math.min(1, (breathe.value - offset) / (1 - offset)));
    // Smooth bell-curve: fade up then back down
    return interpolate(t, [0, 0.5, 1], [0.4, 1, 0.4]);
  });

  return (
    <Path
      d={d}
      fill={`url(#${gradientId})`}
      opacity={pathOpacity as any}
    />
  );
}

export function AnimatedLogo({
  size = 120,
  color = Colors.PRIMARY_LIGHT,
  animated = true,
  style,
}: AnimatedLogoProps) {
  const breathe = useSharedValue(0);
  const fadeIn = useSharedValue(0);
  const instanceId = useMemo(() => Math.random().toString(36).slice(2, 8), []);

  useEffect(() => {
    if (!animated) {
      breathe.value = 0.5;
      fadeIn.value = 1;
      return;
    }

    breathe.value = withRepeat(
      withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );

    fadeIn.value = withTiming(1, { duration: 600 });

    return () => {
      breathe.value = 0;
      fadeIn.value = 0;
    };
  }, [animated]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(fadeIn.value, [0, 1], [0, 1]),
  }));

  const gradientId = `logoGrad-${instanceId}`;

  return (
    <Animated.View style={[{ width: size, height: size }, style, containerStyle]}>
      <Svg width="100%" height="100%" viewBox="0 0 256 256">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="256" y2="256">
            <Stop offset="0%" stopColor={Colors.PRIMARY} stopOpacity="1" />
            <Stop offset="50%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor={Colors.PRIMARY_DARK} stopOpacity="0.9" />
          </LinearGradient>
        </Defs>
        {LOGO_PATHS.map((d, i) => (
          <AnimatedLogoPath
            key={i}
            d={d}
            index={i}
            breathe={breathe}
            gradientId={gradientId}
          />
        ))}
      </Svg>
    </Animated.View>
  );
}
