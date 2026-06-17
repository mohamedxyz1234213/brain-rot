import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow, Layout } from '../../src/constants/theme';
import { SafeScreen, ScreenHeader } from '../../src/components/ui';

const EXTREME_COLOR = Colors.DANGER;
const LEGENDARY_COLOR = Colors.PRIMARY_LIGHT;

const CHALLENGES = [
  {
    id: '1',
    title: 'No TikTok Week',
    emoji: '🎵',
    description: 'Survive 7 days without TikTok.',
    duration: '7 days',
    participants: 2341,
    difficulty: 'Medium',
  },
  {
    id: '2',
    title: '30-Day Brain Detox',
    emoji: '🧠',
    description: 'Full month. Max 1 hour social media per day.',
    duration: '30 days',
    participants: 891,
    difficulty: 'Hard',
  },
  {
    id: '3',
    title: 'Ramadan Focus',
    emoji: '🌙',
    description: 'Zero social media between Fajr and Maghrib.',
    duration: '30 days',
    participants: 1567,
    difficulty: 'Hard',
  },
  {
    id: '4',
    title: 'Exam Mode',
    emoji: '📚',
    description: '14 days. Only productivity apps allowed.',
    duration: '14 days',
    participants: 3214,
    difficulty: 'Extreme',
  },
  {
    id: '5',
    title: 'Digital Minimalist',
    emoji: '🪷',
    description: '90 days. Rebuild your relationship with technology.',
    duration: '90 days',
    participants: 445,
    difficulty: 'Legendary',
  },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  Medium: Colors.WARNING,
  Hard: Colors.DANGER,
  Extreme: EXTREME_COLOR,
  Legendary: LEGENDARY_COLOR,
};

export default function ChallengesScreen() {
  return (
    <SafeScreen>
      <ScreenHeader title="🏆 Challenges" subtitle="Push yourself. Compete with others." onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {CHALLENGES.map((challenge) => (
          <View key={challenge.id} style={styles.challengeCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>{challenge.emoji}</Text>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{challenge.title}</Text>
                <Text style={styles.cardDesc}>{challenge.description}</Text>
              </View>
            </View>

            <View style={styles.cardMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Duration</Text>
                <Text style={styles.metaValue}>{challenge.duration}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Participants</Text>
                <Text style={styles.metaValue}>{challenge.participants.toLocaleString()}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Difficulty</Text>
                <Text
                  style={[
                    styles.metaValue,
                    { color: DIFFICULTY_COLORS[challenge.difficulty] || Colors.TEXT_PRIMARY },
                  ]}
                >
                  {challenge.difficulty}
                </Text>
              </View>
            </View>

            <Pressable style={styles.joinBtn} accessibilityRole="button" accessibilityLabel="Join challenge">
              <Text style={styles.joinBtnText}>Join Challenge</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  challengeCard: {
    backgroundColor: Colors.SURFACE,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: Layout.hairline,
    borderColor: Colors.BORDER,
    ...Shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  cardEmoji: {
    fontSize: 36,
    marginRight: Spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.TEXT_PRIMARY,
    fontWeight: Typography.weights.semibold,
  },
  cardDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginTop: Spacing.xs,
    lineHeight: Typography.lineHeight.tight,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderTopWidth: Layout.hairline,
    borderTopColor: Colors.BORDER_LIGHT,
    marginBottom: Spacing.md,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.TEXT_SECONDARY,
    marginBottom: Spacing.xs,
  },
  metaValue: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_PRIMARY,
    fontWeight: Typography.weights.semibold,
  },
  joinBtn: {
    paddingVertical: Spacing.md,
    backgroundColor: Colors.PRIMARY,
    borderRadius: Radius.lg,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
    ...Shadow.sm,
  },
  joinBtnText: {
    color: Colors.TEXT_ON_PRIMARY,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
});
