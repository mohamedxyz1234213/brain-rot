import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'surface' | 'raised';
  style?: ViewStyle;
}

export function Card({ children, variant = 'surface', style }: CardProps) {
  return (
    <View style={[styles.base, variant === 'raised' && styles.raised, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.SURFACE,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: `${Colors.SECONDARY}33`,
  },
  raised: {
    backgroundColor: Colors.SURFACE_RAISED,
  },
});
