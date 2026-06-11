import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../../src/constants/theme';

export default function BrainScanModal() {
  // Mock brain scan data
  const regions = [
    { name: 'Prefrontal Cortex', label: 'Decision Making', score: 72, status: 'Recovering' },
    { name: 'Nucleus Accumbens', label: 'Reward Center', score: 45, status: 'Damaged' },
    { name: 'Hippocampus', label: 'Memory', score: 68, status: 'Healing' },
    { name: 'Amygdala', label: 'Impulse Control', score: 55, status: 'Struggling' },
    { name: 'Anterior Cingulate', label: 'Focus', score: 78, status: 'Good' },
  ];

  return (
    <View style={styles.container}>
      <Pressable style={styles.closeBtn} onPress={() => router.back()}>
        <Text style={styles.closeText}>✕</Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.badge}>🧠 WEEKLY BRAIN SCAN</Text>
        <Text style={styles.title}>Brain Health Report</Text>
        <Text style={styles.date}>Week of {new Date().toLocaleDateString()}</Text>

        {/* Brain Visualization */}
        <View style={styles.brainViz}>
          <Text style={styles.brainEmoji}>🧠</Text>
          <Text style={styles.overallScore}>72</Text>
          <Text style={styles.overallLabel}>Overall Health</Text>
        </View>

        {/* Regions */}
        <View style={styles.regionsCard}>
          <Text style={styles.sectionTitle}>Brain Region Analysis</Text>
          {regions.map((region) => (
            <View key={region.name} style={styles.regionRow}>
              <View style={styles.regionInfo}>
                <Text style={styles.regionName}>{region.name}</Text>
                <Text style={styles.regionLabel}>{region.label}</Text>
              </View>
              <View style={styles.regionRight}>
                <Text
                  style={[
                    styles.regionScore,
                    { color: region.score >= 70 ? Colors.SUCCESS : region.score >= 50 ? Colors.WARNING : Colors.DANGER },
                  ]}
                >
                  {region.score}%
                </Text>
                <Text style={styles.regionStatus}>{region.status}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Doctor's Note */}
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>📋 AI Doctor's Note</Text>
          <Text style={styles.noteText}>
            Patient shows significant improvement in prefrontal cortex activity since reducing
            social media usage. Reward center remains compromised from dopamine overstimulation
            but is showing early signs of recalibration. Recommend continued app blocking and
            increased focus sessions. Prognosis: Full recovery possible within 8-12 weeks at
            current trajectory.
          </Text>
        </View>

        <Pressable style={styles.shareBtn}>
          <Text style={styles.shareBtnText}>Share Brain Scan 📤</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  closeBtn: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    color: Colors.TEXT_SECONDARY,
  },
  content: {
    paddingTop: 80,
    paddingHorizontal: Spacing.xl,
    paddingBottom: 40,
    alignItems: 'center',
  },
  badge: {
    fontSize: Typography.sizes.sm,
    color: Colors.PRIMARY,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes['2xl'],
    color: Colors.TEXT_PRIMARY,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  date: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    marginBottom: Spacing.xl,
  },
  brainViz: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.PRIMARY,
    marginBottom: Spacing.xl,
  },
  brainEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  overallScore: {
    fontSize: Typography.sizes['3xl'],
    color: Colors.TEXT_PRIMARY,
    fontWeight: '800',
  },
  overallLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
  },
  regionsCard: {
    width: '100%',
    backgroundColor: Colors.SURFACE,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  regionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: `${Colors.SECONDARY}22`,
  },
  regionInfo: {
    flex: 1,
  },
  regionName: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    fontWeight: '500',
  },
  regionLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginTop: 2,
  },
  regionRight: {
    alignItems: 'flex-end',
  },
  regionScore: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
  },
  regionStatus: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginTop: 2,
  },
  noteCard: {
    width: '100%',
    backgroundColor: `${Colors.PRIMARY}11`,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: `${Colors.PRIMARY}33`,
  },
  noteTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  noteText: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 22,
  },
  shareBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 16,
  },
  shareBtnText: {
    color: '#fff',
    fontSize: Typography.sizes.md,
    fontWeight: '600',
  },
});
