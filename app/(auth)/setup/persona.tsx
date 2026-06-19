import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../../../src/constants/theme';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { useSettingsStore } from '../../../src/stores/settingsStore';
import { useXPStore } from '../../../src/stores/xpStore';
import { useAuthStore } from '../../../src/stores/authStore';

const PERSONAS = [
  { id: 'egyptian_dad', name: 'Egyptian Dad', icon: 'person-outline', sample: '"أنت مش ابن العيلة، ابن خالتك بقى طبيب وانت بقى... سكران على الموبايل."' },
  { id: 'egyptian_mom', name: 'Egyptian Mom', icon: 'heart-outline', sample: '"أنا عيني وجعتني من العياط عليك. ده انا ماما ولا ده حياتي كلها حاجة."' },
  { id: 'future_self', name: 'Future Self (45)', icon: 'time-outline', sample: '"I wish I could tell you to put the phone down. The life you\'re building right now is the one I\'m living."' },
  { id: 'drill_sergeant', name: 'Drill Sergeant', icon: 'shield-outline', sample: '"DROP THE PHONE AND GIVE ME 20! YOUR DOPAMINE IS COMPROMISED SOLDIER!"' },
  { id: 'sigmund_freud', name: 'Sigmund Freud', icon: 'hardware-chip-outline', sample: '"Your scrolling is a manifestation of unresolved Oedipal desire for maternal validation."' },
  { id: 'david_goggins', name: 'David Goggins', icon: 'fitness-outline', sample: '"You\'re staying soft. WHILE YOU SCROLL, I DID 1000 PUSHUPS. STAY HARD."' },
];

export default function SetupPersonaScreen() {
  const [selectedPersona, setSelectedPersona] = useState<string>('');

  const handleSelect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedPersona(id);
  };

  const handleContinue = () => {
    if (!selectedPersona) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    useSettingsStore.getState().setRoastPersona(selectedPersona);
    useXPStore.getState().addXP(50, 'Setup completed');
    const auth = useAuthStore.getState();
    if (!auth.isAuthenticated) {
      auth.setUser({
        id: `user_${Date.now()}`,
        clerkId: `clerk_${Date.now()}`,
        name: 'User',
        email: 'user@brainrot.local',
        brainScore: 0,
        xp: 0,
        level: 'Zombie',
        streakDays: 0,
        roastPersona: selectedPersona,
        language: useSettingsStore.getState().language,
        religionEnabled: useSettingsStore.getState().religionEnabled,
        subscriptionTier: 'free',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    router.replace('/(tabs)');
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    useSettingsStore.getState().setRoastPersona('drill_sergeant');
    const auth = useAuthStore.getState();
    if (!auth.isAuthenticated) {
      auth.setUser({
        id: `user_${Date.now()}`,
        clerkId: `clerk_${Date.now()}`,
        name: 'User',
        email: 'user@brainrot.local',
        brainScore: 0,
        xp: 0,
        level: 'Zombie',
        streakDays: 0,
        roastPersona: 'drill_sergeant',
        language: useSettingsStore.getState().language,
        religionEnabled: useSettingsStore.getState().religionEnabled,
        subscriptionTier: 'free',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={styles.title}>Choose Your Roast Persona</Text>
          <Text style={styles.subtitle}>Who will roast you when you fail?</Text>
        </Animated.View>

        {PERSONAS.map((persona, i) => (
          <Animated.View key={persona.id} entering={FadeInDown.duration(300).delay(i * 80)}>
            <Pressable style={[styles.personaCard, selectedPersona === persona.id && styles.personaCardActive]} onPress={() => handleSelect(persona.id)}>
              <Ionicons name={persona.icon as React.ComponentProps<typeof Ionicons>['name']} size={32} color={Colors.PRIMARY} style={styles.personaIcon} />
              <Text style={styles.personaName}>{persona.name}</Text>
              <Text style={styles.personaSample}>{persona.sample}</Text>
            </Pressable>
          </Animated.View>
        ))}

        <View style={styles.actions}>
          <Button title="Start Healing" onPress={handleContinue} size="lg" disabled={!selectedPersona} />
          <Button title="Skip" onPress={handleSkip} variant="ghost" size="md" />
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
  personaCard: { backgroundColor: Colors.SURFACE, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.md, borderWidth: 0.5, borderColor: `${Colors.PRIMARY_DARK}44` },
  personaCardActive: { borderColor: Colors.PRIMARY_LIGHT, borderWidth: 2 },
  personaIcon: { marginBottom: Spacing.sm },
  personaName: { fontSize: Typography.sizes.lg, fontWeight: '600', color: Colors.TEXT_ON_SURFACE, marginBottom: Spacing.sm },
  personaSample: { fontSize: Typography.sizes.sm, color: Colors.TEXT_SECONDARY, lineHeight: 20 },
  actions: { marginTop: Spacing.xl, gap: Spacing.md },
});
