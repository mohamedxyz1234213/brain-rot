import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../../constants/theme';

interface SafeScreenProps {
  children: React.ReactNode;
  style?: object;
}

export function SafeScreen({ children, style }: SafeScreenProps) {
  return (
    <SafeAreaView style={[styles.container, style]}>
      {children}
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
    <View style={[styles.header, align === 'center' && styles.headerCenter]}>
      {onBack && (
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Go back">
          <Text style={styles.backBtn}>← Back</Text>
        </Pressable>
      )}
      {onClose && (
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
          <Text style={styles.closeBtn}>✕</Text>
        </Pressable>
      )}
      <Text style={[styles.title, align === 'center' && styles.titleCenter]}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
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
  closeBtn: {
    fontSize: Typography.sizes.lg,
    color: Colors.TEXT_SECONDARY,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
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
