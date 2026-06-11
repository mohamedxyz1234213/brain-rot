import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';

const INTERVENTIONISTS = [
  { name: 'Your Best Friend', avatar: '👤', message: "Bro, we haven't hung out in weeks. You're always on your phone. I miss you." },
  { name: 'Your Future Daughter', avatar: '👧', message: "Dad, why are you always looking at your phone? Can you play with me?" },
  { name: 'Your Doctor', avatar: '👨‍⚕️', message: "Your anxiety and sleep issues? Directly correlated with screen time. I've seen it a hundred times." },
  { name: 'Your Teacher', avatar: '👩‍🏫', message: "You had so much potential. I remember telling your parents you'd go far. What happened?" },
  { name: 'Your Imam', avatar: '🕌', message: "Time is an Amanah. Every second you waste, you'll be asked about. Are you ready for that conversation?" },
];

export default function InterventionModal() {
  const [step, setStep] = React.useState(0);

  if (step < INTERVENTIONISTS.length) {
    const person = INTERVENTIONISTS[step];
    return (
      <View style={styles.container}>
        <Text style={styles.badge}>INTERVENTION</Text>
        <Text style={styles.avatar}>{person.avatar}</Text>
        <Text style={styles.name}>{person.name}</Text>
        <Text style={styles.message}>"{person.message}"</Text>
        <Button title="Next" onPress={() => setStep(step + 1)} style={styles.nextBtn} />
      </View>
    );
  }

  // Final screen
  return (
    <View style={styles.container}>
      <Text style={styles.finalEmoji}>🆘</Text>
      <Text style={styles.finalTitle}>3 Bad Days in a Row</Text>
      <Text style={styles.finalSubtitle}>
        This is your intervention. Your brain needs help. Choose your path:
      </Text>

      <Card style={styles.detoxCard}>
        <Text style={styles.detoxTitle}>🧊 Emergency Detox Mode</Text>
        <Text style={styles.detoxDesc}>24-hour hard block on ALL social media. No exceptions.</Text>
        <Button title="Activate Detox" onPress={() => router.back()} variant="danger" />
      </Card>

      <Button title="I'll do better" onPress={() => router.back()} variant="ghost" style={styles.softBtn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  badge: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: Colors.DANGER,
    letterSpacing: 2,
    marginBottom: Spacing.xl,
  },
  avatar: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  name: {
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginBottom: Spacing.md,
  },
  message: {
    fontSize: Typography.sizes.xl,
    color: Colors.TEXT_PRIMARY,
    textAlign: 'center',
    lineHeight: 30,
    fontStyle: 'italic',
  },
  nextBtn: {
    position: 'absolute',
    bottom: 60,
    width: '80%',
  },
  finalEmoji: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  finalTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: '700',
    color: Colors.DANGER,
    marginBottom: Spacing.sm,
  },
  finalSubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  detoxCard: {
    width: '100%',
    borderColor: Colors.DANGER,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.md,
  },
  detoxTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  detoxDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
  },
  softBtn: {
    marginTop: Spacing.lg,
  },
});
