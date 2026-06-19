import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Sizing } from '../../src/constants/theme';
import { SafeScreen, ScreenHeader } from '../../src/components/ui';
import { useAccountabilityStore } from '../../src/stores/accountabilityStore';

export default function AccountabilityScreen() {
  const {
    circles,
    challenges,
    leaderboard,
    joinChallenge,
  } = useAccountabilityStore();

  return (
    <SafeScreen>
      <ScreenHeader title="Accountability" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing['3xl'] }}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Circles</Text>
            <Pressable style={styles.addBtn} accessibilityRole="button" accessibilityLabel="Create circle">
              <Text style={styles.addBtnText}>+ Create</Text>
            </Pressable>
          </View>

          {circles.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>👥</Text>
              <Text style={styles.emptyText}>
                Create or join a circle to share your progress with friends.
              </Text>
            </View>
          ) : (
            circles.map((circle) => (
              <View key={circle.id} style={styles.circleCard}>
                <Text style={styles.circleName}>{circle.name}</Text>
                <Text style={styles.circleMembers}>
                  {circle.memberIds.length}/{circle.maxMembers} members
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Challenges</Text>
          {challenges.map((challenge) => (
            <View key={challenge.id} style={styles.challengeCard}>
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeTitle}>{challenge.title}</Text>
                <Text style={styles.challengeDesc}>{challenge.description}</Text>
                <Text style={styles.challengeMeta}>
                  {challenge.durationDays} days • {challenge.participantCount} participants
                </Text>
              </View>
              <Pressable
                style={[
                  styles.joinBtn,
                  challenge.isJoined && styles.joinBtnJoined,
                ]}
                onPress={() => joinChallenge(challenge.id)}
                accessibilityRole="button"
                accessibilityLabel={challenge.isJoined ? 'Already joined' : 'Join challenge'}
              >
                {challenge.isJoined && (
                  <Ionicons name="checkmark" size={Sizing.iconSm} color={Colors.TEXT_ON_PRIMARY} style={styles.joinBtnIcon} />
                )}
                <Text style={styles.joinBtnText}>
                  {challenge.isJoined ? 'Joined' : 'Join'}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Leaderboard</Text>
          {leaderboard.map((entry) => (
            <View key={entry.userId} style={styles.leaderRow}>
              <Text style={styles.rank}>#{entry.rank}</Text>
              <View style={styles.leaderInfo}>
                <Text style={styles.leaderName}>{entry.name}</Text>
                <Text style={styles.leaderMeta}>
                  🔥 {entry.streak} days • Score: {entry.score}
                </Text>
              </View>
              <Text style={styles.leaderScore}>{entry.score}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.TEXT_PRIMARY,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.md,
  },
  addBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 8,
  },
  addBtnText: {
    color: Colors.TEXT_ON_PRIMARY,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  emptyCard: {
    padding: Spacing.xl,
    backgroundColor: Colors.SURFACE,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
  },
  circleCard: {
    padding: Spacing.lg,
    backgroundColor: Colors.SURFACE,
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  circleName: {
    fontSize: Typography.sizes.lg,
    color: Colors.TEXT_PRIMARY,
    fontWeight: Typography.weights.semibold,
  },
  circleMembers: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginTop: Spacing.xs,
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.SURFACE,
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    fontWeight: Typography.weights.semibold,
  },
  challengeDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginTop: Spacing.xs,
  },
  challengeMeta: {
    fontSize: Typography.sizes.sm,
    color: Colors.PRIMARY,
    marginTop: Spacing.xs,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 8,
    marginLeft: Spacing.md,
  },
  joinBtnIcon: {
    marginRight: Spacing.xs,
  },
  joinBtnJoined: {
    backgroundColor: Colors.SUCCESS,
  },
  joinBtnText: {
    color: Colors.TEXT_ON_PRIMARY,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.BORDER,
  },
  rank: {
    fontSize: Typography.sizes.lg,
    color: Colors.PRIMARY,
    fontWeight: Typography.weights.bold,
    width: 36,
  },
  leaderInfo: {
    flex: 1,
  },
  leaderName: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    fontWeight: Typography.weights.medium,
  },
  leaderMeta: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginTop: 2,
  },
  leaderScore: {
    fontSize: Typography.sizes.xl,
    color: Colors.TEXT_PRIMARY,
    fontWeight: Typography.weights.bold,
  },
});
