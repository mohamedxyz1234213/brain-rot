import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Gradients } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

interface OrbCfg {
  color: string;
  size: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  duration: number;
}

// A single soft color orb that drifts and breathes on a loop. Several of these
// over the gradient, blurred by the veil above, read as a living color mesh.
function Orb({ color, size, x, y, dx, dy, duration }: OrbCfg) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(t.value, [0, 1], [0, dx]) },
      { translateY: interpolate(t.value, [0, 1], [0, dy]) },
      { scale: interpolate(t.value, [0, 1], [1, 1.18]) },
    ],
    opacity: interpolate(t.value, [0, 0.5, 1], [0.85, 1, 0.85]),
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

// Crisp dashed concentric rings that rotate slowly — a moving SVG accent that
// sits above the blur, so it stays sharp as fine line-art.
function RotatingRings({
  top,
  left,
  size,
  reverse,
}: {
  top: number;
  left: number;
  size: number;
  reverse?: boolean;
}) {
  const r = useSharedValue(0);
  useEffect(() => {
    r.value = withRepeat(
      withTiming(1, { duration: reverse ? 52000 : 44000, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(r.value, [0, 1], reverse ? [360, 0] : [0, 360])}deg` }],
  }));
  const c = size / 2;
  return (
    <Animated.View style={[{ position: 'absolute', top, left }, style]}>
      <Svg width={size} height={size}>
        <SvgCircle cx={c} cy={c} r={c - 6} stroke="rgba(67,104,111,0.12)" strokeWidth={1.2} fill="none" strokeDasharray="3 12" />
        <SvgCircle cx={c} cy={c} r={c - 34} stroke="rgba(40,49,51,0.07)" strokeWidth={1} fill="none" strokeDasharray="2 9" />
      </Svg>
    </Animated.View>
  );
}

// Full-screen living background: two-color gradient -> drifting blurred orbs ->
// frosted blur veil -> crisp rotating SVG rings. Painted behind every screen.
export function AuroraBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[...Gradients.canvas] as unknown as [string, string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Orb color="rgba(67,104,111,0.30)" size={320} x={-70} y={-50} dx={46} dy={70} duration={9000} />
      <Orb color="rgba(194,145,78,0.22)" size={280} x={width - 170} y={height * 0.22} dx={-54} dy={48} duration={11500} />
      <Orb color="rgba(90,143,123,0.24)" size={260} x={width * 0.28} y={height * 0.58} dx={36} dy={-58} duration={10200} />
      <Orb color="rgba(67,104,111,0.18)" size={220} x={width * 0.5} y={height * 0.82} dx={-30} dy={-44} duration={12500} />
      <BlurView intensity={64} tint="light" style={StyleSheet.absoluteFill} />
      <RotatingRings top={-120} left={width - 200} size={300} />
      <RotatingRings top={height * 0.62} left={-90} size={220} reverse />
    </View>
  );
}
