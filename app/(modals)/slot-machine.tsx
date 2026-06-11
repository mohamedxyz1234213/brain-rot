import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { Button } from '../../src/components/ui/Button';

export default function SlotMachineModal() {
  const [result, setResult] = React.useState<string | null>(null);
  const [spinning, setSpinning] = React.useState(false);

  const spin = () => {
    setSpinning(true);
    setTimeout(() => {
      // Weighted random outcome
      const rand = Math.random() * 100;
      if (rand < 8) setResult('🍋🍋🍋'); // 8% — 15 min unlocked
      else if (rand < 48) setResult('❌❌❌'); // 40% — blocked + penalty
      else if (rand < 68) setResult('😂😂😂'); // 20% — greyscale
      else if (rand < 80) setResult('🕌🕌🕌'); // 12% — Quran first
      else setResult('⏰⏰⏰'); // 20% — wait and re-spin
      setSpinning(false);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Doom Scroll Slot Machine</Text>
      <Text style={styles.subtitle}>Feeling lucky? Spin for a chance...</Text>

      {/* Reels */}
      <View style={styles.reels}>
        <Text style={styles.reel}>{spinning ? '❓' : result ? result[0] : '🎰'}</Text>
        <Text style={styles.reel}>{spinning ? '❓' : result ? result[1] : '🎰'}</Text>
        <Text style={styles.reel}>{spinning ? '❓' : result ? result[2] : '🎰'}</Text>
      </View>

      {/* Result message */}
      {result && (
        <Text style={styles.resultText}>
          {result === '🍋🍋🍋' && '15 minutes unlocked! Use them wisely.'}
          {result === '❌❌❌' && 'Blocked! +10 min added to tomorrow\'s limit.'}
          {result === '😂😂😂' && 'Unlocked in greyscale at 0.75x speed. Enjoy.'}
          {result === '🕌🕌🕌' && '5 minutes of Quran first, then we\'ll talk.'}
          {result === '⏰⏰⏰' && 'Wait 10 minutes, then spin again.'}
        </Text>
      )}

      {!result ? (
        <Button title={spinning ? 'Spinning...' : 'SPIN'} onPress={spin} disabled={spinning} size="lg" />
      ) : (
        <Button title="Done" onPress={() => router.back()} variant="secondary" />
      )}
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
  title: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    marginBottom: Spacing['2xl'],
  },
  reels: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing['2xl'],
  },
  reel: {
    fontSize: 64,
    backgroundColor: Colors.SURFACE,
    padding: Spacing.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  resultText: {
    fontSize: Typography.sizes.lg,
    color: Colors.WARNING,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
});
