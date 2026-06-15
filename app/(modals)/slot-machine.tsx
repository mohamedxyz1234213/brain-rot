import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Sizing } from '../../src/constants/theme';
import { SafeScreen } from '../../src/components/ui';
import { Button } from '../../src/components/ui/Button';

export default function SlotMachineModal() {
  const [result, setResult] = React.useState<string | null>(null);
  const [spinning, setSpinning] = React.useState(false);

  const spin = () => {
    setSpinning(true);
    setTimeout(() => {
      const rand = Math.random() * 100;
      if (rand < 8) setResult('🍋🍋🍋');
      else if (rand < 48) setResult('❌❌❌');
      else if (rand < 68) setResult('😂😂😂');
      else if (rand < 80) setResult('🕌🕌🕌');
      else setResult('⏰⏰⏰');
      setSpinning(false);
    }, 2000);
  };

  return (
    <SafeScreen>
      <View style={styles.content}>
        <Text style={styles.title}>Doom Scroll Slot Machine</Text>
        <Text style={styles.subtitle}>Feeling lucky? Spin for a chance...</Text>

        <View style={styles.reels}>
          <Text style={styles.reel}>{spinning ? '❓' : result ? result[0] : '🎰'}</Text>
          <Text style={styles.reel}>{spinning ? '❓' : result ? result[1] : '🎰'}</Text>
          <Text style={styles.reel}>{spinning ? '❓' : result ? result[2] : '🎰'}</Text>
        </View>

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
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  title: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.bold, color: Colors.TEXT_PRIMARY, marginBottom: Spacing.sm },
  subtitle: { fontSize: Typography.sizes.md, color: Colors.TEXT_SECONDARY, marginBottom: Spacing['2xl'] },
  reels: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing['2xl'] },
  reel: { fontSize: Sizing.avatarMd, backgroundColor: Colors.SURFACE, padding: Spacing.lg, borderRadius: Radius.lg, overflow: 'hidden' },
  resultText: { fontSize: Typography.sizes.lg, color: Colors.WARNING, textAlign: 'center', marginBottom: Spacing.xl },
});
