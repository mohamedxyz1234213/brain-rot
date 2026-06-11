import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../../src/constants/theme';

const { width } = Dimensions.get('window');

// Mock data for charts
const BRAIN_SCORE_DATA = [65, 68, 72, 58, 75, 80, 77, 82, 79, 85, 88, 84, 90, 87];
const SCREEN_TIME_DATA = [180, 165, 120, 200, 145, 130, 110, 95, 140, 105, 90, 88, 75, 80];

export default function AnalyticsScreen() {
  const maxScore = Math.max(...BRAIN_SCORE_DATA);
  const maxScreenTime = Math.max(...SCREEN_TIME_DATA);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Your recovery journey in numbers</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Brain Score Trend */}
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

        {/* Screen Time Trend */}
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

        {/* Quick Stats */}
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

        {/* Top Apps */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>📊 Top Apps This Week</Text>
          {[
            { name: 'Instagram', minutes: 85, color: '#E1306C' },
            { name: 'TikTok', minutes: 62, color: '#69C9D0' },
            { name: 'YouTube', minutes: 48, color: '#FF0000' },
            { name: 'Twitter/X', minutes: 31, color: '#1DA1F2' },
            { name: 'WhatsApp', minutes: 25, color: '#25D366' },
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

        {/* Usage Cost */}
        <View style={styles.costCard}>
          <Text style={styles.costTitle}>💸 Usage Cost Calculator</Text>
          <Text style={styles.costDesc}>
            At $25/hour, you spent the equivalent of:
          </Text>
          <Text style={styles.costAmount}>$312.50</Text>
          <Text style={styles.costSubtext}>on social media this month</Text>
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
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    marginTop: 4,
  },
  chartCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.SURFACE,
    borderRadius: 16,
  },
  chartTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    fontWeight: '600',
    marginBottom: Spacing.lg,
  },
  lineChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    gap: 4,
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
    fontWeight: '700',
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginTop: 4,
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
    backgroundColor: `${Colors.SECONDARY}33`,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${Colors.DANGER}33`,
    alignItems: 'center',
  },
  costTitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.TEXT_PRIMARY,
    fontWeight: '600',
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
    fontWeight: '800',
  },
  costSubtext: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginTop: 4,
  },
});
