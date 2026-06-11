import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Avatar + Name */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🧟</Text>
          </View>
          <Text style={styles.name}>User</Text>
          <Text style={styles.level}>Level: Zombie</Text>
          <Text style={styles.xp}>0 XP</Text>
        </View>

        {/* Stats */}
        <Card style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Brain Score</Text>
            <Text style={styles.statValue}>--</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Longest Streak</Text>
            <Text style={styles.statValue}>0 days</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Tasks Completed</Text>
            <Text style={styles.statValue}>0</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Focus Hours</Text>
            <Text style={styles.statValue}>0h</Text>
          </View>
        </Card>

        {/* Subscription */}
        <Card style={styles.subCard}>
          <Text style={styles.subTitle}>Free Plan</Text>
          <Text style={styles.subDesc}>Unlock full blocking, AI planner, and more</Text>
          <Button title="Upgrade to Healed" onPress={() => {}} style={{ marginTop: Spacing.md }} />
        </Card>

        {/* Settings */}
        <Button title="Settings" onPress={() => {}} variant="secondary" style={{ marginTop: Spacing.lg }} />
        <Button title="Sign Out" onPress={() => {}} variant="ghost" style={{ marginTop: Spacing.sm }} />
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 36,
  },
  name: {
    fontSize: Typography.sizes.xl,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
  },
  level: {
    fontSize: Typography.sizes.md,
    color: Colors.PRIMARY,
    marginTop: Spacing.xs,
  },
  xp: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginTop: Spacing.xs,
  },
  statsCard: {
    marginBottom: Spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: `${Colors.SECONDARY}33`,
  },
  statLabel: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
  },
  statValue: {
    fontSize: Typography.sizes.md,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  subCard: {
    borderColor: Colors.PRIMARY,
    borderWidth: 1,
  },
  subTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  subDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginTop: Spacing.xs,
  },
});
