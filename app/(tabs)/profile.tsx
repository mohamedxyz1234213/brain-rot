import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
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
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useTaskStore } from '../../src/stores/taskStore';
import { useRouter } from 'expo-router';
import { fireRoastNow } from '../../src/services/roastNotificationService';

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
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
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  const handleLanguage = (next: 'en' | 'ar') => {
    if (next === language) return;
    Haptics.selectionAsync();
    setLanguage(next);
  };

  const handleRoastMeNow = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    const pending = useTaskStore.getState().tasks.filter((t) => t.status === 'pending').length;
    const topLog = useScreenTimeStore.getState().logs.sort((a, b) => b.minutesUsed - a.minutesUsed)[0];
    await fireRoastNow({
      lang: language,
      name: user?.name,
      pendingTasks: pending,
      topApp: topLog?.appName,
      topMinutes: topLog?.minutesUsed,
    });
  };

  const handleSignOut = () => {
    logout();
    router.replace('/(auth)/welcome');
  };

  return (
    <SafeScreen tabBarSpacing>
      <TabHeader eyebrow={t('profile.yourAccount')} title={t('profile.profile')} />
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={Typography.sizes['3xl']} color={Colors.PRIMARY_LIGHT} />
          </View>
          <Text style={styles.userName} numberOfLines={1}>{user?.name ?? 'Zombie Brain'}</Text>
          <Text style={styles.userLevel} numberOfLines={1}>{t('dashboard.level', { level })} · {xp} XP</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <Card glass style={styles.statsCard}>
            <Text style={styles.cardTitle}>{t('profile.statsOverview')}</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>{t('dashboard.brainScore')}</Text>
                <Text style={[styles.statValue, { color: Colors.PRIMARY_LIGHT }]}>{brainScore}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>{t('dashboard.streak')}</Text>
                <Text style={[styles.statValue, { color: Colors.SUCCESS }]}>{streak?.currentDays ?? 0}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>{t('dashboard.focusMinutes')}</Text>
                <Text style={styles.statValue}>{totalFocusMinutes} {t('common.min')}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>{t('dashboard.screenTime')}</Text>
                <Text style={styles.statValue}>{totalScreenMinutes} {t('common.min')}</Text>
              </View>
            </View>
            <ProgressBar progress={levelInfo.progress * 100} height={6} gradient={Gradients.brand} />
            <Text style={styles.xpProgress}>{Math.round(levelInfo.progress * 100)}% / {levelInfo.maxXP} XP</Text>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(150)}>
          <Card glass style={styles.langCard}>
            <Text style={styles.cardTitle}>{t('common.language')}</Text>
            <View style={styles.langRow}>
              {(['en', 'ar'] as const).map((code) => {
                const active = language === code;
                return (
                  <Pressable
                    key={code}
                    onPress={() => handleLanguage(code)}
                    style={[styles.langBtn, active && styles.langBtnActive]}
                    accessibilityRole="button"
                    accessibilityLabel={code === 'en' ? t('common.english') : t('common.arabic')}
                  >
                    <Text style={[styles.langBtnText, active && styles.langBtnTextActive]}>
                      {code === 'en' ? t('common.english') : t('common.arabic')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable
              onPress={handleRoastMeNow}
              style={styles.roastNowBtn}
              accessibilityRole="button"
              accessibilityLabel="Roast me now"
            >
              <Ionicons name="flame" size={Sizing.iconSm} color={Colors.DANGER} />
              <Text style={styles.roastNowText}>{language === 'ar' ? 'حرقني دلوقتي' : 'Roast me now'}</Text>
            </Pressable>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <Card glass style={styles.subCard}>
            <View style={styles.subRow}>
              <Text style={[styles.cardTitle, { flex: 1, marginRight: Spacing.sm, marginBottom: 0 }]} numberOfLines={1}>{t('subscription.upgrade')}</Text>
              <Text style={[styles.tierBadge, tier !== 'free' && styles.tierBadgeActive]} numberOfLines={1}>{tier.toUpperCase()}</Text>
            </View>
            {tier === 'free' && (
              <Button title={`${t('subscription.upgrade')} — $4.99/mo`} onPress={() => router.push('/screens/subscription')} size="md" />
            )}
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(300)}>
          {([
            { label: t('profile.settings'), icon: 'settings-outline', route: '/screens/settings' },
            { label: t('profile.analytics'), icon: 'bar-chart-outline', route: '/screens/analytics' },
            { label: t('profile.roastHistory'), icon: 'flame-outline', route: '/screens/roast-history' },
            { label: t('profile.accountability'), icon: 'people-outline', route: '/screens/accountability' },
            { label: t('profile.leaderboard'), icon: 'trophy-outline', route: '/screens/leaderboard' },
            { label: t('profile.challenges'), icon: 'flag-outline', route: '/screens/challenges' },
          ] as const).map((nav) => (
            <Pressable key={nav.route} style={styles.navItem} onPress={() => router.push(nav.route)} accessibilityRole="button" accessibilityLabel={nav.label}>
              <View style={styles.navItemLeft}>
                <Ionicons name={nav.icon} size={Sizing.iconMd} color={Colors.PRIMARY_LIGHT} />
                <Text style={styles.navItemText} numberOfLines={1}>{nav.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={Sizing.iconMd} color={Colors.TEXT_SECONDARY} />
            </Pressable>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <Button title={t('profile.signOut')} onPress={handleSignOut} variant="danger" size="lg" style={styles.signOutBtn} />
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
  langCard: { marginBottom: Spacing.lg },
  langRow: { flexDirection: 'row', gap: Spacing.sm },
  langBtn: { flex: 1, paddingVertical: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.BORDER, backgroundColor: Colors.SURFACE_RAISED, alignItems: 'center', minHeight: Sizing.touchTarget, justifyContent: 'center' },
  langBtnActive: { backgroundColor: Colors.PRIMARY, borderColor: Colors.PRIMARY, ...Shadow.sm },
  langBtnText: { fontSize: Typography.sizes.md, fontFamily: Typography.families.featureMedium, color: Colors.TEXT_PRIMARY, letterSpacing: 0.2 },
  langBtnTextActive: { color: Colors.TEXT_ON_PRIMARY, fontFamily: Typography.families.featureSemi },
  roastNowBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, marginTop: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(184,92,92,0.32)', backgroundColor: Colors.DANGER_LIGHT, minHeight: Sizing.touchTarget },
  roastNowText: { fontSize: Typography.sizes.sm, fontFamily: Typography.families.featureSemi, color: Colors.DANGER, letterSpacing: 0.4 },
  subCard: { marginBottom: Spacing.lg },
  subRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  tierBadge: { fontSize: Typography.sizes.sm, fontFamily: Typography.families.featureSemi, color: Colors.TEXT_SECONDARY, letterSpacing: LetterSpacing.wide },
  tierBadgeActive: { color: Colors.SUCCESS },
  navItem: { backgroundColor: Colors.SURFACE, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.BORDER, minHeight: Sizing.touchTarget, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navItemLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginRight: Spacing.sm },
  navItemText: { flex: 1, fontSize: Typography.sizes.md, fontFamily: Typography.families.bodyMedium, color: Colors.TEXT_PRIMARY },
  signOutBtn: { marginTop: Spacing.md },
});
