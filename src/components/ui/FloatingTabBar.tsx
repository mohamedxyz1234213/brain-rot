import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors, Spacing, Radius, Shadow, Glass, Sizing, Typography } from '../../constants/theme';

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Floating glassmorphic tab bar — a detached, blurred pill that hovers above
// the home indicator. Active tab sits in a glowing teal lozenge.
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
              <Pressable
                key={route.key}
                onPress={onPress}
                style={styles.item}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                accessibilityLabel={label}
                hitSlop={8}
              >
                <View style={[styles.pill, focused && styles.pillActive]}>
                  {focused ? (
                    <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
                      {label}
                    </Text>
                  ) : (
                    icon
                  )}
                </View>
              </Pressable>
            );
          })}
        </BlurView>
      </View>
    </View>
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
    ...Shadow.sm,
  },
  label: {
    fontFamily: Typography.families.featureSemi,
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_ON_PRIMARY,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
