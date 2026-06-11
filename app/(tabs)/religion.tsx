import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { Card } from '../../src/components/ui/Card';

const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

export default function ReligionScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Religion</Text>

        {/* Prayer Times */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Prayer Times</Text>
          {PRAYERS.map((prayer) => (
            <View key={prayer} style={styles.prayerRow}>
              <Text style={styles.prayerName}>{prayer}</Text>
              <Text style={styles.prayerTime}>--:--</Text>
              <View style={styles.prayerStatus} />
            </View>
          ))}
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Card style={styles.actionCard}>
            <Text style={styles.actionEmoji}>📖</Text>
            <Text style={styles.actionLabel}>Quran</Text>
          </Card>
          <Card style={styles.actionCard}>
            <Text style={styles.actionEmoji}>📿</Text>
            <Text style={styles.actionLabel}>Dhikr</Text>
          </Card>
          <Card style={styles.actionCard}>
            <Text style={styles.actionEmoji}>🌙</Text>
            <Text style={styles.actionLabel}>Fasting</Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  title: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginBottom: Spacing.md,
  },
  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: `${Colors.SECONDARY}33`,
  },
  prayerName: {
    flex: 1,
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
  },
  prayerTime: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    marginRight: Spacing.md,
  },
  prayerStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.SECONDARY,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
  },
  actionEmoji: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_PRIMARY,
    fontWeight: '500',
  },
});
