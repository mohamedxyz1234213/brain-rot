import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { Button } from '../../src/components/ui/Button';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🧠</Text>
        <Text style={styles.title}>BrainRot Healer</Text>
        <Text style={styles.subtitle}>
          Recover from social media addiction.{'\n'}
          Get roasted when you fail.{'\n'}
          Gamify your recovery.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button title="Get Started" onPress={() => router.push('/(auth)/sign-up')} size="lg" />
        <Button
          title="I already have an account"
          onPress={() => router.push('/(auth)/sign-in')}
          variant="ghost"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    justifyContent: 'space-between',
    padding: Spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: '800',
    color: Colors.TEXT_PRIMARY,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 26,
  },
  actions: {
    gap: Spacing.md,
    paddingBottom: Spacing['2xl'],
  },
});
