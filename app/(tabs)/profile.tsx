import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Sizing, Shadow, Gradients, LetterSpacing } from '../../src/constants/theme';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { SafeScreen, TabHeader } from '../../src/components/ui/SafeScreen';
import { useAuthStore } from '../../src/stores/authStore';
import { useXPStore } from '../../src/stores/xpStore';
import { useBrainScoreStore } from '../../src/stores/brainScoreStore';
import { useStreakStore } from '../../src/stores/streakStore';
import { useFocusStore } from '../../src/stores/focusStore';
import { useScreenTimeStore } from '../../src/stores/screenTimeStore';
import { useSubscriptionStore } from '../../src/stores/subscriptionStore';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const xp = useXPStore((s) => s.xp);
  const level = useXPStore((s) => s.level);
  const levelInfo = useXPStore((s) => s.levelInfo);
  const brainScore = useBrainScoreStore((s) => s.currentScore);
  const streak = useStreakStore((s) => s.getStreak('screen_time'));
  const totalFocusMinutes = useFocusStore((s) => s.totalFocusMinutesToday);
  const totalScreenMinutes = useScreenTimeStore((s) => s.totalMinutesToday);
  const tier = useSubscriptionStore((s) => s.tier);

  const handleSignOut = () => {
    logout();
    router.replace('/(auth)/welcome');
  };

  return (
    <SafeScreen tabBarSpacing>
      <TabHeader eyebrow="Your account" title="Profile" />
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={Typography.sizes['3xl']} color={Colors.PRIMARY_LIGHT} />
          </View>
          <Text style={styles.userName}>{user?.name ?? 'Zombie Brain'}</Text>
          <Text style={styles.userLevel}>Level {level} · {xp} XP</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <Card glass style={styles.statsCard}>
            <Text style={styles.cardTitle}>Stats Overview</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Brain Score</Text>
                <Text style={[styles.statValue, { color: Colors.PRIMARY_LIGHT }]}>{brainScore}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Streak</Text>
                <Text style={[styles.statValue, { color: Colors.SUCCESS }]}>{streak?.currentDays ?? 0}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Focus Time</Text>
                <Text style={styles.statValue}>{totalFocusMinutes} min</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Screen Time</Text>
                <Text style={styles.statValue}>{totalScreenMinutes} min</Text>
              </View>
            </View>
            <ProgressBar progress={levelInfo.progress * 100} height={6} gradient={Gradients.brand} />
            <Text style={styles.xpProgress}>{Math.round(levelInfo.progress * 100)}% to {levelInfo.maxXP} XP</Text>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <Card glass style={styles.subCard}>
            <View style={styles.subRow}>
              <Text style={styles.cardTitle}>Subscription</Text>
              <Text style={[styles.tierBadge, tier !== 'free' && styles.tierBadgeActive]}>{tier.toUpperCase()}</Text>
            </View>
            {tier === 'free' && (
              <Button title="Upgrade to Healed — $4.99/mo" onPress={() => router.push('/screens/subscription')} size="md" />
            )}
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(300)}>
          {([
            { label: 'Settings', icon: 'settings-outline', route: '/screens/settings' },
            { label: 'Analytics', icon: 'bar-chart-outline', route: '/screens/analytics' },
            { label: 'Roast History', icon: 'flame-outline', route: '/screens/roast-history' },
            { label: 'Accountability', icon: 'people-outline', route: '/screens/accountability' },
            { label: 'Leaderboard', icon: 'trophy-outline', route: '/screens/leaderboard' },
            { label: 'Challenges', icon: 'flag-outline', route: '/screens/challenges' },
          ] as const).map((nav) => (
            <Pressable key={nav.route} style={styles.navItem} onPress={() => router.push(nav.route)} accessibilityRole="button" accessibilityLabel={nav.label}>
              <View style={styles.navItemLeft}>
                <Ionicons name={nav.icon} size={Sizing.iconMd} color={Colors.PRIMARY_LIGHT} />
                <Text style={styles.navItemText}>{nav.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={Sizing.iconMd} color={Colors.TEXT_SECONDARY} />
            </Pressable>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <Button title="Sign Out" onPress={handleSignOut} variant="danger" size="lg" style={styles.signOutBtn} />
        </Animated.View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, paddingBottom: Spacing['3xl'] },
  avatarSection: { alignItems: 'center', marginBottom: Spacing.xl },
  avatarCircle: { width: Sizing.avatarLg, height: Sizing.avatarLg, borderRadius: Radius.full, backgroundColor: Colors.SURFACE, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.PRIMARY_LIGHT, ...Shadow.glow },
  userName: { fontSize: Typography.sizes['2xl'], fontFamily: Typography.families.display, color: Colors.TEXT_PRIMARY, marginTop: Spacing.md, letterSpacing: LetterSpacing.tight },
  userLevel: { fontSize: Typography.sizes.sm, fontFamily: Typography.families.featureMedium, color: Colors.TEXT_SECONDARY, marginTop: Spacing.xs, letterSpacing: 0.3 },
  statsCard: { marginBottom: Spacing.lg },
  cardTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.families.displaySemi, color: Colors.TEXT_PRIMARY, marginBottom: Spacing.md, letterSpacing: LetterSpacing.tight },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  statItem: { width: '47%', flexGrow: 1, marginBottom: Spacing.xs, backgroundColor: Colors.SURFACE_RAISED, borderRadius: Radius.lg, padding: Spacing.md },
  statLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.families.featureMedium, color: Colors.TEXT_SECONDARY, letterSpacing: LetterSpacing.wide, textTransform: 'uppercase' },
  statValue: { fontSize: Typography.sizes.xl, fontFamily: Typography.families.numeric, color: Colors.TEXT_PRIMARY, letterSpacing: LetterSpacing.tight, marginTop: 2 },
  xpProgress: { fontSize: Typography.sizes.sm, fontFamily: Typography.families.featureMedium, color: Colors.TEXT_SECONDARY, marginTop: Spacing.sm },
  subCard: { marginBottom: Spacing.lg },
  subRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  tierBadge: { fontSize: Typography.sizes.sm, fontFamily: Typography.families.featureSemi, color: Colors.TEXT_SECONDARY, letterSpacing: LetterSpacing.wide },
  tierBadgeActive: { color: Colors.SUCCESS },
  navItem: { backgroundColor: Colors.SURFACE, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.BORDER, minHeight: Sizing.touchTarget, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navItemLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  navItemText: { fontSize: Typography.sizes.md, fontFamily: Typography.families.bodyMedium, color: Colors.TEXT_PRIMARY },
  signOutBtn: { marginTop: Spacing.md },
});
