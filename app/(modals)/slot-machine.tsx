import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Sizing, Shadow, LetterSpacing } from '../../src/constants/theme';
import { SafeScreen } from '../../src/components/ui';
import { Button } from '../../src/components/ui/Button';

type SlotResult = 'unlock' | 'blocked' | 'greyscale' | 'quran' | 'wait';

const RESULT_ICONS: Record<SlotResult, React.ComponentProps<typeof Ionicons>['name']> = {
  unlock: 'nutrition-outline',
  blocked: 'close-outline',
  greyscale: 'happy-outline',
  quran: 'moon-outline',
  wait: 'time-outline',
};

export default function SlotMachineModal() {
  const [result, setResult] = React.useState<SlotResult | null>(null);
  const [spinning, setSpinning] = React.useState(false);

  const spin = () => {
    setSpinning(true);
    setTimeout(() => {
      const rand = Math.random() * 100;
      if (rand < 8) setResult('unlock');
      else if (rand < 48) setResult('blocked');
      else if (rand < 68) setResult('greyscale');
      else if (rand < 80) setResult('quran');
      else setResult('wait');
      setSpinning(false);
    }, 2000);
  };

  return (
    <SafeScreen>
      <View style={styles.content}>
        <Text style={styles.title}>Doom Scroll Slot Machine</Text>
        <Text style={styles.subtitle}>Feeling lucky? Spin for a chance...</Text>

        <View style={styles.reels}>
          {[0, 1, 2].map((slot) => (
            <View key={slot} style={styles.reel}>
              <Ionicons name={spinning ? 'help-outline' : result ? RESULT_ICONS[result] : 'dice-outline'} size={Sizing.avatarSm} color={Colors.PRIMARY} />
            </View>
          ))}
        </View>

        {result && (
          <Text style={styles.resultText}>
            {result === 'unlock' && '15 minutes unlocked! Use them wisely.'}
            {result === 'blocked' && 'Blocked! +10 min added to tomorrow\'s limit.'}
            {result === 'greyscale' && 'Unlocked in greyscale at 0.75x speed. Enjoy.'}
            {result === 'quran' && '5 minutes of Quran first, then we\'ll talk.'}
            {result === 'wait' && 'Wait 10 minutes, then spin again.'}
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
  title: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.bold, color: Colors.TEXT_PRIMARY, marginBottom: Spacing.sm, letterSpacing: LetterSpacing.tight, textAlign: 'center' },
  subtitle: { fontSize: Typography.sizes.md, color: Colors.TEXT_SECONDARY, marginBottom: Spacing['2xl'] },
  reels: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing['2xl'] },
  reel: { width: 74, height: 74, backgroundColor: Colors.SURFACE, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.BORDER, ...Shadow.sm },
  resultText: { fontSize: Typography.sizes.lg, color: Colors.WARNING, textAlign: 'center', marginBottom: Spacing.xl },
});
