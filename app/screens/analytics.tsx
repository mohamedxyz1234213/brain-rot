import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow, Layout, LetterSpacing } from '../../src/constants/theme';
import { SafeScreen, ScreenHeader } from '../../src/components/ui';
import { useBrainScoreStore } from '../../src/stores/brainScoreStore';
import { useScreenTimeStore } from '../../src/stores/screenTimeStore';
import { PullToRefresh } from '../../src/components/ui/PullToRefresh';
import { useRefreshAll } from '../../src/hooks/useRefreshAll';
import { useSettingsStore } from '../../src/stores/settingsStore';

export default function AnalyticsScreen() {
  const scores = useBrainScoreStore((s) => s.scores);
  const totalMinutes = useScreenTimeStore((s) => s.totalMinutesToday);
  const refreshAll = useRefreshAll();
  const hourlyRate = useSettingsStore((s) => s.hourlyRate);

  const hasHistory = scores.length > 0;
  const brainScoreData = hasHistory
    ? [...scores].reverse().map((e) => e.score)
    : [];

  const monthlyCost = ((totalMinutes * 30) / 60) * hourlyRate;

  return (
    <SafeScreen>
      <ScreenHeader title="Analytics" subtitle="Your recovery journey in numbers" onBack={() => router.back()} />
      <PullToRefresh onRefresh={refreshAll} contentContainerStyle={{ paddingBottom: Spacing['3xl'] }}>
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Brain Score</Text>
          {hasHistory ? (
            <>
              <View style={styles.lineChart}>
                {brainScoreData.map((score, i) => (
                  <View
                    key={i}
                    style={[
                      styles.lineBar,
                      {
                        height: (score / 100) * 100,
                        backgroundColor:
                          score >= 80 ? Colors.SUCCESS : score >= 50 ? Colors.PRIMARY : Colors.WARNING,
                      },
                    ]}
                  />
                ))}
              </View>
              <View style={styles.chartLabels}>
                <Text style={styles.chartLabel}>{brainScoreData.length} days ago</Text>
                <Text style={styles.chartLabel}>Today</Text>
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>No brain score data yet — start using the app to see your trend</Text>
          )}
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Screen Time Today</Text>
          <Text style={styles.bigStat}>
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </Text>
        </View>

        <View style={styles.costCard}>
          <Text style={styles.costTitle}>Usage Cost Calculator</Text>
          <Text style={styles.costDesc}>
            At ${hourlyRate}/hour, you spent the equivalent of:
          </Text>
          <Text style={styles.costAmount}>${monthlyCost.toFixed(2)}</Text>
          <Text style={styles.costSubtext}>projected over a month at today's pace</Text>
        </View>
      </PullToRefresh>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  chartCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.SURFACE,
    borderRadius: Radius.xl,
    borderWidth: Layout.hairline,
    borderColor: Colors.BORDER,
    ...Shadow.sm,
  },
  chartTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    fontWeight: Typography.weights.semibold,
    letterSpacing: LetterSpacing.tight,
    marginBottom: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  bigStat: {
    fontSize: Typography.sizes['3xl'],
    color: Colors.TEXT_PRIMARY,
    fontWeight: Typography.weights.extrabold,
    marginBottom: Spacing.xs,
  },
  lineChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    gap: Spacing.xs,
  },
  lineBar: {
    flex: 1,
    borderRadius: Radius.full,
    minHeight: 4,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  chartLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
  },
  costCard: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.xl,
    backgroundColor: `${Colors.DANGER}11`,
    borderRadius: Radius.xl,
    borderWidth: Layout.hairline,
    borderColor: `${Colors.DANGER}33`,
    alignItems: 'center',
    ...Shadow.sm,
  },
  costTitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.TEXT_PRIMARY,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
  },
  costDesc: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    marginBottom: Spacing.md,
  },
  costAmount: {
    fontSize: Typography.sizes['4xl'],
    color: Colors.DANGER,
    fontWeight: Typography.weights.extrabold,
  },
  costSubtext: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginTop: Spacing.xs,
  },
});
