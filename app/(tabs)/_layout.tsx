import { Ionicons } from '@expo/vector-icons';
import { Tabs, Redirect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../src/constants/theme';
import { FloatingTabBar } from '../../src/components/ui';
import { useAuthStore } from '../../src/stores/authStore';
import { useSettingsStore } from '../../src/stores/settingsStore';

export default function TabLayout() {
  const { t } = useTranslation();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const religion = useSettingsStore((s) => s.religion);

  // Wait for persisted auth to load before deciding, to avoid a redirect flash.
  if (!isHydrated) return null;
  if (!isAuthenticated) return <Redirect href="/(auth)/welcome" />;

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.PRIMARY_LIGHT,
        tabBarInactiveTintColor: Colors.TEXT_SECONDARY,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: t('tabs.tasks'),
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'checkmark-done' : 'checkmark-done-outline'} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="focus"
        options={{
          title: t('tabs.focus'),
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'timer' : 'timer-outline'} size={size} color={color} />,
        }}
      />
      {religion === 'muslim' && (
        <Tabs.Screen
          name="religion"
          options={{
            title: t('tabs.religion'),
            tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'moon' : 'moon-outline'} size={size} color={color} />,
          }}
        />
      )}
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
