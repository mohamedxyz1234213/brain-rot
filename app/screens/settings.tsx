import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../../src/constants/theme';

type SettingsSection = {
  title: string;
  items: SettingsItem[];
};

type SettingsItem = {
  label: string;
  type: 'toggle' | 'nav' | 'select';
  value?: boolean;
  onPress?: () => void;
};

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    haptics: true,
    notifications: true,
    drivingDetection: true,
    islamicMode: true,
    mirror: false,
    voicePromise: true,
    threeAmGuardian: true,
    darkMode: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sections: SettingsSection[] = [
    {
      title: 'App Blocking',
      items: [
        { label: 'Manage App Limits', type: 'nav', onPress: () => {} },
        { label: 'Smart Blocking (auto-tighten)', type: 'toggle', value: true },
        { label: 'Doom Scroll Tax', type: 'toggle', value: true },
        { label: 'Greyscale Mode', type: 'toggle', value: false },
        { label: 'Fake Loading Screen', type: 'toggle', value: true },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { label: 'Push Notifications', type: 'toggle', value: settings.notifications },
        { label: 'Morning Briefing (7am)', type: 'toggle', value: true },
        { label: 'Daily Roast (9pm)', type: 'toggle', value: true },
        { label: 'Sleep Reminder (11pm)', type: 'toggle', value: true },
        { label: 'Prayer Times', type: 'toggle', value: settings.islamicMode },
      ],
    },
    {
      title: 'Roast Settings',
      items: [
        { label: 'Change Roast Persona', type: 'nav', onPress: () => {} },
        { label: 'Roast Intensity', type: 'select' },
        { label: 'Haptic Feedback', type: 'toggle', value: settings.haptics },
      ],
    },
    {
      title: 'Religion',
      items: [
        { label: 'Islamic Features', type: 'toggle', value: settings.islamicMode },
        { label: 'Prayer Calculation Method', type: 'nav', onPress: () => {} },
        { label: 'Quran Daily Goal', type: 'nav', onPress: () => {} },
      ],
    },
    {
      title: 'Privacy & Safety',
      items: [
        { label: 'The Mirror (Camera)', type: 'toggle', value: settings.mirror },
        { label: 'Voice Promise', type: 'toggle', value: settings.voicePromise },
        { label: 'Driving Detection', type: 'toggle', value: settings.drivingDetection },
        { label: '3AM Guardian', type: 'toggle', value: settings.threeAmGuardian },
      ],
    },
    {
      title: 'Appearance',
      items: [
        { label: 'Dark Mode', type: 'toggle', value: settings.darkMode },
        { label: 'Language', type: 'nav', onPress: () => {} },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Subscription', type: 'nav', onPress: () => router.push('/screens/subscription') },
        { label: 'Export Data', type: 'nav', onPress: () => {} },
        { label: 'Delete Account', type: 'nav', onPress: () => {} },
        { label: 'Sign Out', type: 'nav', onPress: () => router.replace('/(auth)/welcome') },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item) => (
              <View key={item.label} style={styles.itemRow}>
                <Text style={styles.itemLabel}>{item.label}</Text>
                {item.type === 'toggle' && (
                  <Switch
                    value={item.value}
                    trackColor={{ true: Colors.PRIMARY, false: Colors.SECONDARY }}
                    thumbColor="#fff"
                  />
                )}
                {item.type === 'nav' && (
                  <Text style={styles.navArrow}>→</Text>
                )}
                {item.type === 'select' && (
                  <Text style={styles.selectValue}>Medium →</Text>
                )}
              </View>
            ))}
          </View>
        ))}
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
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: `${Colors.SECONDARY}33`,
  },
  itemLabel: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
  },
  navArrow: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
  },
  selectValue: {
    fontSize: Typography.sizes.md,
    color: Colors.PRIMARY,
  },
});
