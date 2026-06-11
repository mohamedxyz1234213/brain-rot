import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../../src/constants/theme';

const WALL_OF_SHAME = [
  { rank: 1, name: 'Anonymous', score: 8, emoji: '💀', reaction: '😂 143' },
  { rank: 2, name: 'ScreenZombie', score: 12, emoji: '🧟', reaction: '💀 98' },
  { rank: 3, name: 'Anonymous', score: 15, emoji: '📱', reaction: '🫡 76' },
  { rank: 4, name: 'TikTokAddict', score: 18, emoji: '😵', reaction: '🙏 54' },
  { rank: 5, name: 'Anonymous', score: 22, emoji: '🫠', reaction: '😂 41' },
  { rank: 6, name: 'DoomScroller', score: 23, emoji: '📵', reaction: '💀 39' },
  { rank: 7, name: 'Anonymous', score: 25, emoji: '🥴', reaction: '🫡 28' },
  { rank: 8, name: 'ReelsReaper', score: 27, emoji: '☠️', reaction: '😂 22' },
  { rank: 9, name: 'Anonymous', score: 28, emoji: '🫣', reaction: '🙏 19' },
  { rank: 10, name: 'InstaGhost', score: 30, emoji: '👻', reaction: '💀 15' },
];

export default function WallOfShameScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Wall of Shame 💀</Text>
        <Text style={styles.subtitle}>The most brain-rotted among us</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            🔒 Opt-in only. Names can be anonymized. We're all here to grow.
          </Text>
        </View>

        {WALL_OF_SHAME.map((entry) => (
          <View key={entry.rank} style={styles.shameCard}>
            <Text style={styles.rank}>#{entry.rank}</Text>
            <Text style={styles.emoji}>{entry.emoji}</Text>
            <View style={styles.info}>
              <Text style={styles.name}>{entry.name}</Text>
              <Text style={styles.score}>Brain Score: {entry.score}/100</Text>
            </View>
            <View style={styles.reactionBadge}>
              <Text style={styles.reactionText}>{entry.reaction}</Text>
            </View>
          </View>
        ))}

        <Pressable style={styles.optInBtn}>
          <Text style={styles.optInBtnText}>Add Me to the Wall 🫡</Text>
        </Pressable>
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
  },
  backBtn: {
    fontSize: Typography.sizes.md,
    color: Colors.PRIMARY,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes['2xl'],
    color: Colors.TEXT_PRIMARY,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    marginTop: 4,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
  },
  disclaimer: {
    padding: Spacing.md,
    backgroundColor: `${Colors.WARNING}11`,
    borderRadius: 10,
    marginBottom: Spacing.lg,
  },
  disclaimerText: {
    fontSize: Typography.sizes.sm,
    color: Colors.WARNING,
    textAlign: 'center',
  },
  shameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.SURFACE,
    borderRadius: 12,
    marginBottom: Spacing.sm,
    borderWidth: 0.5,
    borderColor: `${Colors.DANGER}22`,
  },
  rank: {
    fontSize: Typography.sizes.lg,
    color: Colors.DANGER,
    fontWeight: '700',
    width: 36,
  },
  emoji: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    fontWeight: '500',
  },
  score: {
    fontSize: Typography.sizes.sm,
    color: Colors.DANGER,
    marginTop: 2,
  },
  reactionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: `${Colors.SECONDARY}22`,
    borderRadius: 12,
  },
  reactionText: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
  },
  optInBtn: {
    marginTop: Spacing.xl,
    paddingVertical: 16,
    backgroundColor: `${Colors.DANGER}22`,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.DANGER,
  },
  optInBtnText: {
    color: Colors.DANGER,
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
  },
});
