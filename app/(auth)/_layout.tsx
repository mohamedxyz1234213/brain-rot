import { Stack } from 'expo-router';
import { Colors } from '../../src/constants/theme';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.BACKGROUND } }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="quiz" />
      <Stack.Screen name="setup/limits" />
      <Stack.Screen name="setup/religion" />
      <Stack.Screen name="setup/persona" />
    </Stack>
  );
}
