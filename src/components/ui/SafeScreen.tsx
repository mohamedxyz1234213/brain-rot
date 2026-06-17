import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Typography, Spacing, Sizing, Layout, LetterSpacing, ANIMATION } from '../../constants/theme';

interface SafeScreenProps {
  children: React.ReactNode;
  style?: object;
}

export function SafeScreen({ children, style }: SafeScreenProps) {
  return (
    <SafeAreaView style={[styles.container, style]}>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
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
        <Pressable style={styles.iconButton} onPress={onBack} accessibilityRole="button" accessibilityLabel="Go back">
          <Text style={styles.backBtn}>← Back</Text>
        </Pressable>
      )}
      {onClose && (
        <Pressable style={styles.iconButton} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
          <Text style={styles.closeBtn}>✕</Text>
        </Pressable>
      )}
      <Text style={[styles.title, align === 'center' && styles.titleCenter]}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
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
    marginBottom: Spacing.sm,
  },
  iconButton: {
    minHeight: Sizing.touchTarget,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  closeBtn: {
    fontSize: Typography.sizes.lg,
    color: Colors.TEXT_SECONDARY,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: '700',
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
