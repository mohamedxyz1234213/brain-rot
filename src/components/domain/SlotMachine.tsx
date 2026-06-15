import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Radius, ANIMATION } from '../../constants/theme';

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
  return OUTCOMES[1];
}

export function SlotMachine({ islamicMode = true, onResult }: SlotMachineProps) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SlotOutcome | null>(null);
  const shakeAnim = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnim.value }],
  }));

  const spin = () => {
    if (spinning) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setSpinning(true);
    setResult(null);

    shakeAnim.value = withSequence(
      withTiming(-10, { duration: 100 }),
      withTiming(10, { duration: 100 }),
      withTiming(-5, { duration: 100 }),
      withTiming(0, { duration: 100 }),
    );

    setTimeout(() => {
      let outcome = weightedRandom();
      if (!islamicMode && outcome.result === 'quran_first') {
        outcome = OUTCOMES[4];
      }
      setResult(outcome);
      setSpinning(false);

      if (outcome.result === 'blocked_extra') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (outcome.result === 'unlock_15') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      onResult(outcome.result);
    }, 1500);
  };

  return (
    <Animated.View entering={FadeIn.duration(400)} style={[styles.container, animatedStyle]}>
      <Text style={styles.title}>🎰 Doom Scroll Slot Machine</Text>
      <Text style={styles.subtitle}>Feeling lucky? Spin for a chance to unlock...</Text>

      <View style={styles.slotFrame}>
        {spinning ? (
          <Text style={styles.spinningSymbols}>🎰 🎰 🎰</Text>
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

      <Text style={styles.odds}>Win: 8% • Lose: 40% • Meh: 52%</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: Spacing.xl },
  title: { fontSize: Typography.sizes['2xl'], color: Colors.TEXT_PRIMARY, fontWeight: '700', marginBottom: Spacing.sm },
  subtitle: { fontSize: Typography.sizes.md, color: Colors.TEXT_SECONDARY, marginBottom: Spacing['2xl'] },
  slotFrame: {
    width: 240, height: 100,
    backgroundColor: Colors.SURFACE, borderRadius: Radius.lg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.PRIMARY, marginBottom: Spacing.xl,
  },
  spinningSymbols: { fontSize: 36, letterSpacing: 8 },
  symbols: { fontSize: 36, letterSpacing: 8 },
  resultBox: {
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderRadius: Radius.md, backgroundColor: Colors.SURFACE, marginBottom: Spacing.xl,
  },
  resultWin: { backgroundColor: `${Colors.SUCCESS}22`, borderWidth: 1, borderColor: Colors.SUCCESS },
  resultLose: { backgroundColor: `${Colors.DANGER}22`, borderWidth: 1, borderColor: Colors.DANGER },
  resultText: { fontSize: Typography.sizes.lg, color: Colors.TEXT_PRIMARY, fontWeight: '600' },
  spinBtn: {
    paddingHorizontal: 48, paddingVertical: Spacing.lg,
    backgroundColor: Colors.PRIMARY, borderRadius: Radius.lg, marginBottom: Spacing.md,
  },
  spinBtnDisabled: { opacity: 0.5 },
  spinBtnText: { color: '#fff', fontSize: Typography.sizes.xl, fontWeight: '700' },
  odds: { fontSize: Typography.sizes.sm, color: Colors.TEXT_SECONDARY },
});

export type { SlotResult };
