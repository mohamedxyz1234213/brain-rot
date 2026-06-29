import { useFonts } from 'expo-font';
import { Stack, router, usePathname, useRootNavigationState } from 'expo-router';
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
import { scheduleDailyRoasts, resetSchedulingGuard, fireUsageRoast } from '../src/services/roastNotificationService';
import { schedulePrayerReminders, evaluatePrayerBlock, resetPrayerSchedulingGuard } from '../src/services/prayerReminderService';
import { setRegionOverride as applyRegionOverride } from '../src/services/pricing';
import { getPrayerTimes } from '../src/services/prayerTimes';
import { useReligionStore } from '../src/stores/religionStore';
import { useRoastStore } from '../src/stores/roastStore';
import { generateRoast } from '../src/services/aiService';
import { useSubscriptionStore } from '../src/stores/subscriptionStore';
import { useBrainScoreStore } from '../src/stores/brainScoreStore';
import { useXPStore } from '../src/stores/xpStore';
import { useFocusStore } from '../src/stores/focusStore';
import { useStreakStore } from '../src/stores/streakStore';
import { useGamificationStore } from '../src/stores/gamificationStore';
import { useDrivingStore } from '../src/stores/drivingStore';
import { useAccountabilityStore } from '../src/stores/accountabilityStore';

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
  initialRouteName: '(auth)',
};

SplashScreen.preventAutoHideAsync();

let lastBlockedOverageKey: string | null = null;
let lastBootSyncedUserId: string | null = null;
let lastLocalStateUserId: string | null = null;

function resetLocalUserState() {
  useBrainScoreStore.getState().resetScores();
  useScreenTimeStore.getState().resetScreenTime();
  useTaskStore.getState().resetTasks();
  useXPStore.getState().resetXP();
  useFocusStore.getState().resetFocus();
  useReligionStore.getState().resetReligion();
  useRoastStore.getState().resetRoasts();
  useStreakStore.getState().resetStreaks();
  useSubscriptionStore.getState().resetSubscription();
  useGamificationStore.getState().resetGamification();
  useDrivingStore.getState().resetDriving();
  useAccountabilityStore.getState().resetAccountability();
}

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
  const religion = useSettingsStore((s) => s.religion);
  const dailyRoastEnabled = useSettingsStore((s) => s.dailyRoastEnabled);
  const userName = useAuthStore((s) => s.user?.name);
  const userId = useAuthStore((s) => s.user?.id);
  const authToken = useAuthStore((s) => s.authToken);
  const calculationMethod = useReligionStore((s) => s.selectedCalculationMethod);
  const prayerLogs = useReligionStore((s) => s.prayerLogs);
  const regionOverride = useSettingsStore((s) => s.regionOverride);
  const pathname = usePathname();
  const rootNavigationState = useRootNavigationState();
  const navigationReady = !!rootNavigationState?.key;

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
    applyLanguage(language);
    resetSchedulingGuard();
    resetPrayerSchedulingGuard();
  }, [language]);

  // Sync the persisted manual region override into the pricing service so
  // the next resolveTiers() call picks it up.
  useEffect(() => {
    applyRegionOverride(regionOverride);
  }, [regionOverride]);

  // Schedule prayer reminders for today (and re-schedule whenever a prayer
  // is logged so reminders for marked prayers stop firing).
  useEffect(() => {
    if (religion !== 'muslim') return;
    const times = getPrayerTimes(calculationMethod);
    schedulePrayerReminders(times, prayerLogs, { force: true });
  }, [calculationMethod, prayerLogs, religion]);

  // Foreground hard-block watcher: every 30s, check if an unmarked prayer's
  // window is closing within 30 min — if so, navigate into the prayer-block
  // modal. Re-pushes if the user closes it without marking.
  useEffect(() => {
    if (!loaded || !navigationReady || religion !== 'muslim') return;
    const check = () => {
      const times = getPrayerTimes(calculationMethod);
      const logs = useReligionStore.getState().prayerLogs;
      const offender = evaluatePrayerBlock(times, logs, 30);
      const alreadyBlocking = pathname === '/prayer-block' || pathname === '/(modals)/prayer-block';
      if (offender && !alreadyBlocking) {
        router.push({ pathname: '/(modals)/prayer-block', params: { prayer: offender } });
      }
    };
    check();
    const t = setInterval(check, 30_000);
    return () => clearInterval(t);
  }, [calculationMethod, loaded, navigationReady, pathname, prayerLogs, religion]);

  useEffect(() => {
    if (!loaded || !navigationReady || !dailyRoastEnabled) return;
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

  useEffect(() => {
    if (!dailyRoastEnabled) return;

    const checkUsage = async () => {
      const screenTime = useScreenTimeStore.getState();
      const pending = useTaskStore.getState().tasks.filter((t) => t.status === 'pending').length;
      const topLog = [...screenTime.logs].sort((a, b) => b.minutesUsed - a.minutesUsed)[0];
      const overage = screenTime.getOverageApps()[0];
      const overageMinutes = overage
        ? screenTime.logs
            .filter((log) => log.appBundleId === overage.appBundleId)
            .reduce((sum, log) => sum + log.minutesUsed, 0)
        : 0;

      fireUsageRoast({
        lang: language,
        name: userName,
        pendingTasks: pending,
        topApp: overage?.appName ?? topLog?.appName,
        topMinutes: overageMinutes || topLog?.minutesUsed,
        totalMinutes: overageMinutes || (topLog?.minutesUsed ?? screenTime.totalMinutesToday),
        limitMinutes: overage?.dailyLimitMinutes,
      });

      if (!overage) return;

      const today = new Date().toISOString().split('T')[0];
      const overageKey = `${today}-${overage.id}-${overageMinutes}`;
      const isAlreadyBlocking = pathname === '/app-blocked' || pathname === '/(modals)/app-blocked';
      if (lastBlockedOverageKey === overageKey || isAlreadyBlocking) return;

      lastBlockedOverageKey = overageKey;
      const persona = useRoastStore.getState().getRandomPersona();
      const taskState = useTaskStore.getState();
      const result = await generateRoast(persona, 'app_limit', {
        userName: userName ?? 'there',
        screenTimeToday: screenTime.totalMinutesToday,
        screenTimeLimit: screenTime.limits.reduce((sum, limit) => sum + limit.dailyLimitMinutes, 0),
        tasksCompleted: taskState.tasks.filter((task) => task.status === 'completed').length,
        tasksTotal: taskState.tasks.length,
        topWastedApp: overage.appName,
        topWastedMinutes: overageMinutes,
        blockedAttempts: 1,
        streakDays: 0,
      }, language);

      useRoastStore.getState().addRoast({
        persona,
        trigger: 'app_limit',
        text: result.text,
        isOffline: result.isOffline,
      });

      router.push({
        pathname: '/(modals)/app-blocked',
        params: {
          app: overage.appName,
          used: String(overageMinutes),
          limit: String(overage.dailyLimitMinutes),
        },
      });
    };

    checkUsage();
    const t = setInterval(checkUsage, 60_000);
    return () => clearInterval(t);
  }, [language, dailyRoastEnabled, userName, pathname, loaded, navigationReady]);

  // Register push token on auth and sync to backend
  useEffect(() => {
    if (!authToken || !userId) return;
    useAuthStore.getState().setAuthToken(authToken);

    (async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') return;
        const tokenData = await Notifications.getExpoPushTokenAsync();
        if (tokenData?.data) {
          // Save push token to backend for push notifications
          const API_URL = process.env.EXPO_PUBLIC_MONGO_API_URL || 'http://localhost:3001/api';
          await fetch(`${API_URL}/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
            body: JSON.stringify({ pushToken: tokenData.data }),
          }).catch(() => {}); // silent fail — not critical
        }
      } catch {}
    })();
  }, [authToken, userId]);

  useEffect(() => {
    if (!userId) return;
    if (!authToken) return;
    if (lastLocalStateUserId !== userId) {
      lastLocalStateUserId = userId;
      resetLocalUserState();
    }
    if (lastBootSyncedUserId === userId) return;
    lastBootSyncedUserId = userId;
    useAuthStore.getState().syncCurrentUser();
    useSubscriptionStore.getState().refreshSubscription(userId);
    useScreenTimeStore.getState().syncToday(userId);
    useBrainScoreStore.getState().syncScores(userId);
  }, [userId, authToken]);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Handle notification taps (deep-linking)
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.type === 'report_status' && data?.reportId) {
        router.push('/screens/report');
      }
    });
    return () => { sub.remove(); };
  }, []);

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
      <Stack.Screen name="(modals)/prayer-block" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
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
