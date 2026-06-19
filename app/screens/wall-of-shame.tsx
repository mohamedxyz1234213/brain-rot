import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme';
import { SafeScreen, ScreenHeader } from '../../src/components/ui';

const WALL_OF_SHAME = [
  { rank: 1, name: 'Anonymous', score: 8, icon: 'skull-outline', reaction: 'Laugh 143' },
  { rank: 2, name: 'ScreenZombie', score: 12, icon: 'sad-outline', reaction: 'Skull 98' },
  { rank: 3, name: 'Anonymous', score: 15, icon: 'phone-portrait-outline', reaction: 'Salute 76' },
  { rank: 4, name: 'TikTokAddict', score: 18, icon: 'alert-circle-outline', reaction: 'Prayer 54' },
  { rank: 5, name: 'Anonymous', score: 22, icon: 'remove-circle-outline', reaction: 'Laugh 41' },
  { rank: 6, name: 'DoomScroller', score: 23, icon: 'ban-outline', reaction: 'Skull 39' },
  { rank: 7, name: 'Anonymous', score: 25, icon: 'warning-outline', reaction: 'Salute 28' },
  { rank: 8, name: 'ReelsReaper', score: 27, icon: 'skull-outline', reaction: 'Laugh 22' },
  { rank: 9, name: 'Anonymous', score: 28, icon: 'eye-off-outline', reaction: 'Prayer 19' },
  { rank: 10, name: 'InstaGhost', score: 30, icon: 'person-outline', reaction: 'Skull 15' },
];

export default function WallOfShameScreen() {
  return (
    <SafeScreen>
      <ScreenHeader title="Wall of Shame" subtitle="The most brain-rotted among us" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Opt-in only. Names can be anonymized. We're all here to grow.
          </Text>
        </View>

        {WALL_OF_SHAME.map((entry) => (
          <View key={entry.rank} style={styles.shameCard}>
            <Text style={styles.rank}>#{entry.rank}</Text>
            <Ionicons name={entry.icon as React.ComponentProps<typeof Ionicons>['name']} size={28} color={Colors.DANGER} style={styles.entryIcon} />
            <View style={styles.info}>
              <Text style={styles.name}>{entry.name}</Text>
              <Text style={styles.score}>Brain Score: {entry.score}/100</Text>
            </View>
            <View style={styles.reactionBadge}>
              <Text style={styles.reactionText}>{entry.reaction}</Text>
            </View>
          </View>
        ))}

        <Pressable style={styles.optInBtn} accessibilityRole="button" accessibilityLabel="Add me to wall">
          <Text style={styles.optInBtnText}>Add Me to the Wall</Text>
        </Pressable>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  disclaimer: {
    padding: Spacing.md,
    backgroundColor: `${Colors.WARNING}11`,
    borderRadius: Radius.md,
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
    fontWeight: Typography.weights.bold,
    width: 36,
  },
  entryIcon: {
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    fontWeight: Typography.weights.medium,
  },
  score: {
    fontSize: Typography.sizes.sm,
    color: Colors.DANGER,
    marginTop: 2,
  },
  reactionBadge: {
    paddingHorizontal: 10,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.SURFACE_RAISED,
    borderRadius: 12,
  },
  reactionText: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
  },
  optInBtn: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: `${Colors.DANGER}22`,
    borderRadius: Radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.DANGER,
  },
  optInBtnText: {
    color: Colors.DANGER,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
  },
});
