import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Colors } from '../src/constants/theme';

import '../src/i18n';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.BACKGROUND },
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="screens" />
      <Stack.Screen name="(modals)/roast" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="(modals)/app-blocked" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="(modals)/driving-alert" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="(modals)/intervention" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="(modals)/slot-machine" options={{ presentation: 'modal' }} />
      <Stack.Screen name="(modals)/ghost" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="(modals)/life-trailer" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="(modals)/breakup-letter" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="(modals)/villain-arc" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="(modals)/brain-scan" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
