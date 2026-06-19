import React, { useCallback, useEffect } from 'react';
import { Pressable, Text, StyleSheet, View, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Spacing, Typography, Sizing, Shadow, Gradients, ANIMATION } from '../../constants/theme';

// Shimmer/pulse loading indicator — the design system bans spinning dots.
function LoadingPulse({ color }: { color: string }) {
  const opacity = useSharedValue(0.35);
  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);
  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.pulse, { backgroundColor: color }, animated]} />;
}

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
    scale.value = withSpring(ANIMATION.pressScale, ANIMATION.springSoft);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, ANIMATION.springSoft);
  }, []);

  const content = loading ? (
    <LoadingPulse color={variant === 'ghost' || variant === 'secondary' ? Colors.PRIMARY_LIGHT : Colors.TEXT_ON_PRIMARY} />
  ) : (
    <Text style={[styles.text, styles[`text_${variant}`], styles[`text_${size}`], textStyle]}>
      {title}
    </Text>
  );

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
      {variant === 'primary' && !disabled ? (
        <LinearGradient
          colors={[...Gradients.brand] as unknown as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={StyleSheet.absoluteFill} />
      )}
      <View style={styles.content}>{content}</View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Sizing.touchTarget,
    overflow: 'hidden',
  },
  primary: { backgroundColor: Colors.PRIMARY, ...Shadow.sm },
  secondary: {
    backgroundColor: Colors.SURFACE_RAISED,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  danger: { backgroundColor: Colors.DANGER, ...Shadow.sm },
  ghost: { backgroundColor: 'transparent' },
  size_sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg },
  size_md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl },
  size_lg: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing['2xl'] },
  disabled: { opacity: 0.5, elevation: 0, shadowOpacity: 0 },
  content: { alignItems: 'center', justifyContent: 'center' },
  pulse: { width: 56, height: 8, borderRadius: Radius.full },
  text: { fontFamily: Typography.families.featureSemi, letterSpacing: 0.2 },
  text_primary: { color: Colors.TEXT_ON_PRIMARY },
  text_secondary: { color: Colors.TEXT_PRIMARY },
  text_danger: { color: Colors.TEXT_ON_PRIMARY },
  text_ghost: { color: Colors.PRIMARY_LIGHT },
  text_sm: { fontSize: Typography.sizes.sm },
  text_md: { fontSize: Typography.sizes.md },
  text_lg: { fontSize: Typography.sizes.lg },
});
