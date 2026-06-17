import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Colors, Radius, ANIMATION } from '../../constants/theme';

interface ProgressBarProps {
  progress: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
  gradient?: readonly string[];
}

export function ProgressBar({
  progress,
  height = 4,
  color = Colors.PRIMARY_LIGHT,
  backgroundColor = Colors.BORDER,
  animated = true,
  gradient,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const barColor = clampedProgress >= 100 ? Colors.DANGER : color;
  const widthPercent = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      widthPercent.value = withTiming(clampedProgress / 100, {
        duration: ANIMATION.timing.normal,
      });
    } else {
      widthPercent.value = clampedProgress / 100;
    }
  }, [clampedProgress, animated]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${widthPercent.value * 100}%`,
  }));

  return (
    <View style={[styles.container, { height, backgroundColor }]}>
      <Animated.View style={[styles.fill, fillStyle, { backgroundColor: gradient ? 'transparent' : barColor }]}>
        {gradient && (
          <LinearGradient
            colors={[...gradient] as unknown as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.full,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
