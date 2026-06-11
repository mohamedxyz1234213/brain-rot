import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { theme } from '../../constants/theme';

type SlotResult = 'unlock_15' | 'blocked_extra' | 'greyscale' | 'quran_first' | 'wait_respin';

interface SlotOutcome {
  symbols: string;
  label: string;
  result: SlotResult;
  probability: number;
}

const OUTCOMES: SlotOutcome[] = [
  { symbols: '🍋🍋🍋', label: '15 min unlocked!', result: 'unlock_15', probability: 0.08 },
  { symbols: '❌❌❌', label: 'Blocked + 10min tomorrow', result: 'blocked_extra', probability: 0.40 },
  { symbols: '😂😂😂', label: 'Greyscale + 0.75x speed', result: 'greyscale', probability: 0.20 },
  { symbols: '🕌🕌🕌', label: '5 min Quran first', result: 'quran_first', probability: 0.12 },
  { symbols: '⏰⏰⏰', label: 'Wait 10 min, re-spin', result: 'wait_respin', probability: 0.20 },
];

interface SlotMachineProps {
  islamicMode?: boolean;
  onResult: (result: SlotResult) => void;
}

function weightedRandom(): SlotOutcome {
  const rand = Math.random();
  let cumulative = 0;
  for (const outcome of OUTCOMES) {
    cumulative += outcome.probability;
    if (rand <= cumulative) return outcome;
  }
  return OUTCOMES[1]; // fallback to blocked
}

export function SlotMachine({ islamicMode = true, onResult }: SlotMachineProps) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SlotOutcome | null>(null);
  const spinAnim = useRef(new Animated.Value(0)).current;

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    Animated.sequence([
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(spinAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      let outcome = weightedRandom();
      // Remove Quran option if not Islamic mode
      if (!islamicMode && outcome.result === 'quran_first') {
        outcome = OUTCOMES[4]; // wait_respin instead
      }
      setResult(outcome);
      setSpinning(false);
      onResult(outcome.result);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎰 Doom Scroll Slot Machine</Text>
      <Text style={styles.subtitle}>Feeling lucky? Spin for a chance to unlock...</Text>

      <View style={styles.slotFrame}>
        {spinning ? (
          <Animated.Text
            style={[
              styles.symbols,
              {
                transform: [
                  {
                    translateY: spinAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, -20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            🎰 🎰 🎰
          </Animated.Text>
        ) : result ? (
          <Text style={styles.symbols}>{result.symbols}</Text>
        ) : (
          <Text style={styles.symbols}>? ? ?</Text>
        )}
      </View>

      {result && (
        <View
          style={[
            styles.resultBox,
            result.result === 'unlock_15' && styles.resultWin,
            result.result === 'blocked_extra' && styles.resultLose,
          ]}
        >
          <Text style={styles.resultText}>{result.label}</Text>
        </View>
      )}

      <Pressable
        style={[styles.spinBtn, spinning && styles.spinBtnDisabled]}
        onPress={spin}
        disabled={spinning}
      >
        <Text style={styles.spinBtnText}>
          {spinning ? 'Spinning...' : '🎲 SPIN'}
        </Text>
      </Pressable>

      <Text style={styles.odds}>
        Win chance: 8% • Lose: 40% • Meh: 52%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: theme.typography['2xl'],
    color: theme.colors.textPrimary,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: theme.typography.md,
    color: theme.colors.textSecondary,
    marginBottom: 32,
  },
  slotFrame: {
    width: 240,
    height: 100,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginBottom: 24,
  },
  symbols: {
    fontSize: 36,
    letterSpacing: 8,
  },
  resultBox: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    marginBottom: 24,
  },
  resultWin: {
    backgroundColor: `${theme.colors.success}22`,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  resultLose: {
    backgroundColor: `${theme.colors.danger}22`,
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  resultText: {
    fontSize: theme.typography.lg,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  spinBtn: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    marginBottom: 16,
  },
  spinBtnDisabled: {
    opacity: 0.5,
  },
  spinBtnText: {
    color: '#fff',
    fontSize: theme.typography.xl,
    fontWeight: '700',
  },
  odds: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
});
