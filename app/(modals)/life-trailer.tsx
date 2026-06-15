import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme';
import { SafeScreen } from '../../src/components/ui';

const TRAILER_TEXT = `LAST MONTH...

You unlocked your phone 1,847 times.

You scrolled the height of the Eiffel Tower... twice.

But then something changed.

You blocked TikTok. You completed 67 tasks.
You prayed 5 times a day for 18 straight days.

Your Brain Score went from 34 to 78.

From Zombie... to Healing.

This isn't just recovery.
This is your origin story.

BRAINROT HEALER
Chapter 2 begins now.`;

export default function LifeTrailerScreen() {
  const [displayedText, setDisplayedText] = useState('');
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (charIndex < TRAILER_TEXT.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(TRAILER_TEXT.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 40);
      return () => clearTimeout(timeout);
    }
  }, [charIndex]);

  return (
    <SafeScreen style={{ backgroundColor: Colors.BLACK }}>
      <View style={{ flex: 1 }}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close">
          <Text style={styles.closeText}>✕</Text>
        </Pressable>

        <View style={styles.content}>
          <Text style={styles.badge}>🎬 LIFE TRAILER</Text>
          <Text style={styles.month}>Monthly Recap</Text>

          <View style={styles.textContainer}>
            <Text style={styles.trailerText}>{displayedText}</Text>
            {charIndex < TRAILER_TEXT.length && (
              <Text style={styles.cursor}>▌</Text>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          {charIndex >= TRAILER_TEXT.length && (
            <>
              <Pressable style={styles.shareBtn} accessibilityRole="button" accessibilityLabel="Share trailer">
                <Text style={styles.shareBtnText}>Share Trailer 📤</Text>
              </Pressable>
              <Pressable style={styles.dismissBtn} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Continue my story">
                <Text style={styles.dismissText}>Continue My Story →</Text>
              </Pressable>
            </>
          )}
          {charIndex < TRAILER_TEXT.length && (
            <Pressable onPress={() => setCharIndex(TRAILER_TEXT.length)} accessibilityRole="button" accessibilityLabel="Skip animation">
              <Text style={styles.skipText}>Skip animation →</Text>
            </Pressable>
          )}
        </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  badge: {
    fontSize: Typography.sizes.sm,
    color: Colors.PRIMARY,
    letterSpacing: 3,
    marginBottom: Spacing.md,
  },
  month: {
    fontSize: Typography.sizes.xl,
    color: Colors.TEXT_PRIMARY,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xl,
  },
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  trailerText: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    lineHeight: Typography.lineHeight.relaxed,
    fontFamily: 'monospace',
  },
  cursor: {
    fontSize: Typography.sizes.md,
    color: Colors.PRIMARY,
  },
  footer: {
    padding: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    alignItems: 'center',
    gap: Spacing.md,
  },
  shareBtn: {
    width: '100%',
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.PRIMARY,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  shareBtnText: {
    color: Colors.TEXT_ON_PRIMARY,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
  dismissBtn: {
    padding: Spacing.sm,
  },
  dismissText: {
    color: Colors.TEXT_SECONDARY,
    fontSize: Typography.sizes.md,
  },
  skipText: {
    color: Colors.TEXT_SECONDARY,
    fontSize: Typography.sizes.md,
  },
});
