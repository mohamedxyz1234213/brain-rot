import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Sizing } from '../../src/constants/theme';
import { SafeScreen } from '../../src/components/ui';

export default function VillainArcScreen() {
  const [daysLeft, setDaysLeft] = useState(3);
  const [isActive, setIsActive] = useState(true);

  return (
    <SafeScreen>
      <View style={{ flex: 1 }}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close">
          <Ionicons name="close" size={Sizing.iconLg} color={Colors.TEXT_SECONDARY} />
        </Pressable>

        <View style={styles.content}>
          <Ionicons name="flame-outline" size={Sizing.avatarMd} color={Colors.DANGER} style={styles.modeIcon} />
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
          <Pressable style={styles.endBtn} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="End villain arc early">
            <Text style={styles.endBtnText}>End Villain Arc Early</Text>
          </Pressable>
          <Text style={styles.footerNote}>
            Auto-ends with: "Villain arc over. Time to be the main character."
          </Text>
        </View>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  closeBtn: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.xl,
    zIndex: 10,
    padding: Spacing.sm,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  modeIcon: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes['2xl'],
    color: Colors.DANGER,
    fontWeight: Typography.weights.extrabold,
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
    borderRadius: Radius.lg,
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
    fontWeight: Typography.weights.semibold,
  },
  statValueEvil: {
    fontSize: Typography.sizes.md,
    color: Colors.DANGER,
    fontWeight: Typography.weights.bold,
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
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
  },
  rule: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    lineHeight: Typography.lineHeight.normal,
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
    paddingBottom: Spacing['3xl'],
    alignItems: 'center',
  },
  endBtn: {
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: 14,
    backgroundColor: `${Colors.DANGER}22`,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.DANGER,
  },
  endBtnText: {
    color: Colors.DANGER,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
  footerNote: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});
