import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '../../src/constants/theme';

export default function ScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.BACKGROUND },
      }}
    />
  );
}
