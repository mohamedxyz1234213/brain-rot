import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors, Spacing, Radius, Shadow, Glass, Sizing, Typography, ANIMATION } from '../../constants/theme';

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Floating glassmorphic tab bar — a detached, blurred pill that hovers above
// the home indicator. Active tab sits in a glowing teal lozenge that springs
// in with a subtle scale + label fade.
export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: insets.bottom + Spacing.sm }]}>
      <View style={styles.shadow}>
        <BlurView intensity={40} tint="light" style={styles.bar}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const focused = state.index === index;
            const tint = focused ? Colors.TEXT_ON_PRIMARY : Colors.TEXT_SECONDARY;
            const icon = options.tabBarIcon?.({ focused, color: tint, size: Sizing.iconMd });
            const label = typeof options.title === 'string' ? options.title : titleCase(route.name);

            const onPress = () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TabItem
                key={route.key}
                focused={focused}
                icon={icon}
                label={label}
                onPress={onPress}
              />
            );
          })}
        </BlurView>
      </View>
    </View>
  );
}

function TabItem({
  focused,
  icon,
  label,
  onPress,
}: {
  focused: boolean;
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  const progress = useSharedValue(focused ? 1 : 0);
  const press = useSharedValue(1);

  useEffect(() => {
    progress.value = withSpring(focused ? 1 : 0, ANIMATION.springSoft);
  }, [focused, progress]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ scale: press.value * (0.96 + progress.value * 0.04) }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 4 }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ scale: 1 - progress.value * 0.2 }],
    position: 'absolute',
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => (press.value = withTiming(0.92, { duration: 90 }))}
      onPressOut={() => (press.value = withSpring(1, ANIMATION.spring))}
      style={styles.item}
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      accessibilityLabel={label}
      hitSlop={8}
    >
      <Animated.View style={[styles.pill, focused && styles.pillActive, pillStyle]}>
        <Animated.View style={iconStyle}>{icon}</Animated.View>
        <Animated.View style={labelStyle}>
          <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
            {label}
          </Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
  },
  shadow: {
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.88)',
    ...Shadow.lg,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 64,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Glass.borderSlate,
    overflow: 'hidden',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingHorizontal: 2,
  },
  pill: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
  },
  pillActive: {
    backgroundColor: Colors.PRIMARY_DARK,
  },
  label: {
    fontFamily: Typography.families.feature,
    fontSize: Typography.sizes.xs + 1,
    color: Colors.TEXT_ON_PRIMARY,
    letterSpacing: 0.6,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
