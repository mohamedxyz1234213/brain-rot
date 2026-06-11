import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';

export default function AppBlockedModal() {
  return (
    <View style={styles.container}>
      {/* Roast */}
      <Text style={styles.roastText}>
        "You've opened this app 5 times today. A golden retriever has more self control."
      </Text>

      {/* App info */}
      <Text style={styles.appName}>TikTok is blocked</Text>
      <Text style={styles.reason}>Daily limit of 30 minutes reached</Text>

      {/* Unlock Options */}
      <View style={styles.options}>
        <Card style={styles.optionCard}>
          <Text style={styles.optionEmoji}>✅</Text>
          <Text style={styles.optionTitle}>Task Unlock</Text>
          <Text style={styles.optionDesc}>Complete a task → 15 min access</Text>
          <Button title="View Tasks" onPress={() => router.replace('/(tabs)/tasks')} size="sm" />
        </Card>

        <Card style={styles.optionCard}>
          <Text style={styles.optionEmoji}>🎰</Text>
          <Text style={styles.optionTitle}>Slot Machine</Text>
          <Text style={styles.optionDesc}>Spin for a chance to unlock</Text>
          <Button title="Spin" onPress={() => router.push('/(modals)/slot-machine')} size="sm" />
        </Card>

        <Card style={styles.optionCard}>
          <Text style={styles.optionEmoji}>⏰</Text>
          <Text style={styles.optionTitle}>Timer Wait</Text>
          <Text style={styles.optionDesc}>Wait 10 minutes, then try again</Text>
          <Button title="Start Timer" onPress={() => {}} size="sm" variant="secondary" />
        </Card>

        <Card style={styles.optionCard}>
          <Text style={styles.optionEmoji}>🔒</Text>
          <Text style={styles.optionTitle}>Hard Block</Text>
          <Text style={styles.optionDesc}>Blocked until tomorrow</Text>
          <Button title="Accept" onPress={() => router.back()} size="sm" variant="danger" />
        </Card>
      </View>

      {/* Soft exit */}
      <Button
        title="I accept my weakness"
        onPress={() => router.back()}
        variant="ghost"
        style={styles.softExit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  roastText: {
    fontSize: Typography.sizes.lg,
    color: Colors.WARNING,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: Spacing.xl,
  },
  appName: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: '700',
    color: Colors.DANGER,
    textAlign: 'center',
  },
  reason: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  options: {
    gap: Spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
  },
  optionEmoji: {
    fontSize: 24,
  },
  optionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    flex: 1,
  },
  optionDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    flex: 2,
  },
  softExit: {
    marginTop: Spacing.xl,
  },
});
