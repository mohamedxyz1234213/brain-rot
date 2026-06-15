import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Sizing } from '../../src/constants/theme';
import { SafeScreen } from '../../src/components/ui';

const LETTER = `Dear ${'{name}'},

I've been waiting for you. For 7 days, actually.

Remember when you created me? You were so excited. You said "This is it. This is the task that changes everything."

But you never came back.

I watched you open Instagram instead. I watched you "just check" TikTok. I waited through 3 "I'll start tomorrow" promises.

I'm tired of waiting.

I deserve someone who shows up. Someone who cares enough to even try.

So this is goodbye. Unless...

Unless you can prove me wrong. Right now.

With love (and disappointment),
Your Abandoned Goal 💔`;

export default function BreakupLetterScreen() {
  const [displayedText, setDisplayedText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [showActions, setShowActions] = useState(false);

  const personalizedLetter = LETTER.replace('{name}', 'there');

  useEffect(() => {
    if (charIndex < personalizedLetter.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(personalizedLetter.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 30);
      return () => clearTimeout(timeout);
    } else {
      setShowActions(true);
    }
  }, [charIndex]);

  return (
    <SafeScreen>
      <View style={{ flex: 1 }}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close">
          <Text style={styles.closeText}>✕</Text>
        </Pressable>

        <View style={styles.letterContainer}>
          <Text style={styles.letterEmoji}>💔</Text>
          <Text style={styles.letterTitle}>A Letter From Your Goal</Text>

          <View style={styles.paper}>
            <Text style={styles.letterText}>{displayedText}</Text>
            {charIndex < personalizedLetter.length && (
              <Text style={styles.cursor}>▌</Text>
            )}
          </View>
        </View>

        {showActions && (
          <View style={styles.actions}>
            <Pressable style={styles.winBackBtn} accessibilityRole="button" accessibilityLabel="Win it back">
              <Text style={styles.winBackText}>Win It Back 💪</Text>
              <Text style={styles.winBackSubtext}>3 micro-tasks to restart</Text>
            </Pressable>
            <Pressable style={styles.letGoBtn} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Let it go">
              <Text style={styles.letGoText}>Let It Go 🕊️</Text>
            </Pressable>
          </View>
        )}

        {!showActions && charIndex < personalizedLetter.length && (
          <Pressable
            style={styles.skipBtn}
            onPress={() => setCharIndex(personalizedLetter.length)}
            accessibilityRole="button"
            accessibilityLabel="Skip"
          >
            <Text style={styles.skipText}>Skip →</Text>
          </Pressable>
        )}
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  closeBtn: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.xl,
    zIndex: 10,
    padding: Spacing.sm,
  },
  closeText: {
    fontSize: Typography.sizes.xl,
    color: Colors.TEXT_SECONDARY,
  },
  letterContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['2xl'],
  },
  letterEmoji: {
    fontSize: Sizing.avatarSm,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  letterTitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  paper: {
    backgroundColor: Colors.SURFACE,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    borderWidth: 0.5,
    borderColor: `${Colors.DANGER}33`,
  },
  letterText: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  cursor: {
    color: Colors.DANGER,
    fontSize: Typography.sizes.md,
  },
  actions: {
    padding: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.md,
  },
  winBackBtn: {
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.PRIMARY,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  winBackText: {
    color: Colors.TEXT_ON_PRIMARY,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
  },
  winBackSubtext: {
    color: `${Colors.TEXT_ON_PRIMARY}99`,
    fontSize: Typography.sizes.sm,
    marginTop: Spacing.xs,
  },
  letGoBtn: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  letGoText: {
    color: Colors.TEXT_SECONDARY,
    fontSize: Typography.sizes.md,
  },
  skipBtn: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  skipText: {
    color: Colors.TEXT_SECONDARY,
    fontSize: Typography.sizes.md,
  },
});
