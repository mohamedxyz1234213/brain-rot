import React from 'react';
import { View, Text, StyleSheet, Switch, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Colors, Typography, Spacing, Radius, Layout } from '../../src/constants/theme';
import { SafeScreen, ScreenHeader } from '../../src/components/ui';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useReligionStore } from '../../src/stores/religionStore';
import { PullToRefresh } from '../../src/components/ui/PullToRefresh';
import { useRefreshAll } from '../../src/hooks/useRefreshAll';
import { useAuthStore } from '../../src/stores/authStore';

type ToggleItem = { kind: 'toggle'; label: string; value: boolean; onChange: (v: boolean) => void };
type NavItem = { kind: 'nav'; label: string; hint?: string; onPress: () => void; danger?: boolean };
type SettingsItem = ToggleItem | NavItem;
type SettingsSection = { title: string; items: SettingsItem[] };

export default function SettingsScreen() {
  const { t } = useTranslation();
  const s = useSettingsStore();
  const isMuslim = s.religion === 'muslim';
  const quranGoal = useReligionStore((st) => st.quranProgress.dailyPageGoal);
  const updateQuran = useReligionStore((st) => st.updateQuranProgress);
  const refreshAll = useRefreshAll();
  const logout = useAuthStore((st) => st.logout);

  const bind = (value: boolean, setter: (v: boolean) => void) => (v: boolean) => {
    Haptics.selectionAsync();
    setter(v);
  };

  const go = (path: string) => () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(path as any);
  };

  const cycleQuranGoal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = quranGoal >= 20 ? 1 : quranGoal + 1;
    updateQuran({ dailyPageGoal: next });
  };

  const confirmDelete = () => {
    Alert.alert(
      t('settings.deleteAccount'),
      t('settings.deleteAccountConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            logout();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  };

  const exportData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(t('settings.exportData'), t('settings.exportComingSoon'));
  };

  const sections: SettingsSection[] = (() => { const sects: SettingsSection[] = [
    {
      title: t('settings.appBlocking'),
      items: [
        { kind: 'nav', label: t('settings.manageAppLimits'), onPress: go('/setup/limits') },
      ],
    },
    {
      title: t('settings.notifications'),
      items: [
        { kind: 'toggle', label: t('settings.pushNotifications'), value: s.notificationsEnabled, onChange: bind(s.notificationsEnabled, s.setNotificationsEnabled) },
        { kind: 'toggle', label: t('settings.morningBriefing'), value: s.morningBriefingEnabled, onChange: bind(s.morningBriefingEnabled, s.setMorningBriefing) },
        { kind: 'toggle', label: t('settings.dailyRoast'), value: s.dailyRoastEnabled, onChange: bind(s.dailyRoastEnabled, s.setDailyRoast) },
        { kind: 'toggle', label: t('settings.sleepReminder'), value: s.sleepReminderEnabled, onChange: bind(s.sleepReminderEnabled, s.setSleepReminder) },
        ...(isMuslim ? [{ kind: 'toggle' as const, label: t('settings.prayerTimes'), value: s.prayerNotificationsEnabled, onChange: bind(s.prayerNotificationsEnabled, s.setPrayerNotifications) }] : []),
      ],
    },
    ...(isMuslim ? [{
      title: t('settings.religion'),
      items: [
        { kind: 'toggle', label: t('settings.islamicFeatures'), value: s.religionEnabled, onChange: bind(s.religionEnabled, s.setReligionEnabled) },
        { kind: 'nav', label: t('settings.prayerCalcMethod'), onPress: go('/setup/religion') },
        { kind: 'nav', label: t('settings.quranDailyGoal'), hint: quranGoal === 1 ? t('settings.quranPages', { count: quranGoal }) : t('settings.quranPagesPlural', { count: quranGoal }), onPress: cycleQuranGoal },
      ],
    } as SettingsSection] : []),
    {
      title: t('settings.privacySafety'),
      items: [
        { kind: 'toggle', label: t('settings.theMirror'), value: s.mirrorFeatureEnabled, onChange: bind(s.mirrorFeatureEnabled, s.setMirrorFeature) },
        { kind: 'toggle', label: t('settings.voicePromise'), value: s.voicePromiseEnabled, onChange: bind(s.voicePromiseEnabled, s.setVoicePromise) },
        { kind: 'toggle', label: t('settings.drivingDetection'), value: s.drivingDetectionEnabled, onChange: bind(s.drivingDetectionEnabled, s.setDrivingDetection) },
        { kind: 'toggle', label: t('settings.guardian3am'), value: s.guardianEnabled, onChange: bind(s.guardianEnabled, s.setGuardian) },
      ],
    },
    {
      title: t('settings.appearance'),
      items: [
        { kind: 'nav', label: t('settings.languageLabel'), hint: s.language === 'ar' ? 'العربية' : 'English', onPress: () => { Haptics.selectionAsync(); s.setLanguage(s.language === 'en' ? 'ar' : 'en'); } },
      ],
    },
    {
      title: t('settings.account'),
      items: [
        { kind: 'nav', label: t('settings.subscription'), onPress: go('/screens/subscription') },
        { kind: 'nav', label: t('settings.report'), onPress: go('/screens/report') },
        { kind: 'nav', label: t('settings.exportData'), onPress: exportData },
        { kind: 'nav', label: t('settings.deleteAccount'), onPress: confirmDelete, danger: true },
        { kind: 'nav', label: t('settings.signOut'), onPress: () => { logout(); router.replace('/(auth)/welcome'); } },
      ],
    },
  ];
  return sects; })();

  return (
    <SafeScreen>
      <ScreenHeader title={t('settings.title')} onBack={() => router.back()} />
      <PullToRefresh onRefresh={refreshAll} contentContainerStyle={{ paddingBottom: Spacing['3xl'] }}>
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item) =>
              item.kind === 'toggle' ? (
                <View key={item.label} style={styles.itemRow}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <Switch
                    value={item.value}
                    onValueChange={item.onChange}
                    trackColor={{ true: Colors.PRIMARY, false: Colors.BORDER }}
                    thumbColor={Colors.TEXT_ON_PRIMARY}
                    accessibilityLabel={item.label}
                  />
                </View>
              ) : (
                <Pressable
                  key={item.label}
                  style={styles.itemRow}
                  onPress={item.onPress}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                >
                  <Text style={[styles.itemLabel, item.danger && styles.dangerLabel]}>{item.label}</Text>
                  <View style={styles.navRight}>
                    {item.hint && <Text style={styles.hint}>{item.hint}</Text>}
                    <Text style={[styles.navArrow, item.danger && styles.dangerLabel]}>→</Text>
                  </View>
                </Pressable>
              )
            )}
          </View>
        ))}
      </PullToRefresh>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.SURFACE,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.lg,
    borderWidth: Layout.hairline,
    borderColor: Colors.BORDER,
  },
  sectionTitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    fontWeight: Typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
    paddingVertical: Spacing.md,
    borderBottomWidth: Layout.hairline,
    borderBottomColor: Colors.BORDER_LIGHT,
  },
  itemLabel: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    flexShrink: 1,
  },
  dangerLabel: {
    color: Colors.DANGER,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  hint: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    textTransform: 'capitalize',
  },
  navArrow: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
  },
});
