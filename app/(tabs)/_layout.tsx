import { Ionicons } from '@expo/vector-icons';
import { Tabs, Redirect } from 'expo-router';
import { Colors } from '../../src/constants/theme';
import { FloatingTabBar } from '../../src/components/ui';
import { useAuthStore } from '../../src/stores/authStore';

export default function TabLayout() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

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
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'checkmark-done' : 'checkmark-done-outline'} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="focus"
        options={{
          title: 'Focus',
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'timer' : 'timer-outline'} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="religion"
        options={{
          title: 'Prayers',
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'moon' : 'moon-outline'} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
