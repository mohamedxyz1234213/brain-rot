import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow, Layout, LetterSpacing } from '../../src/constants/theme';
import { SafeScreen, ScreenHeader } from '../../src/components/ui';
import { useBrainScoreStore } from '../../src/stores/brainScoreStore';
import { useScreenTimeStore } from '../../src/stores/screenTimeStore';
import { useSettingsStore } from '../../src/stores/settingsStore';

const { width } = Dimensions.get('window');

const INSTAGRAM_COLOR = '#E1306C';
const TIKTOK_COLOR = '#69C9D0';
const YOUTUBE_COLOR = '#FF0000';
const TWITTER_COLOR = '#1DA1F2';
const WHATSAPP_COLOR = '#25D366';

const SAMPLE_BRAIN_SCORES = [65, 68, 72, 58, 75, 80, 77, 82, 79, 85, 88, 84, 90, 87];

export default function AnalyticsScreen() {
  const scores = useBrainScoreStore((s) => s.scores);
  const totalMinutes = useScreenTimeStore((s) => s.totalMinutesToday);
  const hourlyRate = useSettingsStore((s) => s.hourlyRate);

  // Real history is stored newest-first; chart reads oldest -> newest.
  const hasHistory = scores.length > 0;
  const brainScoreData = hasHistory
    ? [...scores].reverse().map((e) => e.score)
    : SAMPLE_BRAIN_SCORES;

  const monthlyCost = ((totalMinutes * 30) / 60) * hourlyRate;

  return (
    <SafeScreen>
      <ScreenHeader title="Analytics" subtitle="Your recovery journey in numbers" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing['3xl'] }}>
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>🧠 Brain Score ({brainScoreData.length} days)</Text>
          {!hasHistory && <Text style={styles.sampleNote}>Sample data — your real trend appears as you use the app</Text>}
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
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>📱 Screen Time Today</Text>
          <Text style={styles.bigStat}>
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </Text>
          <Text style={styles.sampleNote}>Logged across your tracked apps today</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>⏱️</Text>
            <Text style={styles.statValue}>-42%</Text>
            <Text style={styles.statLabel}>Screen Time</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={styles.statValue}>87%</Text>
            <Text style={styles.statLabel}>Task Rate</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={styles.statValue}>14h</Text>
            <Text style={styles.statLabel}>Focus Time</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🕌</Text>
            <Text style={styles.statValue}>92%</Text>
            <Text style={styles.statLabel}>Prayers</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>📊 Top Apps This Week</Text>
          {[
            { name: 'Instagram', minutes: 85, color: INSTAGRAM_COLOR },
            { name: 'TikTok', minutes: 62, color: TIKTOK_COLOR },
            { name: 'YouTube', minutes: 48, color: YOUTUBE_COLOR },
            { name: 'Twitter/X', minutes: 31, color: TWITTER_COLOR },
            { name: 'WhatsApp', minutes: 25, color: WHATSAPP_COLOR },
          ].map((app) => (
            <View key={app.name} style={styles.appBarRow}>
              <Text style={styles.appBarName}>{app.name}</Text>
              <View style={styles.appBarBg}>
                <View
                  style={[
                    styles.appBarFill,
                    { width: `${(app.minutes / 85) * 100}%`, backgroundColor: app.color },
                  ]}
                />
              </View>
              <Text style={styles.appBarValue}>{app.minutes}m</Text>
            </View>
          ))}
        </View>

        <View style={styles.costCard}>
          <Text style={styles.costTitle}>💸 Usage Cost Calculator</Text>
          <Text style={styles.costDesc}>
            At ${hourlyRate}/hour, you spent the equivalent of:
          </Text>
          <Text style={styles.costAmount}>${monthlyCost.toFixed(2)}</Text>
          <Text style={styles.costSubtext}>projected over a month at today's pace</Text>
        </View>
      </ScrollView>
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
  sampleNote: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
    fontStyle: 'italic',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    padding: Spacing.lg,
    backgroundColor: Colors.SURFACE,
    borderRadius: Radius.xl,
    alignItems: 'center',
    borderWidth: Layout.hairline,
    borderColor: Colors.BORDER,
    ...Shadow.sm,
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: Typography.sizes.xl,
    color: Colors.TEXT_PRIMARY,
    fontWeight: Typography.weights.bold,
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginTop: Spacing.xs,
  },
  appBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  appBarName: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_PRIMARY,
    width: 80,
  },
  appBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: `${Colors.TEXT_SECONDARY}33`,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginHorizontal: Spacing.sm,
  },
  appBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  appBarValue: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    width: 36,
    textAlign: 'right',
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
