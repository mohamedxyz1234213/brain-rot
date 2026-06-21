import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Text as RNText, TextInput as RNTextInput } from 'react-native';
import 'react-native-reanimated';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display/600SemiBold';
import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display/700Bold';
import { SpaceGrotesk_500Medium } from '@expo-google-fonts/space-grotesk/500Medium';
import { SpaceGrotesk_600SemiBold } from '@expo-google-fonts/space-grotesk/600SemiBold';
import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk/700Bold';
import * as Notifications from 'expo-notifications';
import { Colors } from '../src/constants/theme';
import { applyLanguage } from '../src/i18n';
import { useSettingsStore } from '../src/stores/settingsStore';
import { useAuthStore } from '../src/stores/authStore';
import { useTaskStore } from '../src/stores/taskStore';
import { useScreenTimeStore } from '../src/stores/screenTimeStore';
import { scheduleDailyRoasts, resetSchedulingGuard } from '../src/services/roastNotificationService';

import '../src/i18n';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

// Make Inter the default body font app-wide, without editing every Text style.
// Per-component styles that set their own fontFamily still win.
let defaultFontApplied = false;
function applyDefaultFont() {
  if (defaultFontApplied) return;
  const setDefault = (Comp: any) => {
    Comp.defaultProps = Comp.defaultProps || {};
    Comp.defaultProps.style = [{ fontFamily: 'Inter_400Regular' }, Comp.defaultProps.style];
  };
  setDefault(RNText);
  setDefault(RNTextInput);
  defaultFontApplied = true;
}

export default function RootLayout() {
  const language = useSettingsStore((s) => s.language);
  const dailyRoastEnabled = useSettingsStore((s) => s.dailyRoastEnabled);
  const userName = useAuthStore((s) => s.user?.name);

  useEffect(() => {
    applyLanguage(language);
    resetSchedulingGuard();
  }, [language]);

  useEffect(() => {
    if (!dailyRoastEnabled) return;
    const pending = useTaskStore.getState().tasks.filter((t) => t.status === 'pending').length;
    const topLog = useScreenTimeStore.getState().logs.sort((a, b) => b.minutesUsed - a.minutesUsed)[0];
    scheduleDailyRoasts({
      lang: language,
      name: userName,
      pendingTasks: pending,
      topApp: topLog?.appName,
      topMinutes: topLog?.minutesUsed,
      perDay: 8,
    });
  }, [language, dailyRoastEnabled, userName]);

  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  if (loaded) applyDefaultFont();

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
