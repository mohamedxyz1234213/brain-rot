import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../constants/theme';

interface DhikrItem {
  arabic: string;
  transliteration: string;
  translation: string;
  count: number;
}

interface DhikrCounterProps {
  item: DhikrItem;
  currentCount: number;
  onTap: () => void;
  onComplete: () => void;
}

export function DhikrCounter({ item, currentCount, onTap, onComplete }: DhikrCounterProps) {
  const progress = currentCount / item.count;
  const isComplete = currentCount >= item.count;

  return (
    <View style={styles.container}>
      <Text style={styles.arabic}>{item.arabic}</Text>
      <Text style={styles.transliteration}>{item.transliteration}</Text>
      <Text style={styles.translation}>{item.translation}</Text>

      <View style={styles.counterSection}>
        <Text style={styles.count}>
          {currentCount} / {item.count}
        </Text>

        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(progress * 100, 100)}%` },
              isComplete && styles.progressComplete,
            ]}
          />
        </View>
      </View>

      <Pressable
        style={[styles.tapBtn, isComplete && styles.tapBtnComplete]}
        onPress={isComplete ? onComplete : onTap}
      >
        <Text style={styles.tapBtnText}>
          {isComplete ? '✓ Next' : 'Tap'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
  },
  arabic: {
    fontSize: 28,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Amiri',
    lineHeight: 44,
  },
  transliteration: {
    fontSize: theme.typography.md,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  translation: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  counterSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  count: {
    fontSize: theme.typography.xl,
    color: theme.colors.textPrimary,
    fontWeight: '700',
    marginBottom: 8,
    fontVariant: ['tabular-nums'],
  },
  progressBg: {
    width: '100%',
    height: 6,
    backgroundColor: `${theme.colors.secondary}33`,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  progressComplete: {
    backgroundColor: theme.colors.success,
  },
  tapBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tapBtnComplete: {
    backgroundColor: theme.colors.success,
  },
  tapBtnText: {
    color: '#fff',
    fontSize: theme.typography.xl,
    fontWeight: '700',
  },
});
