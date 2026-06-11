import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Switch } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../../../src/constants/theme';

const POPULAR_APPS = [
  { id: 'tiktok', name: 'TikTok', emoji: '🎵', defaultLimit: 30 },
  { id: 'instagram', name: 'Instagram', emoji: '📸', defaultLimit: 30 },
  { id: 'snapchat', name: 'Snapchat', emoji: '👻', defaultLimit: 20 },
  { id: 'twitter', name: 'X (Twitter)', emoji: '🐦', defaultLimit: 30 },
  { id: 'facebook', name: 'Facebook', emoji: '📘', defaultLimit: 20 },
  { id: 'youtube', name: 'YouTube', emoji: '📺', defaultLimit: 45 },
  { id: 'netflix', name: 'Netflix', emoji: '🎬', defaultLimit: 60 },
  { id: 'threads', name: 'Threads', emoji: '🧵', defaultLimit: 20 },
];

export default function LimitsSetupScreen() {
  const [selectedApps, setSelectedApps] = useState<Record<string, number>>({});

  const toggleApp = (appId: string, defaultLimit: number) => {
    setSelectedApps((prev) => {
      if (prev[appId] !== undefined) {
        const next = { ...prev };
        delete next[appId];
        return next;
      }
      return { ...prev, [appId]: defaultLimit };
    });
  };

  const updateLimit = (appId: string, minutes: number) => {
    setSelectedApps((prev) => ({ ...prev, [appId]: Math.max(5, minutes) }));
  };

  const handleContinue = () => {
    // Save limits to store
    router.push('/(auth)/setup/religion');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.step}>Step 1 of 3</Text>
        <Text style={styles.title}>Set App Limits</Text>
        <Text style={styles.subtitle}>
          Select apps to block and set daily time limits.
        </Text>
      </View>

      <ScrollView style={styles.appList} showsVerticalScrollIndicator={false}>
        {POPULAR_APPS.map((app) => {
          const isSelected = selectedApps[app.id] !== undefined;
          return (
            <View key={app.id} style={[styles.appRow, isSelected && styles.appRowSelected]}>
              <Pressable
                style={styles.appInfo}
                onPress={() => toggleApp(app.id, app.defaultLimit)}
              >
                <Text style={styles.appEmoji}>{app.emoji}</Text>
                <Text style={styles.appName}>{app.name}</Text>
              </Pressable>

              <View style={styles.appControls}>
                {isSelected && (
                  <View style={styles.limitControl}>
                    <Pressable
                      style={styles.limitBtn}
                      onPress={() => updateLimit(app.id, selectedApps[app.id] - 5)}
                    >
                      <Text style={styles.limitBtnText}>−</Text>
                    </Pressable>
                    <Text style={styles.limitText}>{selectedApps[app.id]}m</Text>
                    <Pressable
                      style={styles.limitBtn}
                      onPress={() => updateLimit(app.id, selectedApps[app.id] + 5)}
                    >
                      <Text style={styles.limitBtnText}>+</Text>
                    </Pressable>
                  </View>
                )}
                <Switch
                  value={isSelected}
                  onValueChange={() => toggleApp(app.id, app.defaultLimit)}
                  trackColor={{ true: Colors.PRIMARY, false: Colors.SECONDARY }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>Continue →</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(auth)/setup/religion')}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  step: {
    fontSize: Typography.sizes.sm,
    color: Colors.PRIMARY,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes['2xl'],
    color: Colors.TEXT_PRIMARY,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
  },
  appList: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.SURFACE,
    borderRadius: 10,
    marginBottom: Spacing.sm,
    borderWidth: 0.5,
    borderColor: 'transparent',
  },
  appRowSelected: {
    borderColor: Colors.PRIMARY,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appEmoji: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  appName: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    fontWeight: '500',
  },
  appControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  limitControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  limitBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  limitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  limitText: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'center',
  },
  footer: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  continueBtn: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 16,
    alignItems: 'center',
  },
  continueBtnText: {
    color: '#fff',
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
  },
  skipText: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
  },
});
