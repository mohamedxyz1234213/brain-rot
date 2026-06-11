import React from 'react';
import { View, Text, StyleSheet, Vibration } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { Button } from '../../src/components/ui/Button';

export default function RoastModal() {
  React.useEffect(() => {
    // Screen shake effect on brutal roasts
    Vibration.vibrate([0, 100, 50, 100]);
  }, []);

  return (
    <View style={styles.container}>
      {/* Persona Avatar */}
      <Text style={styles.personaEmoji}>🇪🇬</Text>
      <Text style={styles.personaName}>Egyptian Dad</Text>

      {/* Roast Text (typewriter animation would go here) */}
      <Text style={styles.roastText}>
        يا ابني، ابن خالتك خلص طب وانت لسه بتتفرج على تيك توك. ٤٥ دقيقة ضايعة. مبروك عليك.
      </Text>

      {/* Evidence */}
      <View style={styles.evidence}>
        <Text style={styles.evidenceTitle}>Evidence:</Text>
        <Text style={styles.evidenceItem}>📱 45 min on TikTok (limit: 30)</Text>
        <Text style={styles.evidenceItem}>❌ 3 blocked app attempts</Text>
        <Text style={styles.evidenceItem}>📋 2/7 tasks completed</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button title="I deserved this" onPress={() => router.back()} variant="secondary" />
        <Button title="Share my shame" onPress={() => {}} variant="ghost" />
        <Button title="Prove them wrong →" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    padding: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personaEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  personaName: {
    fontSize: Typography.sizes.lg,
    color: Colors.TEXT_SECONDARY,
    marginBottom: Spacing.xl,
  },
  roastText: {
    fontSize: Typography.sizes.xl,
    color: Colors.TEXT_PRIMARY,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: Spacing['2xl'],
  },
  evidence: {
    alignSelf: 'stretch',
    backgroundColor: Colors.SURFACE,
    padding: Spacing.lg,
    borderRadius: 16,
    marginBottom: Spacing['2xl'],
  },
  evidenceTitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  evidenceItem: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    marginBottom: Spacing.xs,
  },
  actions: {
    gap: Spacing.md,
    width: '100%',
  },
});
