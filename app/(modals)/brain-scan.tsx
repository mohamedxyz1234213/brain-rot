import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Sizing } from '../../src/constants/theme';
import { SafeScreen } from '../../src/components/ui';

export default function BrainScanModal() {
  const regions = [
    { name: 'Prefrontal Cortex', label: 'Decision Making', score: 72, status: 'Recovering' },
    { name: 'Nucleus Accumbens', label: 'Reward Center', score: 45, status: 'Damaged' },
    { name: 'Hippocampus', label: 'Memory', score: 68, status: 'Restoring' },
    { name: 'Amygdala', label: 'Impulse Control', score: 55, status: 'Struggling' },
    { name: 'Anterior Cingulate', label: 'Focus', score: 78, status: 'Good' },
  ];

  return (
    <SafeScreen>
      <View style={{ flex: 1 }}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close">
          <Ionicons name="close" size={Sizing.iconLg} color={Colors.TEXT_SECONDARY} />
        </Pressable>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.badge}>WEEKLY BRAIN SCAN</Text>
          <Text style={styles.title}>Brain Status Report</Text>
          <Text style={styles.date}>Week of {new Date().toLocaleDateString()}</Text>

          <View style={styles.brainViz}>
            <Ionicons name="hardware-chip-outline" size={Sizing.iconLg} color={Colors.PRIMARY} style={styles.brainIcon} />
            <Text style={styles.overallScore}>72</Text>
            <Text style={styles.overallLabel}>Overall Status</Text>
          </View>

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

          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>AI Doctor's Note</Text>
            <Text style={styles.noteText}>
              Patient shows significant improvement in prefrontal cortex activity since reducing
              social media usage. Reward center remains compromised from dopamine overstimulation
              but is showing early signs of recalibration. Recommend continued app blocking and
              increased focus sessions. Prognosis: Full recovery possible within 8-12 weeks at
              current trajectory.
            </Text>
          </View>

          <Pressable style={styles.shareBtn} accessibilityRole="button" accessibilityLabel="Share brain scan">
            <Text style={styles.shareBtnText}>Share Brain Scan</Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  closeBtn: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.xl,
    zIndex: 10,
    padding: Spacing.sm,
  },
  content: {
    paddingTop: Spacing['2xl'],
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
    fontWeight: Typography.weights.bold,
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
    borderRadius: Radius.full,
    backgroundColor: Colors.SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.PRIMARY,
    marginBottom: Spacing.xl,
  },
  brainIcon: {
    marginBottom: Spacing.xs,
  },
  overallScore: {
    fontSize: Typography.sizes['3xl'],
    color: Colors.TEXT_PRIMARY,
    fontWeight: Typography.weights.extrabold,
  },
  overallLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
  },
  regionsCard: {
    width: '100%',
    backgroundColor: Colors.SURFACE,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    fontWeight: Typography.weights.semibold,
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
    fontWeight: Typography.weights.medium,
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
    fontWeight: Typography.weights.bold,
  },
  regionStatus: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginTop: 2,
  },
  noteCard: {
    width: '100%',
    backgroundColor: `${Colors.PRIMARY}11`,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: `${Colors.PRIMARY}33`,
  },
  noteTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.md,
  },
  noteText: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    lineHeight: Typography.lineHeight.normal,
  },
  shareBtn: {
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: 14,
    backgroundColor: Colors.PRIMARY,
    borderRadius: Radius.lg,
  },
  shareBtnText: {
    color: Colors.TEXT_ON_PRIMARY,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
});
