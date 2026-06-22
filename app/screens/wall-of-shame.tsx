import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { SafeScreen, ScreenHeader } from '../../src/components/ui';

export default function WallOfShameScreen() {
  return (
    <SafeScreen>
      <ScreenHeader title="Wall of Shame" subtitle="The most brain-rotted among us" onBack={() => router.back()} />

      <View style={styles.empty}>
        <Text style={styles.emptyText}>No entries yet — opt in when the feature is available</Text>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
  },
});
