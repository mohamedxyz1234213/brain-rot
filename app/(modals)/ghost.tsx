import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../../src/constants/theme';

interface GhostComparison {
  category: string;
  you: string;
  ghost: string;
  emoji: string;
}

const COMPARISONS: GhostComparison[] = [
  {
    category: 'Screen Time',
    you: '4h 23m on social media',
    ghost: '0 minutes — used phone only for calls & tasks',
    emoji: '📱',
  },
  {
    category: 'Tasks',
    you: '3/8 completed (2 abandoned)',
    ghost: '8/8 completed by 4pm',
    emoji: '✅',
  },
  {
    category: 'Focus',
    you: '1 interrupted session (12 min)',
    ghost: '3 deep work sessions (2h 45m total)',
    emoji: '🎯',
  },
  {
    category: 'Prayer',
    you: '3/5 (2 missed)',
    ghost: '5/5 on time — started day with Fajr',
    emoji: '🕌',
  },
  {
    category: 'Sleep',
    you: 'Slept at 2:17am after scrolling',
    ghost: 'In bed by 10:30pm, read Quran, slept by 11',
    emoji: '😴',
  },
  {
    category: 'Brain Score',
    you: '42 (Struggling)',
    ghost: '94 (Ascended)',
    emoji: '🧠',
  },
];

export default function GhostScreen() {
  const [currentCard, setCurrentCard] = useState(0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
        <Text style={styles.title}>👻 Ghost of Productivity Past</Text>
        <Text style={styles.subtitle}>What if you had followed through?</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.cards}>
        {COMPARISONS.map((item, index) => (
          <View key={index} style={styles.comparisonCard}>
            <Text style={styles.cardEmoji}>{item.emoji}</Text>
            <Text style={styles.cardCategory}>{item.category}</Text>

            <View style={styles.splitView}>
              <View style={[styles.side, styles.youSide]}>
                <Text style={styles.sideLabel}>You</Text>
                <Text style={styles.youText}>{item.you}</Text>
              </View>
              <View style={styles.divider} />
              <View style={[styles.side, styles.ghostSide]}>
                <Text style={styles.sideLabel}>Ghost You 👻</Text>
                <Text style={styles.ghostText}>{item.ghost}</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.ctaCard}>
          <Text style={styles.ctaEmoji}>💪</Text>
          <Text style={styles.ctaText}>
            The ghost is who you could be. This week, close the gap.
          </Text>
          <Pressable style={styles.ctaBtn} onPress={() => router.back()}>
            <Text style={styles.ctaBtnText}>Challenge Accepted</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 60,
    right: Spacing.xl,
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    color: Colors.TEXT_SECONDARY,
  },
  title: {
    fontSize: Typography.sizes.xl,
    color: Colors.TEXT_PRIMARY,
    fontWeight: '700',
    marginTop: Spacing.lg,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    marginTop: 4,
  },
  cards: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
  },
  comparisonCard: {
    backgroundColor: Colors.SURFACE,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardEmoji: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  cardCategory: {
    fontSize: Typography.sizes.lg,
    color: Colors.TEXT_PRIMARY,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  splitView: {
    flexDirection: 'row',
  },
  side: {
    flex: 1,
    padding: Spacing.sm,
  },
  youSide: {},
  ghostSide: {},
  divider: {
    width: 1,
    backgroundColor: `${Colors.SECONDARY}44`,
    marginHorizontal: Spacing.sm,
  },
  sideLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  youText: {
    fontSize: Typography.sizes.sm,
    color: Colors.DANGER,
    lineHeight: 18,
  },
  ghostText: {
    fontSize: Typography.sizes.sm,
    color: Colors.SUCCESS,
    lineHeight: 18,
  },
  ctaCard: {
    backgroundColor: `${Colors.PRIMARY}11`,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${Colors.PRIMARY}44`,
    marginTop: Spacing.md,
  },
  ctaEmoji: {
    fontSize: 40,
    marginBottom: Spacing.md,
  },
  ctaText: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  ctaBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 16,
  },
  ctaBtnText: {
    color: '#fff',
    fontSize: Typography.sizes.md,
    fontWeight: '600',
  },
});
