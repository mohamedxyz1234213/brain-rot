import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Sizing } from '../../src/constants/theme';
import { SafeScreen } from '../../src/components/ui';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';

const INTERVENTIONISTS = [
  { name: 'Dr. Amina', role: 'Psychologist', avatar: '👩‍⚕️', message: 'Your dopamine system is hijacked. Every scroll reinforces neural pathways that make the next scroll inevitable.' },
  { name: 'Coach Hassan', role: 'Discipline Coach', avatar: '🏋️', message: '3 bad days is a pattern. Patterns become habits. Habits become your identity. You\'re becoming the person who can\'t put the phone down.' },
  { name: 'Ustadh Khalid', role: 'Islamic Scholar', avatar: '📚', message: 'The Prophet ﷺ said: "A person will not be a true believer until he loves for his brother what he loves for himself." Your future self deserves better than this.' },
  { name: 'Future You (Age 45)', role: 'Your Older Self', avatar: '👻', message: 'I\'m writing this from a life of regret. The business never started. The relationships fell apart. All because I couldn\'t put the phone down.' },
  { name: 'Mama', role: 'Your Mother', avatar: '🤱', message: 'I didn\'t raise you to be a zombie. I sacrificed everything so you could build something. Not scroll something.' },
];

export default function InterventionModal() {
  const [step, setStep] = useState(0);
  const brainScore = 0;

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (step < INTERVENTIONISTS.length - 1) setStep(step + 1);
  };

  const handleDetox = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const handleWillDoBetter = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    router.back();
  };

  if (step < INTERVENTIONISTS.length) {
    const person = INTERVENTIONISTS[step];
    return (
      <SafeScreen style={{ backgroundColor: Colors.SURFACE }}>
        <Animated.View entering={FadeIn.duration(400)} style={styles.content}>
          <Text style={styles.stepIndicator}>Intervention #{step + 1} of {INTERVENTIONISTS.length}</Text>
          <Text style={styles.avatar}>{person.avatar}</Text>
          <Text style={styles.name}>{person.name}</Text>
          <Text style={styles.role}>{person.role}</Text>
          <Text style={styles.message}>{person.message}</Text>
          <View style={styles.actions}>
            <Button title={step < INTERVENTIONISTS.length - 1 ? "Next →" : "See Options"} onPress={handleNext} />
          </View>
        </Animated.View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen style={{ backgroundColor: Colors.SURFACE }}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.content}>
        <Text style={styles.finalEmoji}>⚠️</Text>
        <Text style={styles.finalTitle}>Choose Your Path</Text>
        <Text style={styles.finalSubtitle}>3 consecutive bad days triggered this intervention</Text>

        <Card style={styles.optionCard}>
          <Text style={styles.optionEmoji}>🚨</Text>
          <Text style={styles.optionTitle}>Emergency Detox Mode</Text>
          <Text style={styles.optionDesc}>24hr hard block on all social media</Text>
          <Button title="Activate Detox" onPress={handleDetox} variant="danger" size="lg" />
        </Card>

        <Pressable style={styles.betterBtn} onPress={handleWillDoBetter} accessibilityRole="button" accessibilityLabel="I will do better">
          <Text style={styles.betterText}>I'll do better</Text>
        </Pressable>
      </Animated.View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: Spacing.xl, justifyContent: 'center' },
  stepIndicator: { fontSize: Typography.sizes.sm, color: Colors.TEXT_SECONDARY, textAlign: 'center', marginBottom: Spacing.xl },
  avatar: { fontSize: Sizing.avatarMd, textAlign: 'center', marginBottom: Spacing.lg },
  name: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.bold, color: Colors.TEXT_PRIMARY, textAlign: 'center' },
  role: { fontSize: Typography.sizes.md, color: Colors.TEXT_SECONDARY, textAlign: 'center', marginBottom: Spacing.xl },
  message: { fontSize: Typography.sizes.lg, color: Colors.TEXT_PRIMARY, textAlign: 'center', lineHeight: Typography.lineHeight.relaxed, marginBottom: Spacing.xl },
  actions: { alignItems: 'center' },
  finalEmoji: { fontSize: Sizing.avatarMd, textAlign: 'center', marginBottom: Spacing.lg },
  finalTitle: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.bold, color: Colors.TEXT_PRIMARY, textAlign: 'center', marginBottom: Spacing.sm },
  finalSubtitle: { fontSize: Typography.sizes.md, color: Colors.TEXT_SECONDARY, textAlign: 'center', marginBottom: Spacing.xl },
  optionCard: { alignItems: 'center', marginBottom: Spacing.xl },
  optionEmoji: { fontSize: 48, marginBottom: Spacing.md },
  optionTitle: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.semibold, color: Colors.TEXT_PRIMARY, textAlign: 'center', marginBottom: Spacing.xs },
  optionDesc: { fontSize: Typography.sizes.md, color: Colors.TEXT_SECONDARY, textAlign: 'center', marginBottom: Spacing.lg },
  betterBtn: { paddingVertical: Spacing.lg, alignItems: 'center' },
  betterText: { fontSize: Typography.sizes.md, color: Colors.TEXT_SECONDARY },
});
