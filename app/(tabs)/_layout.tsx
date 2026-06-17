import { Ionicons } from '@expo/vector-icons';
import { Tabs, Redirect } from 'expo-router';
import { Colors, Typography } from '../../src/constants/theme';
import { useAuthStore } from '../../src/stores/authStore';

export default function TabLayout() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Wait for persisted auth to load before deciding, to avoid a redirect flash.
  if (!isHydrated) return null;
  if (!isAuthenticated) return <Redirect href="/(auth)/welcome" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.TEXT_ON_PRIMARY,
        tabBarInactiveTintColor: Colors.TEXT_SECONDARY,
        tabBarStyle: {
          backgroundColor: Colors.SURFACE,
          borderTopColor: Colors.BORDER,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: Typography.sizes.sm,
          fontWeight: 500,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size }) => <Ionicons name="checkmark-done" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="focus"
        options={{
          title: 'Focus',
          tabBarIcon: ({ color, size }) => <Ionicons name="timer" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="religion"
        options={{
          title: 'Prayers',
          tabBarIcon: ({ color, size }) => <Ionicons name="moon" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
