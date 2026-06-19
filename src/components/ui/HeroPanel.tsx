import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Typography, Spacing, Radius, LetterSpacing, Shadow, Gradients, ANIMATION } from '../../constants/theme';

interface HeroPanelProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  children?: React.ReactNode;
  style?: ViewStyle;
}

// Signature feature panel: a large-radius teal gradient slab with soft cream
// orb accents, used to anchor the top of a screen (e.g. the brain score hero).
export function HeroPanel({ title, eyebrow, subtitle, badge, children, style }: HeroPanelProps) {
  return (
    <Animated.View entering={FadeInDown.duration(ANIMATION.entrance.duration)} style={[styles.panel, style]}>
      <LinearGradient colors={Gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Circle cx="86%" cy="-4%" r={120} fill="rgba(242,230,218,0.08)" />
        <Circle cx="94%" cy="6%" r={64} fill="rgba(242,230,218,0.06)" />
        <Circle cx="2%" cy="102%" r={130} fill="rgba(255,255,255,0.05)" />
      </Svg>
      <View style={styles.header}>
        <View style={styles.headerText}>
          {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {badge && <View style={styles.badge}>{badge}</View>}
      </View>
      {children && <View style={styles.body}>{children}</View>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: Radius['2xl'],
    overflow: 'hidden',
    padding: Spacing.xl,
    paddingBottom: Spacing.xl,
    ...Shadow.glow,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  headerText: { flex: 1 },
  eyebrow: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.families.featureSemi,
    color: 'rgba(242,230,218,0.78)',
    letterSpacing: LetterSpacing.wide,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    fontSize: Typography.sizes['3xl'],
    fontFamily: Typography.families.display,
    color: Colors.TEXT_ON_PRIMARY,
    letterSpacing: LetterSpacing.tight,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.families.body,
    color: 'rgba(242,230,218,0.72)',
    marginTop: Spacing.xs,
  },
  badge: { flexDirection: 'row', alignItems: 'center', paddingTop: 4 },
  body: { alignItems: 'center', marginTop: Spacing.lg },
});
