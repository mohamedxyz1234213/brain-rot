import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../../src/constants/theme';

export default function VillainArcScreen() {
  const [daysLeft, setDaysLeft] = useState(3);
  const [isActive, setIsActive] = useState(true);

  return (
    <View style={styles.container}>
      <Pressable style={styles.closeBtn} onPress={() => router.back()}>
        <Text style={styles.closeText}>✕</Text>
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.emoji}>😈</Text>
        <Text style={styles.title}>VILLAIN ARC MODE</Text>
        <Text style={styles.subtitle}>3 days of chaos. Then redemption.</Text>

        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Status</Text>
            <Text style={styles.statValueEvil}>ACTIVE</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Days Remaining</Text>
            <Text style={styles.statValue}>{daysLeft}/3</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Leaderboard Position</Text>
            <Text style={styles.statValueEvil}>#1 (Worst Score)</Text>
          </View>
        </View>

        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>Villain Arc Rules:</Text>
          <Text style={styles.rule}>• Worst score = leaderboard top (ironic)</Text>
          <Text style={styles.rule}>• Menacing avatar unlocked</Text>
          <Text style={styles.rule}>• Respectful roasts only</Text>
          <Text style={styles.rule}>• Auto-ends after 3 days</Text>
          <Text style={styles.rule}>• "Unhinged. Committed. Villainous."</Text>
        </View>

        <View style={styles.quoteCard}>
          <Text style={styles.quote}>
            "Every villain is the hero of their own story. But this story ends in 3 days."
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.endBtn} onPress={() => router.back()}>
          <Text style={styles.endBtnText}>End Villain Arc Early</Text>
        </Pressable>
        <Text style={styles.footerNote}>
          Auto-ends with: "Villain arc over. Time to be the main character."
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  closeBtn: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    color: Colors.TEXT_SECONDARY,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes['2xl'],
    color: Colors.DANGER,
    fontWeight: '800',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statsCard: {
    width: '100%',
    backgroundColor: Colors.SURFACE,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: `${Colors.DANGER}44`,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  statLabel: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
  },
  statValue: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    fontWeight: '600',
  },
  statValueEvil: {
    fontSize: Typography.sizes.md,
    color: Colors.DANGER,
    fontWeight: '700',
  },
  rulesCard: {
    width: '100%',
    backgroundColor: `${Colors.DANGER}11`,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  rulesTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  rule: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 22,
  },
  quoteCard: {
    paddingHorizontal: Spacing.lg,
  },
  quote: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    padding: Spacing.xl,
    paddingBottom: 48,
    alignItems: 'center',
  },
  endBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: `${Colors.DANGER}22`,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.DANGER,
  },
  endBtnText: {
    color: Colors.DANGER,
    fontSize: Typography.sizes.md,
    fontWeight: '600',
  },
  footerNote: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});
