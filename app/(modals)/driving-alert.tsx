import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { Button } from '../../src/components/ui/Button';

export default function DrivingAlertModal() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🚗</Text>
      <Text style={styles.title}>YOU ARE DRIVING</Text>
      <Text style={styles.subtitle}>
        Put your phone down. Your life and others' lives depend on it.
      </Text>

      <View style={styles.divider} />

      <Text style={styles.info}>
        This screen will auto-dismiss 60 seconds after driving stops.
      </Text>

      <Button
        title="Emergency Call"
        onPress={() => {}}
        variant="danger"
        size="lg"
        style={styles.emergencyButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  icon: {
    fontSize: 80,
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.sizes['4xl'],
    fontWeight: '900',
    color: Colors.DANGER,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  subtitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.TEXT_PRIMARY,
    textAlign: 'center',
    lineHeight: 26,
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: Colors.SURFACE,
    marginVertical: Spacing['2xl'],
  },
  info: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
  },
  emergencyButton: {
    width: '100%',
  },
});
