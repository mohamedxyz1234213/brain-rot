import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme';
import { SafeScreen, ScreenHeader } from '../../src/components/ui';

const ROAST_HISTORY = [
  {
    id: '1',
    persona: 'David Goggins',
    emoji: '💪',
    text: "You're soft. Real soft. 3 hours on TikTok? That's not recovery, that's surrender. Stay hard.",
    trigger: 'limit_exceeded',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    persona: 'Egyptian Dad',
    emoji: '🇪🇬',
    text: 'يا ابني... ابن خالتك بقى دكتور وانت بتتفرج على تيك توك. أنا فشلت في تربيتك.',
    trigger: 'blocked_attempts',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    persona: 'Future Self',
    emoji: '👻',
    text: "I'm you at 45. Those 4 hours on Instagram today? They cost us the startup, the book, and honestly... the marriage.",
    trigger: 'daily_review',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    persona: 'Sigmund Freud',
    emoji: '🧠',
    text: 'Your compulsive phone checking reveals an unresolved attachment disorder. The dopamine hits from notifications are a poor substitute for genuine human connection.',
    trigger: 'morning_shame',
    createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    persona: 'Drill Sergeant',
    emoji: '🪖',
    text: 'YOU OPENED INSTAGRAM 47 TIMES TODAY! 47! A GOLDFISH HAS MORE SELF-CONTROL THAN YOU, MAGGOT!',
    trigger: 'blocked_attempts',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

export default function RoastHistoryScreen() {
  return (
    <SafeScreen>
      <ScreenHeader title="Roast History" subtitle="Your Hall of Shame 💀" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {ROAST_HISTORY.map((roast) => (
          <View key={roast.id} style={styles.roastCard}>
            <View style={styles.roastHeader}>
              <Text style={styles.roastEmoji}>{roast.emoji}</Text>
              <View style={styles.roastMeta}>
                <Text style={styles.roastPersona}>{roast.persona}</Text>
                <Text style={styles.roastTrigger}>{roast.trigger.replace('_', ' ')}</Text>
              </View>
              <Text style={styles.roastTime}>
                {getTimeAgo(new Date(roast.createdAt))}
              </Text>
            </View>
            <Text style={styles.roastText}>{roast.text}</Text>
            <Pressable style={styles.shareBtn} accessibilityRole="button" accessibilityLabel="Share roast">
              <Text style={styles.shareBtnText}>Share My Shame 💀</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeScreen>
  );
}

function getTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  roastCard: {
    padding: Spacing.lg,
    backgroundColor: Colors.SURFACE,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    borderWidth: 0.5,
    borderColor: `${Colors.DANGER}33`,
  },
  roastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  roastEmoji: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  roastMeta: {
    flex: 1,
  },
  roastPersona: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    fontWeight: Typography.weights.semibold,
  },
  roastTrigger: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  roastTime: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
  },
  roastText: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    lineHeight: Typography.lineHeight.normal,
    marginBottom: Spacing.md,
  },
  shareBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    backgroundColor: `${Colors.DANGER}22`,
    borderRadius: 8,
  },
  shareBtnText: {
    fontSize: Typography.sizes.sm,
    color: Colors.DANGER,
    fontWeight: Typography.weights.semibold,
  },
});
