import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../../src/constants/theme';

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
    <View style={styles.container}>
      <Pressable style={styles.closeBtn} onPress={() => router.back()}>
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
            <Pressable style={styles.shareBtn}>
              <Text style={styles.shareBtnText}>Share Trailer 📤</Text>
            </Pressable>
            <Pressable style={styles.dismissBtn} onPress={() => router.back()}>
              <Text style={styles.dismissText}>Continue My Story →</Text>
            </Pressable>
          </>
        )}
        {charIndex < TRAILER_TEXT.length && (
          <Pressable onPress={() => setCharIndex(TRAILER_TEXT.length)}>
            <Text style={styles.skipText}>Skip animation →</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    fontWeight: '700',
    marginBottom: Spacing.xl,
  },
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  trailerText: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    lineHeight: 26,
    fontFamily: 'monospace',
  },
  cursor: {
    fontSize: Typography.sizes.md,
    color: Colors.PRIMARY,
  },
  footer: {
    padding: Spacing.xl,
    paddingBottom: 48,
    alignItems: 'center',
    gap: Spacing.md,
  },
  shareBtn: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 16,
    alignItems: 'center',
  },
  shareBtnText: {
    color: '#fff',
    fontSize: Typography.sizes.md,
    fontWeight: '600',
  },
  dismissBtn: {
    padding: 8,
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
