import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { useAccountabilityStore } from '../../src/stores/accountabilityStore';

export default function AccountabilityScreen() {
  const {
    circles,
    challenges,
    leaderboard,
    fetchChallenges,
    fetchLeaderboard,
    joinChallenge,
  } = useAccountabilityStore();

  useEffect(() => {
    fetchChallenges();
    fetchLeaderboard();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Accountability</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Circles Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Circles</Text>
            <Pressable style={styles.addBtn}>
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

        {/* Challenges Section */}
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
              >
                <Text style={styles.joinBtnText}>
                  {challenge.isJoined ? 'Joined ✓' : 'Join'}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Leaderboard Section */}
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

        <View style={{ height: 40 }} />
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
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  addBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#fff',
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
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
    fontWeight: '600',
  },
  circleMembers: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginTop: 4,
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
    fontWeight: '600',
  },
  challengeDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginTop: 4,
  },
  challengeMeta: {
    fontSize: Typography.sizes.sm,
    color: Colors.PRIMARY,
    marginTop: 4,
  },
  joinBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 8,
    marginLeft: 12,
  },
  joinBtnJoined: {
    backgroundColor: Colors.SUCCESS,
  },
  joinBtnText: {
    color: '#fff',
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: `${Colors.SECONDARY}33`,
  },
  rank: {
    fontSize: Typography.sizes.lg,
    color: Colors.PRIMARY,
    fontWeight: '700',
    width: 36,
  },
  leaderInfo: {
    flex: 1,
  },
  leaderName: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    fontWeight: '500',
  },
  leaderMeta: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginTop: 2,
  },
  leaderScore: {
    fontSize: Typography.sizes.xl,
    color: Colors.TEXT_PRIMARY,
    fontWeight: '700',
  },
});
