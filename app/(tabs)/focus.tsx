import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';

const MODES = [
  { id: 'pomodoro', name: 'Pomodoro', duration: '25 min', emoji: '🍅' },
  { id: 'deep_work', name: 'Deep Work', duration: '90 min', emoji: '🧠' },
  { id: 'flow', name: 'Flow', duration: 'Custom', emoji: '🌊' },
  { id: 'quick_sprint', name: 'Quick Sprint', duration: '15 min', emoji: '⚡' },
] as const;

export default function FocusScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Focus Session</Text>
      <Text style={styles.subtitle}>Block all distractions. Get in the zone.</Text>

      <View style={styles.modes}>
        {MODES.map((mode) => (
          <Card key={mode.id} style={styles.modeCard}>
            <Text style={styles.modeEmoji}>{mode.emoji}</Text>
            <Text style={styles.modeName}>{mode.name}</Text>
            <Text style={styles.modeDuration}>{mode.duration}</Text>
          </Card>
        ))}
      </View>

      <Button title="Start Focus Session" onPress={() => {}} size="lg" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    padding: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
    marginTop: Spacing.lg,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  modes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing['2xl'],
  },
  modeCard: {
    width: '47%',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modeEmoji: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  modeName: {
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  modeDuration: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginTop: Spacing.xs,
  },
});
