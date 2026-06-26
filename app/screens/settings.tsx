import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
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
  const s = useSettingsStore();
  const isMuslim = s.religion === 'muslim';
  const quranGoal = useReligionStore((st) => st.quranProgress.dailyPageGoal);
  const updateQuran = useReligionStore((st) => st.updateQuranProgress);
  const refreshAll = useRefreshAll();
  const logout = useAuthStore((st) => st.logout);

  const [local, setLocal] = useState({
    smartBlocking: true,
    doomScrollTax: true,
    greyscale: false,
    haptics: true,
    darkMode: true,
  });
  const setLocalKey = (key: keyof typeof local) => (v: boolean) => {
    Haptics.selectionAsync();
    setLocal((prev) => ({ ...prev, [key]: v }));
  };

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
      'Delete Account',
      'This will sign you out and clear your local data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
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
    Alert.alert('Export Data', 'Your data is stored on-device. A shareable export is coming soon.');
  };

  const sections: SettingsSection[] = (() => { const sects: SettingsSection[] = [
    {
      title: 'App Blocking',
      items: [
        { kind: 'nav', label: 'Manage App Limits', onPress: go('/setup/limits') },
        { kind: 'toggle', label: 'Smart Blocking (auto-tighten)', value: local.smartBlocking, onChange: setLocalKey('smartBlocking') },
        { kind: 'toggle', label: 'Doom Scroll Tax', value: local.doomScrollTax, onChange: setLocalKey('doomScrollTax') },
        { kind: 'toggle', label: 'Greyscale Mode', value: local.greyscale, onChange: setLocalKey('greyscale') },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { kind: 'toggle', label: 'Push Notifications', value: s.notificationsEnabled, onChange: bind(s.notificationsEnabled, s.setNotificationsEnabled) },
        { kind: 'toggle', label: 'Morning Briefing (7am)', value: s.morningBriefingEnabled, onChange: bind(s.morningBriefingEnabled, s.setMorningBriefing) },
        { kind: 'toggle', label: 'Daily Roast (9pm)', value: s.dailyRoastEnabled, onChange: bind(s.dailyRoastEnabled, s.setDailyRoast) },
        { kind: 'toggle', label: 'Sleep Reminder (11pm)', value: s.sleepReminderEnabled, onChange: bind(s.sleepReminderEnabled, s.setSleepReminder) },
        ...(isMuslim ? [{ kind: 'toggle' as const, label: 'Prayer Times', value: s.prayerNotificationsEnabled, onChange: bind(s.prayerNotificationsEnabled, s.setPrayerNotifications) }] : []),
      ],
    },
    {
      title: 'Roast Settings',
      items: [
        { kind: 'nav', label: 'Change Roast Persona', hint: s.roastPersona.replace(/_/g, ' '), onPress: go('/setup/persona') },
      ],
    },
    ...(isMuslim ? [{
      title: 'Religion',
      items: [
        { kind: 'toggle', label: 'Islamic Features', value: s.religionEnabled, onChange: bind(s.religionEnabled, s.setReligionEnabled) },
        { kind: 'nav', label: 'Prayer Calculation Method', onPress: go('/setup/religion') },
        { kind: 'nav', label: 'Quran Daily Goal', hint: `${quranGoal} page${quranGoal === 1 ? '' : 's'}`, onPress: cycleQuranGoal },
      ],
    } as SettingsSection] : []),
    {
      title: 'Privacy & Safety',
      items: [
        { kind: 'toggle', label: 'The Mirror (Camera)', value: s.mirrorFeatureEnabled, onChange: bind(s.mirrorFeatureEnabled, s.setMirrorFeature) },
        { kind: 'toggle', label: 'Voice Promise', value: s.voicePromiseEnabled, onChange: bind(s.voicePromiseEnabled, s.setVoicePromise) },
        { kind: 'toggle', label: 'Driving Detection', value: s.drivingDetectionEnabled, onChange: bind(s.drivingDetectionEnabled, s.setDrivingDetection) },
        { kind: 'toggle', label: '3AM Guardian', value: s.guardianEnabled, onChange: bind(s.guardianEnabled, s.setGuardian) },
      ],
    },
    {
      title: 'Appearance',
      items: [
        { kind: 'toggle', label: 'Dark Mode', value: local.darkMode, onChange: setLocalKey('darkMode') },
        { kind: 'nav', label: 'Language', hint: s.language === 'ar' ? 'العربية' : 'English', onPress: () => { Haptics.selectionAsync(); s.setLanguage(s.language === 'en' ? 'ar' : 'en'); } },
      ],
    },
    {
      title: 'Account',
      items: [
        { kind: 'nav', label: 'Subscription', onPress: go('/screens/subscription') },
        { kind: 'nav', label: 'Export Data', onPress: exportData },
        { kind: 'nav', label: 'Delete Account', onPress: confirmDelete, danger: true },
        { kind: 'nav', label: 'Sign Out', onPress: () => { logout(); router.replace('/(auth)/welcome'); } },
      ],
    },
  ];
  return sects; })();

  return (
    <SafeScreen>
      <ScreenHeader title="Settings" onBack={() => router.back()} />
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
