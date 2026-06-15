import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'surface' | 'raised' | 'outline';
  onPress?: () => void;
  style?: ViewStyle;
}

export function Card({ children, variant = 'surface', onPress, style }: CardProps) {
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      style={[styles.base, styles[variant], style]}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      {children}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.SURFACE,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  surface: {
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  raised: {
    backgroundColor: Colors.SURFACE_RAISED,
    borderColor: Colors.BORDER_LIGHT,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
});
