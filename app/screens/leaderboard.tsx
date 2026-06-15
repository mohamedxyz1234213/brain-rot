import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme';
import { SafeScreen, ScreenHeader } from '../../src/components/ui';

const TABS = ['Score', 'Streak', 'XP', 'Focus'] as const;

const LEADERBOARD_DATA = [
  { rank: 1, name: 'Ahmed M.', score: 97, streak: 67, xp: 28400, focus: 142, avatar: '🧘' },
  { rank: 2, name: 'Sarah K.', score: 94, streak: 45, xp: 22100, focus: 118, avatar: '⚡' },
  { rank: 3, name: 'Omar A.', score: 91, streak: 38, xp: 19800, focus: 104, avatar: '🌱' },
  { rank: 4, name: 'Fatima N.', score: 88, streak: 32, xp: 17500, focus: 96, avatar: '💪' },
  { rank: 5, name: 'Youssef H.', score: 85, streak: 28, xp: 15200, focus: 82, avatar: '🔥' },
  { rank: 6, name: 'Layla A.', score: 82, streak: 24, xp: 13800, focus: 74, avatar: '✨' },
  { rank: 7, name: 'Hassan M.', score: 79, streak: 21, xp: 11900, focus: 68, avatar: '🎯' },
  { rank: 8, name: 'Nour S.', score: 76, streak: 18, xp: 10400, focus: 61, avatar: '📈' },
  { rank: 9, name: 'Karim E.', score: 73, streak: 15, xp: 8900, focus: 55, avatar: '🌟' },
  { rank: 10, name: 'Amira T.', score: 70, streak: 12, xp: 7200, focus: 48, avatar: '💫' },
];

export default function LeaderboardScreen() {
  const [activeTab, setActiveTab] = React.useState<typeof TABS[number]>('Score');

  const getSortedData = () => {
    return [...LEADERBOARD_DATA].sort((a, b) => {
      switch (activeTab) {
        case 'Score': return b.score - a.score;
        case 'Streak': return b.streak - a.streak;
        case 'XP': return b.xp - a.xp;
        case 'Focus': return b.focus - a.focus;
      }
    }).map((item, index) => ({ ...item, rank: index + 1 }));
  };

  const getValue = (item: typeof LEADERBOARD_DATA[0]) => {
    switch (activeTab) {
      case 'Score': return `${item.score}`;
      case 'Streak': return `${item.streak}d 🔥`;
      case 'XP': return `${item.xp.toLocaleString()}`;
      case 'Focus': return `${item.focus}h`;
    }
  };

  return (
    <SafeScreen>
      <ScreenHeader title="🏅 Global Leaderboard" onBack={() => router.back()} />

      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            accessibilityRole="button"
            accessibilityLabel={`${tab} tab`}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing['3xl'] }}>
        <View style={styles.podium}>
          {getSortedData().slice(0, 3).map((entry, index) => (
            <View
              key={entry.name}
              style={[
                styles.podiumItem,
                index === 0 && styles.podiumFirst,
              ]}
            >
              <Text style={styles.podiumAvatar}>{entry.avatar}</Text>
              <Text style={styles.podiumRank}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
              </Text>
              <Text style={styles.podiumName}>{entry.name.split(' ')[0]}</Text>
              <Text style={styles.podiumValue}>{getValue(entry)}</Text>
            </View>
          ))}
        </View>

        {getSortedData().slice(3).map((entry) => (
          <View key={entry.name} style={styles.listRow}>
            <Text style={styles.listRank}>#{entry.rank}</Text>
            <Text style={styles.listAvatar}>{entry.avatar}</Text>
            <View style={styles.listInfo}>
              <Text style={styles.listName}>{entry.name}</Text>
            </View>
            <Text style={styles.listValue}>{getValue(entry)}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.md,
    backgroundColor: Colors.SURFACE,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.PRIMARY,
  },
  tabText: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    fontWeight: Typography.weights.medium,
  },
  tabTextActive: {
    color: Colors.TEXT_ON_PRIMARY,
    fontWeight: Typography.weights.semibold,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  podiumItem: {
    alignItems: 'center',
    backgroundColor: Colors.SURFACE,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    width: 100,
  },
  podiumFirst: {
    paddingVertical: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },
  podiumAvatar: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  podiumRank: {
    fontSize: 20,
    marginBottom: Spacing.xs,
  },
  podiumName: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_PRIMARY,
    fontWeight: Typography.weights.semibold,
  },
  podiumValue: {
    fontSize: Typography.sizes.sm,
    color: Colors.PRIMARY,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.xs,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 0.5,
    borderBottomColor: `${Colors.BORDER}22`,
  },
  listRank: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    fontWeight: Typography.weights.semibold,
    width: 36,
  },
  listAvatar: {
    fontSize: 22,
    marginRight: Spacing.md,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    fontWeight: Typography.weights.medium,
  },
  listValue: {
    fontSize: Typography.sizes.md,
    color: Colors.PRIMARY,
    fontWeight: Typography.weights.bold,
  },
});
