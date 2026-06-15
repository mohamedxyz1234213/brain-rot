import React, { useCallback } from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Spacing, Typography, Sizing, ANIMATION } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, ANIMATION.spring);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, ANIMATION.spring);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.base, styles[variant], styles[`size_${size}`], disabled && styles.disabled, style, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? Colors.PRIMARY_LIGHT : Colors.TEXT_ON_PRIMARY} />
      ) : (
        <Text style={[styles.text, styles[`text_${variant}`], styles[`text_${size}`], textStyle]}>
          {title}
        </Text>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Sizing.touchTarget,
  },
  primary: { backgroundColor: Colors.PRIMARY },
  secondary: {
    backgroundColor: Colors.SURFACE_RAISED,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  danger: { backgroundColor: Colors.DANGER },
  ghost: { backgroundColor: 'transparent' },
  size_sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg },
  size_md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl },
  size_lg: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing['2xl'] },
  disabled: { opacity: 0.4 },
  text: { fontWeight: 600 },
  text_primary: { color: Colors.TEXT_ON_PRIMARY },
  text_secondary: { color: Colors.TEXT_PRIMARY },
  text_danger: { color: Colors.TEXT_ON_PRIMARY },
  text_ghost: { color: Colors.PRIMARY_LIGHT },
  text_sm: { fontSize: Typography.sizes.sm },
  text_md: { fontSize: Typography.sizes.md },
  text_lg: { fontSize: Typography.sizes.lg },
});
