import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../../../src/constants/theme';
import { Button } from '../../../src/components/ui/Button';
import { useXPStore } from '../../../src/stores/xpStore';

const PERSONAS = [
  { id: 'egyptian_dad', name: 'Egyptian Dad', icon: 'person-outline' },
  { id: 'egyptian_mom', name: 'Egyptian Mom', icon: 'heart-outline' },
  { id: 'future_self', name: 'Future Self (45)', icon: 'time-outline' },
  { id: 'drill_sergeant', name: 'Drill Sergeant', icon: 'shield-outline' },
  { id: 'sigmund_freud', name: 'Sigmund Freud', icon: 'hardware-chip-outline' },
  { id: 'david_goggins', name: 'David Goggins', icon: 'fitness-outline' },
];

export default function SetupPersonaScreen() {
  const handleContinue = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    useXPStore.getState().addXP(50, 'Setup completed');
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={styles.title}>Roast Personas</Text>
          <Text style={styles.subtitle}>You'll get roasted by a random persona each time. Mix it up!</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.infoCard}>
          <Ionicons name="shuffle-outline" size={48} color={Colors.PRIMARY} style={styles.shuffleIcon} />
          <Text style={styles.infoTitle}>Random Mix Mode</Text>
          <Text style={styles.infoText}>
            Instead of choosing one persona, you'll get a random mix of all 6 personas. Each roast comes from a different voice to keep you on your toes.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <Text style={styles.rosterTitle}>Your Roast Roster</Text>
          <View style={styles.personaGrid}>
            {PERSONAS.map((persona, i) => (
              <Animated.View key={persona.id} entering={FadeInDown.duration(300).delay(i * 60)}>
                <View style={styles.personaChip}>
                  <Ionicons name={persona.icon as React.ComponentProps<typeof Ionicons>['name']} size={20} color={Colors.PRIMARY} />
                  <Text style={styles.personaChipText}>{persona.name}</Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.actions}>
          <Button title="ابدأ — بنعالجك" onPress={handleContinue} size="lg" />
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
  infoCard: { backgroundColor: Colors.SURFACE, borderRadius: Radius.xl, padding: Spacing.xl, marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.PRIMARY_LIGHT, alignItems: 'center' },
  shuffleIcon: { marginBottom: Spacing.md },
  infoTitle: { fontSize: Typography.sizes.lg, fontWeight: '600', color: Colors.TEXT_ON_SURFACE, marginBottom: Spacing.sm, textAlign: 'center' },
  infoText: { fontSize: Typography.sizes.sm, color: Colors.TEXT_SECONDARY, lineHeight: 22, textAlign: 'center' },
  rosterTitle: { fontSize: Typography.sizes.md, fontWeight: '600', color: Colors.TEXT_ON_SURFACE, marginBottom: Spacing.md },
  personaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  personaChip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: Colors.SURFACE, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderWidth: 1, borderColor: Colors.BORDER },
  personaChipText: { fontSize: Typography.sizes.sm, color: Colors.TEXT_PRIMARY, fontWeight: '500' },
  actions: { marginTop: Spacing.xl },
});
