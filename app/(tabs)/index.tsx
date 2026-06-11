import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { Card } from '../../src/components/ui/Card';
import { ProgressBar } from '../../src/components/ui/ProgressBar';

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Assalamu Alaikum 👋</Text>
            <Text style={styles.subtitle}>Let's heal your brain today</Text>
          </View>
          <View style={styles.syncDot} />
        </View>

        {/* Brain Score Ring */}
        <Card style={styles.scoreCard}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreValue}>72</Text>
            <Text style={styles.scoreLabel}>Brain Score</Text>
            <Text style={styles.levelLabel}>Recovering</Text>
          </View>
        </Card>

        {/* Today's Stats */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow}>
          <StatCard label="Screen Time" value="2h 15m" limit="3h" progress={75} />
          <StatCard label="Tasks" value="4/7" progress={57} />
          <StatCard label="Focus" value="45 min" progress={60} />
          <StatCard label="Prayers" value="3/5" progress={60} />
          <StatCard label="Streak" value="5 🔥" progress={100} />
        </ScrollView>

        {/* Eat the Frog */}
        <Card style={styles.frogCard}>
          <Text style={styles.frogEmoji}>🐸</Text>
          <Text style={styles.frogTitle}>Eat the Frog</Text>
          <Text style={styles.frogTask}>Complete project proposal</Text>
          <Text style={styles.frogCta}>Complete to unlock apps →</Text>
        </Card>

        {/* Active App Limits */}
        <Text style={styles.sectionTitle}>App Limits</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <AppLimitCard app="TikTok" used={25} limit={30} />
          <AppLimitCard app="Instagram" used={15} limit={20} />
          <AppLimitCard app="YouTube" used={10} limit={45} />
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, limit, progress }: { label: string; value: string; limit?: string; progress: number }) {
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      {limit && <Text style={styles.statLimit}>/ {limit}</Text>}
      <Text style={styles.statLabel}>{label}</Text>
      <ProgressBar progress={progress} height={4} />
    </Card>
  );
}

function AppLimitCard({ app, used, limit }: { app: string; used: number; limit: number }) {
  const progress = (used / limit) * 100;
  const color = progress > 90 ? Colors.DANGER : progress > 70 ? Colors.WARNING : Colors.PRIMARY;

  return (
    <Card style={styles.appLimitCard}>
      <Text style={styles.appName}>{app}</Text>
      <Text style={styles.appTime}>{used}m / {limit}m</Text>
      <ProgressBar progress={progress} color={color} height={4} />
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  greeting: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    marginTop: Spacing.xs,
  },
  syncDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.SUCCESS,
  },
  scoreCard: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: Typography.sizes['4xl'],
    fontWeight: '800',
    color: Colors.PRIMARY,
  },
  scoreLabel: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    marginTop: Spacing.xs,
  },
  levelLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.PRIMARY_LIGHT,
    marginTop: Spacing.xs,
  },
  statsRow: {
    marginBottom: Spacing.xl,
  },
  statCard: {
    width: 120,
    marginRight: Spacing.sm,
    padding: Spacing.md,
  },
  statValue: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
  },
  statLimit: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginBottom: Spacing.md,
  },
  frogCard: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderColor: Colors.PRIMARY,
    borderWidth: 1,
  },
  frogEmoji: {
    fontSize: 32,
  },
  frogTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginTop: Spacing.sm,
  },
  frogTask: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    marginTop: Spacing.xs,
  },
  frogCta: {
    fontSize: Typography.sizes.sm,
    color: Colors.PRIMARY,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  appLimitCard: {
    width: 140,
    marginRight: Spacing.sm,
    padding: Spacing.md,
  },
  appName: {
    fontSize: Typography.sizes.md,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  appTime: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginVertical: Spacing.xs,
  },
});

