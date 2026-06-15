import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme';
import { SafeScreen, ScreenHeader } from '../../src/components/ui';

const { width } = Dimensions.get('window');

const INSTAGRAM_COLOR = '#E1306C';
const TIKTOK_COLOR = '#69C9D0';
const YOUTUBE_COLOR = '#FF0000';
const TWITTER_COLOR = '#1DA1F2';
const WHATSAPP_COLOR = '#25D366';

const BRAIN_SCORE_DATA = [65, 68, 72, 58, 75, 80, 77, 82, 79, 85, 88, 84, 90, 87];
const SCREEN_TIME_DATA = [180, 165, 120, 200, 145, 130, 110, 95, 140, 105, 90, 88, 75, 80];

export default function AnalyticsScreen() {
  const maxScore = Math.max(...BRAIN_SCORE_DATA);
  const maxScreenTime = Math.max(...SCREEN_TIME_DATA);

  return (
    <SafeScreen>
      <ScreenHeader title="Analytics" subtitle="Your recovery journey in numbers" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing['3xl'] }}>
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>🧠 Brain Score (14 days)</Text>
          <View style={styles.lineChart}>
            {BRAIN_SCORE_DATA.map((score, i) => (
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
            <Text style={styles.chartLabel}>14 days ago</Text>
            <Text style={styles.chartLabel}>Today</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>📱 Screen Time (minutes/day)</Text>
          <View style={styles.lineChart}>
            {SCREEN_TIME_DATA.map((mins, i) => (
              <View
                key={i}
                style={[
                  styles.lineBar,
                  {
                    height: (mins / maxScreenTime) * 100,
                    backgroundColor:
                      mins <= 90 ? Colors.SUCCESS : mins <= 150 ? Colors.WARNING : Colors.DANGER,
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.chartLabels}>
            <Text style={styles.chartLabel}>14 days ago</Text>
            <Text style={styles.chartLabel}>Today</Text>
          </View>
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
            At $25/hour, you spent the equivalent of:
          </Text>
          <Text style={styles.costAmount}>$312.50</Text>
          <Text style={styles.costSubtext}>on social media this month</Text>
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
    borderRadius: Radius.lg,
  },
  chartTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.lg,
  },
  lineChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    gap: Spacing.xs,
  },
  lineBar: {
    flex: 1,
    borderRadius: 3,
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
    borderRadius: 12,
    alignItems: 'center',
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
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: Spacing.sm,
  },
  appBarFill: {
    height: '100%',
    borderRadius: 4,
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
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: `${Colors.DANGER}33`,
    alignItems: 'center',
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
