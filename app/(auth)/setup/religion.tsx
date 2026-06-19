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
import { useReligionStore } from '../../../src/stores/religionStore';
import { useSettingsStore } from '../../../src/stores/settingsStore';

const METHODS = ['MWL', 'ISNA', 'Egypt', 'Makkah', 'Tehran'] as const;

const FEATURES = [
  { key: 'prayerTracker', label: 'Prayer Tracker', icon: '🕌', description: 'Track 5 daily prayers' },
  { key: 'quranProgress', label: 'Quran Progress', icon: '📖', description: 'Track your Quran reading' },
  { key: 'dhikrCounter', label: 'Dhikr Counter', icon: '📿', description: 'Morning & evening adhkar' },
  { key: 'fastingTracker', label: 'Fasting Tracker', icon: '🌙', description: 'Voluntary fasts + Ramadan' },
  { key: 'morningAffirmation', label: 'Daily Affirmation', icon: '✨', description: 'Islamic ayah/hadith card' },
  { key: 'istighfarPrompt', label: 'Istighfar Prompt', icon: '🤲', description: 'Remind when goals failed' },
] as const;

export default function SetupReligionScreen() {
  const [method, setMethod] = useState<string>('Makkah');
  const [enabledFeatures, setEnabledFeatures] = useState<Set<string>>(new Set(FEATURES.map((f) => f.key)));

  const toggleFeature = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = new Set(enabledFeatures);
    if (next.has(key)) next.delete(key); else next.add(key);
    setEnabledFeatures(next);
  };

  const handleContinue = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    useReligionStore.getState().setCalculationMethod(method as any);
    useSettingsStore.getState().setReligionEnabled(enabledFeatures.size > 0);
    router.push('/setup/persona');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={styles.title}>Religion Settings</Text>
          <Text style={styles.subtitle}>Configure Islamic features</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <Text style={styles.sectionTitle}>Prayer Calculation Method</Text>
          <View style={styles.methodRow}>
            {METHODS.map((m) => (
              <Pressable key={m} style={[styles.methodBtn, method === m && styles.methodBtnActive]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMethod(m); }}>
                <Text style={[styles.methodText, method === m && styles.methodTextActive]}>{m}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <Text style={styles.sectionTitle}>Features</Text>
          {FEATURES.map((feature, i) => (
            <Card key={feature.key} style={styles.featureCard}>
              <Pressable style={styles.featureRow} onPress={() => toggleFeature(feature.key)}>
                <View style={[styles.featureCheckbox, enabledFeatures.has(feature.key) && styles.featureCheckboxActive]}>
                  {enabledFeatures.has(feature.key) && <Ionicons name="checkmark" size={Sizing.iconSm} color={Colors.TEXT_ON_PRIMARY} />}
                </View>
                <View style={styles.featureInfo}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <View>
                    <Text style={styles.featureLabel}>{feature.label}</Text>
                    <Text style={styles.featureDesc}>{feature.description}</Text>
                  </View>
                </View>
              </Pressable>
            </Card>
          ))}
        </Animated.View>

        <View style={styles.actions}>
          <Button title="Continue" onPress={handleContinue} size="lg" />
          <Button title="Skip" onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/setup/persona'); }} variant="ghost" size="md" />
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
  sectionTitle: { fontSize: Typography.sizes.lg, fontWeight: '600', color: Colors.TEXT_ON_SURFACE, marginBottom: Spacing.md },
  methodRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  methodBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.md, backgroundColor: Colors.SURFACE, borderWidth: 0.5, borderColor: `${Colors.PRIMARY_DARK}44` },
  methodBtnActive: { backgroundColor: Colors.PRIMARY, borderColor: Colors.PRIMARY },
  methodText: { fontSize: Typography.sizes.sm, color: Colors.TEXT_SECONDARY },
  methodTextActive: { color: Colors.TEXT_ON_PRIMARY, fontWeight: '600' },
  featureCard: { marginBottom: Spacing.sm },
  featureRow: { flexDirection: 'row', alignItems: 'center' },
  featureCheckbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: Colors.PRIMARY_LIGHT, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  featureCheckboxActive: { backgroundColor: Colors.SUCCESS, borderColor: Colors.SUCCESS },
  featureInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  featureIcon: { fontSize: 24, marginRight: Spacing.md },
  featureLabel: { fontSize: Typography.sizes.md, color: Colors.TEXT_ON_SURFACE, fontWeight: '500' },
  featureDesc: { fontSize: Typography.sizes.sm, color: Colors.TEXT_SECONDARY },
  actions: { marginTop: Spacing.xl, gap: Spacing.md },
});
