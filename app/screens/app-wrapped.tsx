import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { SafeScreen, ScreenHeader } from '../../src/components/ui';

export default function AppWrappedScreen() {
  return (
    <SafeScreen>
      <ScreenHeader title="App Wrapped" subtitle="Your month in review" onClose={() => router.back()} align="center" />
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Your wrapped summary will appear here at the end of each month</Text>
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
