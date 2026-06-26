import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { ILLUSTRATIONS } from '../../data/appIllustrations';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';

interface AnimatedSvgIllustrationProps {
  /** Key from ILLUSTRATIONS registry */
  illustrationKey: string;
  /** Width of the illustration (height auto-scales) */
  width?: number;
  /** Animation variant */
  variant?: 'breathe' | 'float' | 'fade-in' | 'none';
  /** Additional container style */
  style?: StyleProp<ViewStyle>;
  /** Animation delay in ms */
  delay?: number;
}

export function AnimatedSvgIllustration({
  illustrationKey,
  width = 200,
  variant = 'breathe',
  style,
  delay = 0,
}: AnimatedSvgIllustrationProps) {
  const svgXml = ILLUSTRATIONS[illustrationKey];

  const opacity = useSharedValue(variant === 'fade-in' ? 0 : 1);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (variant === 'breathe') {
      opacity.value = withDelay(
        delay,
        withRepeat(
          withTiming(0.7, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
          -1,
          true
        )
      );
    } else if (variant === 'float') {
      translateY.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
            withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          false
        )
      );
      scale.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1.03, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
            withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          false
        )
      );
    } else if (variant === 'fade-in') {
      opacity.value = withDelay(
        delay,
        withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
      );
    }
    return () => {
      cancelAnimation(opacity);
      cancelAnimation(translateY);
      cancelAnimation(scale);
    };
  }, [variant, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  if (!svgXml) return null;

  return (
    <Animated.View style={[styles.container, style, animatedStyle]}>
      <SvgXml xml={svgXml} width={width} height={width} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
