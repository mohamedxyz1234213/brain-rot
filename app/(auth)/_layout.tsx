import { Stack } from 'expo-router';
import { Colors } from '../../src/constants/theme';

export default function AuthLayout() {
  return (
    <Stack initialRouteName="sign-in" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.BACKGROUND } }} />
  );
}
