import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Sizing } from '../../../src/constants/theme';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { useScreenTimeStore } from '../../../src/stores/screenTimeStore';

const POPULAR_APPS = [
  { bundleId: 'com.zhiliaoapp.musically', name: 'TikTok', icon: 'musical-notes-outline' },
  { bundleId: 'com.instagram.android', name: 'Instagram', icon: 'camera-outline' },
  { bundleId: 'com.twitter.android', name: 'X/Twitter', icon: 'at-outline' },
  { bundleId: 'com.snapchat.android', name: 'Snapchat', icon: 'chatbubble-ellipses-outline' },
  { bundleId: 'com.google.android.youtube', name: 'YouTube', icon: 'play-outline' },
  { bundleId: 'com.facebook.katana', name: 'Facebook', icon: 'person-outline' },
  { bundleId: 'com.netflix.mediaclient', name: 'Netflix', icon: 'film-outline' },
  { bundleId: 'com.whatsapp', name: 'WhatsApp', icon: 'chatbubble-outline' },
];

export default function SetupLimitsScreen() {
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [limits, setLimits] = useState<Record<string, number>>({});

  const toggleApp = (bundleId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = new Set(selectedApps);
    if (next.has(bundleId)) { next.delete(bundleId); setLimits((p) => { const n = { ...p }; delete n[bundleId]; return n; }); }
    else { next.add(bundleId); setLimits((p) => ({ ...p, [bundleId]: 30 })); }
    setSelectedApps(next);
  };

  const adjustLimit = (bundleId: string, delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLimits((p) => ({ ...p, [bundleId]: Math.max(5, Math.min(120, (p[bundleId] ?? 30) + delta)) }));
  };

  const handleContinue = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const addLimit = useScreenTimeStore.getState().addLimit;
    for (const bundleId of selectedApps) {
      const app = POPULAR_APPS.find((a) => a.bundleId === bundleId);
      if (app) {
        addLimit({ userId: 'current_user', appBundleId: app.bundleId, appName: app.name, dailyLimitMinutes: limits[bundleId] ?? 30, isEnabled: true, isHardBlock: false });
      }
    }
    router.push('/setup/religion');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={styles.title}>Set App Limits</Text>
          <Text style={styles.subtitle}>Which apps steal your time? Set daily limits.</Text>
        </Animated.View>

        {POPULAR_APPS.map((app, i) => (
          <Animated.View key={app.bundleId} entering={FadeInDown.duration(300).delay(i * 50)}>
            <Card style={styles.appCard}>
              <View style={styles.appRow}>
                <Pressable style={styles.appSelect} onPress={() => toggleApp(app.bundleId)}>
                  <View style={[styles.checkbox, selectedApps.has(app.bundleId) && styles.checkboxActive]}>
                    {selectedApps.has(app.bundleId) && <Ionicons name="checkmark" size={Sizing.iconSm} color={Colors.TEXT_ON_PRIMARY} />}
                  </View>
                  <Ionicons name={app.icon as React.ComponentProps<typeof Ionicons>['name']} size={22} color={Colors.PRIMARY} style={styles.appIcon} />
                  <Text style={styles.appName}>{app.name}</Text>
                </Pressable>
                {selectedApps.has(app.bundleId) && (
                  <View style={styles.limitControls}>
                    <Pressable style={styles.limitBtn} onPress={() => adjustLimit(app.bundleId, -5)}>
                      <Text style={styles.limitBtnText}>-</Text>
                    </Pressable>
                    <Text style={styles.limitValue}>{limits[app.bundleId] ?? 30} min</Text>
                    <Pressable style={styles.limitBtn} onPress={() => adjustLimit(app.bundleId, 5)}>
                      <Text style={styles.limitBtnText}>+</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </Card>
          </Animated.View>
        ))}

        <View style={styles.actions}>
          <Button title="Continue" onPress={handleContinue} size="lg" />
          <Button title="Skip" onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/setup/religion'); }} variant="ghost" size="md" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BACKGROUND },
  content: { padding: Spacing.xl },
  title: { fontSize: Typography.sizes['2xl'], fontWeight: '700', color: Colors.TEXT_ON_SURFACE, marginBottom: Spacing.sm },
  subtitle: { fontSize: Typography.sizes.md, color: Colors.TEXT_SECONDARY, marginBottom: Spacing.xl },
  appCard: { marginBottom: Spacing.sm },
  appRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  appSelect: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: Colors.PRIMARY_LIGHT, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  checkboxActive: { backgroundColor: Colors.SUCCESS, borderColor: Colors.SUCCESS },
  appIcon: { marginRight: Spacing.sm },
  appName: { fontSize: Typography.sizes.md, color: Colors.TEXT_ON_SURFACE, fontWeight: '500' },
  limitControls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  limitBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.SURFACE_RAISED, alignItems: 'center', justifyContent: 'center' },
  limitBtnText: { fontSize: 18, color: Colors.TEXT_ON_SURFACE },
  limitValue: { fontSize: Typography.sizes.md, color: Colors.TEXT_ON_SURFACE, fontWeight: '600' },
  actions: { marginTop: Spacing.xl, gap: Spacing.md },
});
