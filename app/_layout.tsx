import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../src/i18n';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Custom dark theme matching our design system
const BrainRotDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#43686F',
    background: '#0D1117',
    card: '#161B22',
    text: '#E6EDF3',
    border: '#B0B1B033',
    notification: '#F85149',
  },
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

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <ThemeProvider value={BrainRotDarkTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(modals)/roast" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="(modals)/app-blocked" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="(modals)/driving-alert" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="(modals)/intervention" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="(modals)/slot-machine" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
