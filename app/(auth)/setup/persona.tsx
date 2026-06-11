import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../../../src/constants/theme';

const PERSONAS = [
  {
    id: 'egyptian_dad',
    emoji: '🇪🇬',
    name: 'Egyptian Dad',
    description: 'Arabic roasts, disappointed tone, compares you to cousins',
    sample: '"يا ابني... ابن خالتك بقى دكتور وانت بتتفرج على تيك توك"',
  },
  {
    id: 'egyptian_mom',
    emoji: '🇪🇬',
    name: 'Egyptian Mom',
    description: 'Arabic, emotional guilt, love mixed with pain',
    sample: '"أنا ربيتك عشان تبقى حاجة... مش عشان تقعد على الموبايل"',
  },
  {
    id: 'future_self',
    emoji: '👻',
    name: 'Future Self (Age 45)',
    description: 'English, regretful, specific missed opportunities',
    sample: '"I\'m you at 45. Those hours on Instagram? They cost us everything."',
  },
  {
    id: 'drill_sergeant',
    emoji: '🪖',
    name: 'Drill Sergeant',
    description: 'English, all caps, military failure framing',
    sample: '"YOU THINK SCROLLING IS A HOBBY?! DROP AND GIVE ME 20 TASKS!"',
  },
  {
    id: 'sigmund_freud',
    emoji: '🧠',
    name: 'Sigmund Freud',
    description: 'English, psychoanalytical, clinical devastation',
    sample: '"Your compulsive phone checking reveals an unresolved attachment disorder."',
  },
  {
    id: 'david_goggins',
    emoji: '💪',
    name: 'David Goggins',
    description: 'English, stay-hard energy, calls you soft',
    sample: '"You\'re soft. Real soft. Put the phone down and callous your mind."',
  },
];

export default function PersonaSetupScreen() {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  const handleComplete = () => {
    // Save persona selection
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.step}>Step 3 of 3</Text>
        <Text style={styles.title}>Choose Your Roaster</Text>
        <Text style={styles.subtitle}>
          Pick who will hold you accountable when you slip up.
        </Text>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {PERSONAS.map((persona) => (
          <Pressable
            key={persona.id}
            style={[
              styles.personaCard,
              selectedPersona === persona.id && styles.personaCardSelected,
            ]}
            onPress={() => setSelectedPersona(persona.id)}
          >
            <View style={styles.personaHeader}>
              <Text style={styles.personaEmoji}>{persona.emoji}</Text>
              <View style={styles.personaInfo}>
                <Text style={styles.personaName}>{persona.name}</Text>
                <Text style={styles.personaDesc}>{persona.description}</Text>
              </View>
              {selectedPersona === persona.id && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedText}>✓</Text>
                </View>
              )}
            </View>
            <Text style={styles.sample}>{persona.sample}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.completeBtn, !selectedPersona && styles.completeBtnDisabled]}
          onPress={handleComplete}
          disabled={!selectedPersona}
        >
          <Text style={styles.completeBtnText}>Start My Recovery 🚀</Text>
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
  list: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  personaCard: {
    padding: Spacing.lg,
    backgroundColor: Colors.SURFACE,
    borderRadius: 12,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  personaCardSelected: {
    borderColor: Colors.PRIMARY,
    backgroundColor: `${Colors.PRIMARY}11`,
  },
  personaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  personaEmoji: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  personaInfo: {
    flex: 1,
  },
  personaName: {
    fontSize: Typography.sizes.lg,
    color: Colors.TEXT_PRIMARY,
    fontWeight: '600',
  },
  personaDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginTop: 2,
  },
  selectedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sample: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    fontStyle: 'italic',
    marginTop: Spacing.sm,
    paddingLeft: 44,
  },
  footer: {
    padding: Spacing.xl,
  },
  completeBtn: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 16,
    alignItems: 'center',
  },
  completeBtnDisabled: {
    opacity: 0.5,
  },
  completeBtnText: {
    color: '#fff',
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
  },
});
