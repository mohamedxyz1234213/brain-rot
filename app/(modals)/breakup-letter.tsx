import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../../src/constants/theme';

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
    <View style={styles.container}>
      <Pressable style={styles.closeBtn} onPress={() => router.back()}>
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
          <Pressable style={styles.winBackBtn}>
            <Text style={styles.winBackText}>Win It Back 💪</Text>
            <Text style={styles.winBackSubtext}>3 micro-tasks to restart</Text>
          </Pressable>
          <Pressable style={styles.letGoBtn} onPress={() => router.back()}>
            <Text style={styles.letGoText}>Let It Go 🕊️</Text>
          </Pressable>
        </View>
      )}

      {!showActions && charIndex < personalizedLetter.length && (
        <Pressable
          style={styles.skipBtn}
          onPress={() => setCharIndex(personalizedLetter.length)}
        >
          <Text style={styles.skipText}>Skip →</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  closeBtn: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    color: Colors.TEXT_SECONDARY,
  },
  letterContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 80,
  },
  letterEmoji: {
    fontSize: 40,
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
    borderRadius: 16,
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
    paddingBottom: 48,
    gap: Spacing.md,
  },
  winBackBtn: {
    paddingVertical: 16,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 16,
    alignItems: 'center',
  },
  winBackText: {
    color: '#fff',
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
  },
  winBackSubtext: {
    color: `${'#fff'}99`,
    fontSize: Typography.sizes.sm,
    marginTop: 4,
  },
  letGoBtn: {
    paddingVertical: 12,
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
