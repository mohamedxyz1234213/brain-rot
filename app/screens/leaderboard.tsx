import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { SafeScreen, ScreenHeader } from '../../src/components/ui';

export default function LeaderboardScreen() {
  return (
    <SafeScreen>
      <ScreenHeader title="Global Leaderboard" onBack={() => router.back()} />
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Leaderboard data loads from the API once users are active</Text>
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
