import React, { useCallback } from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Spacing, Shadow, Layout, Gradients, ANIMATION } from '../../constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CardProps {
  children: React.ReactNode;
  variant?: 'surface' | 'raised' | 'outline';
  onPress?: () => void;
  dense?: boolean;
  glass?: boolean;
  style?: ViewStyle;
}

export function Card({ children, variant = 'surface', onPress, dense = false, glass = false, style }: CardProps) {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    if (onPress) {
      scale.value = withSpring(ANIMATION.pressScale, ANIMATION.springSoft);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [onPress]);

  const handlePressOut = useCallback(() => {
    if (onPress) {
      scale.value = withSpring(1, ANIMATION.springSoft);
    }
  }, [onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const borderRadius = dense ? Radius.lg : Radius.xl;

  const inner = (
    <View style={[styles.base, { borderRadius }, styles[variant], style]}>
      {glass && (
        <LinearGradient
          colors={[...Gradients.surface] as unknown as [string, string]}
          style={[StyleSheet.absoluteFill, { borderRadius }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      )}
      <View style={styles.childrenContainer}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        style={[animatedStyle]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
      >
        {inner}
      </AnimatedPressable>
    );
  }

  return inner;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.SURFACE,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  surface: {
    borderWidth: Layout.hairline,
    borderColor: Colors.BORDER,
  },
  raised: {
    backgroundColor: Colors.SURFACE_RAISED,
    borderWidth: Layout.hairline,
    borderColor: Colors.BORDER_LIGHT,
    ...Shadow.md,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: Layout.hairline,
    borderColor: Colors.BORDER,
  },
  childrenContainer: {
    position: 'relative',
  },
});
