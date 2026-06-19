import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Sizing, Layout, LetterSpacing, ANIMATION } from '../../constants/theme';
import { AuroraBackground } from './AuroraBackground';

interface SafeScreenProps {
  children: React.ReactNode;
  style?: object;
  // Reserve bottom space for the floating tab bar (use on tab screens only).
  tabBarSpacing?: boolean;
}

export function SafeScreen({ children, style, tabBarSpacing }: SafeScreenProps) {
  return (
    <View style={styles.root}>
      <AuroraBackground />
      <SafeAreaView style={[styles.container, style]}>
        <View style={[styles.content, tabBarSpacing && styles.contentTabBar]}>{children}</View>
      </SafeAreaView>
    </View>
  );
}

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onClose?: () => void;
  rightAction?: React.ReactNode;
  align?: 'left' | 'center';
}

export function ScreenHeader({ title, subtitle, onBack, onClose, rightAction, align = 'left' }: ScreenHeaderProps) {
  return (
    <Animated.View entering={FadeInDown.duration(ANIMATION.entrance.duration)} style={[styles.header, align === 'center' && styles.headerCenter]}>
      {onBack && (
        <Pressable style={[styles.iconButton, styles.backButton]} onPress={onBack} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={Sizing.iconMd} color={Colors.PRIMARY_LIGHT} />
          <Text style={styles.backBtn}>Back</Text>
        </Pressable>
      )}
      {onClose && (
        <Pressable style={styles.iconButton} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
          <Ionicons name="close" size={Sizing.iconLg} color={Colors.TEXT_SECONDARY} style={styles.closeBtn} />
        </Pressable>
      )}
      <Text style={[styles.title, align === 'center' && styles.titleCenter]}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
    </Animated.View>
  );
}

interface TabHeaderProps {
  title: string;
  eyebrow?: string;
  rightAction?: React.ReactNode;
}

// Consistent header for tab screens: Space Grotesk eyebrow + Playfair title,
// with an optional right-aligned action. Matches the home hero typography.
export function TabHeader({ title, eyebrow, rightAction }: TabHeaderProps) {
  return (
    <Animated.View entering={FadeInDown.duration(ANIMATION.entrance.duration)} style={styles.tabHeader}>
      <View style={styles.tabHeaderText}>
        {eyebrow && <Text style={styles.tabEyebrow}>{eyebrow}</Text>}
        <Text style={styles.tabTitle}>{title}</Text>
      </View>
      {rightAction && <View style={styles.tabHeaderAction}>{rightAction}</View>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  tabHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  tabHeaderText: { flex: 1 },
  tabEyebrow: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.families.featureSemi,
    color: Colors.PRIMARY,
    letterSpacing: LetterSpacing.wide,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  tabTitle: {
    fontSize: Typography.sizes['3xl'],
    fontFamily: Typography.families.display,
    color: Colors.TEXT_PRIMARY,
    letterSpacing: LetterSpacing.tight,
  },
  tabHeaderAction: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingBottom: 4 },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
  },
  contentTabBar: {
    paddingBottom: Layout.tabBarClearance,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  headerCenter: {
    alignItems: 'center',
  },
  backBtn: {
    fontSize: Typography.sizes.md,
    color: Colors.PRIMARY_LIGHT,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  iconButton: {
    minHeight: Sizing.touchTarget,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  closeBtn: {
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes['3xl'],
    fontFamily: Typography.families.display,
    color: Colors.TEXT_PRIMARY,
    letterSpacing: LetterSpacing.tight,
  },
  titleCenter: {
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    marginTop: Spacing.xs,
  },
  rightAction: {
    position: 'absolute',
    right: Spacing.xl,
    top: Spacing.sm,
  },
});
