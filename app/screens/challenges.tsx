import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow, Layout } from '../../src/constants/theme';
import { SafeScreen, ScreenHeader } from '../../src/components/ui';
import { PullToRefresh } from '../../src/components/ui/PullToRefresh';
import { AnimatedSvgIllustration } from '../../src/components/ui/AnimatedSvgIllustration';
import { useRefreshAll } from '../../src/hooks/useRefreshAll';
import { useAccountabilityStore, Challenge } from '../../src/stores/accountabilityStore';

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: Colors.SUCCESS,
  medium: Colors.WARNING,
  hard: Colors.DANGER,
  extreme: Colors.DANGER,
  legendary: Colors.PRIMARY_LIGHT,
};

const CHALLENGE_TYPE_LABELS: Record<string, string> = {
  app_block: 'App Block',
  screen_time_reduce: 'Screen Time',
  no_social: 'No Social',
  prayer: 'Prayer',
  focus_hours: 'Focus',
  task_completion: 'Tasks',
  custom: 'Custom',
};

const CHALLENGE_TYPE_ICONS: Record<string, string> = {
  app_block: 'lock-closed',
  screen_time_reduce: 'time',
  no_social: 'logo-instagram',
  prayer: 'moon',
  focus_hours: 'flash',
  task_completion: 'checkbox',
  custom: 'star',
};

function getChallengeSubtitle(challenge: Challenge): string {
  const config = challenge.config ?? {};
  switch (challenge.challengeType) {
    case 'app_block':
      return config.targetAppName ? `Block ${config.targetAppName} completely` : 'Block an app completely';
    case 'screen_time_reduce':
      return config.targetAppName && config.challengeLimitMinutes != null
        ? `Limit ${config.targetAppName} to ${config.challengeLimitMinutes}min/day`
        : 'Reduce app screen time';
    case 'no_social':
      return config.blockedAppIds
        ? `Block ${config.blockedAppIds.length} social apps`
        : 'No social media';
    case 'prayer':
      return config.requiredPrayers
        ? `Pray ${config.requiredPrayers.join(', ')} on time`
        : 'Pray all salah on time';
    case 'focus_hours':
      return config.requiredFocusHours
        ? `${config.requiredFocusHours}h focus per day`
        : 'Daily focus hours';
    case 'task_completion':
      return config.requiredTaskCount
        ? `Complete ${config.requiredTaskCount} tasks`
        : 'Complete daily tasks';
    case 'custom':
      return config.customInstructions || 'Custom challenge';
    default:
      return challenge.description;
  }
}

function getEnforcementText(challenge: Challenge): string {
  const config = challenge.config ?? {};
  switch (challenge.challengeType) {
    case 'app_block':
      return `${config.targetAppName || 'App'} is now blocked`;
    case 'screen_time_reduce':
      return `${config.targetAppName || 'App'} limit set to ${config.challengeLimitMinutes ?? 0}min`;
    case 'no_social':
      return `${config.blockedAppIds?.length ?? 0} social apps blocked`;
    case 'prayer':
      return 'Prayer reminders active';
    case 'focus_hours':
      return 'Focus tracking active';
    case 'task_completion':
      return 'Task tracking active';
    default:
      return 'Challenge active';
  }
}

export default function ChallengesScreen() {
  const { challenges, isLoading, fetchChallenges, joinChallenge } = useAccountabilityStore();
  const refreshAll = useRefreshAll();
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const handleJoin = async (challengeId: string) => {
    setJoiningId(challengeId);
    await joinChallenge(challengeId);
    setJoiningId(null);
  };

  return (
    <SafeScreen>
      <ScreenHeader title="Challenges" subtitle="Push yourself. Compete with others." onBack={() => router.back()} />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
          <Text style={styles.loadingText}>Loading challenges...</Text>
        </View>
      ) : challenges.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AnimatedSvgIllustration illustrationKey="man-using-smartphone" width={140} variant="float" delay={100} />
          <Text style={styles.emptyTitle}>No Challenges Yet</Text>
          <Text style={styles.emptyDesc}>Check back later for new challenges created by the admin.</Text>
        </View>
      ) : (
        <PullToRefresh onRefresh={refreshAll} contentContainerStyle={styles.list}>
          {challenges.map((challenge) => (
            <View key={challenge.id} style={styles.challengeCard}>
              <View style={styles.cardHeader}>
                <View style={styles.typeBadge}>
                  <Ionicons
                    name={(CHALLENGE_TYPE_ICONS[challenge.challengeType] || 'help-circle') as any}
                    size={16}
                    color={Colors.PRIMARY}
                  />
                  <Text style={styles.typeText}>
                    {CHALLENGE_TYPE_LABELS[challenge.challengeType] || challenge.challengeType}
                  </Text>
                </View>
                <View style={styles.headerRow}>
                  <Ionicons
                    name={(challenge.icon || 'help-circle') as React.ComponentProps<typeof Ionicons>['name']}
                    size={34}
                    color={Colors.PRIMARY}
                    style={styles.cardIcon}
                  />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{challenge.title}</Text>
                    <Text style={styles.cardDesc}>{getChallengeSubtitle(challenge)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Duration</Text>
                  <Text style={styles.metaValue}>{challenge.durationDays}d</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Participants</Text>
                  <Text style={styles.metaValue}>{(challenge.participantCount ?? 0).toLocaleString()}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>XP</Text>
                  <Text style={[styles.metaValue, { color: Colors.PRIMARY }]}>{challenge.rewardXp}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Difficulty</Text>
                  <Text
                    style={[
                      styles.metaValue,
                      { color: DIFFICULTY_COLORS[challenge.difficulty] || Colors.TEXT_PRIMARY },
                    ]}
                  >
                    {(challenge.difficulty ?? 'medium').charAt(0).toUpperCase() + (challenge.difficulty ?? 'medium').slice(1)}
                  </Text>
                </View>
              </View>

              <Pressable
                style={[
                  styles.joinBtn,
                  challenge.isJoined && styles.joinBtnJoined,
                  joiningId === challenge.id && styles.joinBtnLoading,
                ]}
                onPress={() => !challenge.isJoined && handleJoin(challenge.id)}
                disabled={challenge.isJoined || joiningId === challenge.id}
                accessibilityRole="button"
                accessibilityLabel={challenge.isJoined ? 'Already joined' : 'Join challenge'}
              >
                {joiningId === challenge.id ? (
                  <ActivityIndicator size="small" color={Colors.TEXT_ON_PRIMARY} />
                ) : (
                  <>
                    {challenge.isJoined && (
                      <Ionicons name="checkmark-circle-outline" size={18} color={Colors.TEXT_ON_PRIMARY} style={styles.joinIcon} />
                    )}
                    <Text style={styles.joinBtnText}>
                      {challenge.isJoined ? 'Joined' : 'Join Challenge'}
                    </Text>
                  </>
                )}
              </Pressable>

              {challenge.isJoined && (
                <View style={styles.enforcementBanner}>
                  <Ionicons name="shield-checkmark" size={14} color={Colors.SUCCESS} />
                  <Text style={styles.enforcementText}>
                    {getEnforcementText(challenge)}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </PullToRefresh>
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.TEXT_PRIMARY,
    fontWeight: Typography.weights.semibold,
    marginTop: Spacing.lg,
  },
  emptyDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
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
    marginBottom: Spacing.md,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.PRIMARY}15`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  typeText: {
    fontSize: Typography.sizes.xs,
    color: Colors.PRIMARY,
    fontWeight: Typography.weights.semibold,
    marginLeft: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerRow: {
    flexDirection: 'row',
  },
  cardIcon: {
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
    flexDirection: 'row',
    ...Shadow.sm,
  },
  joinBtnJoined: {
    backgroundColor: Colors.SUCCESS,
  },
  joinBtnLoading: {
    opacity: 0.7,
  },
  joinIcon: {
    marginRight: Spacing.xs,
  },
  joinBtnText: {
    color: Colors.TEXT_ON_PRIMARY,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
  enforcementBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: Layout.hairline,
    borderTopColor: Colors.BORDER_LIGHT,
  },
  enforcementText: {
    fontSize: Typography.sizes.xs,
    color: Colors.SUCCESS,
    marginLeft: Spacing.xs,
    fontWeight: Typography.weights.medium,
  },
});
