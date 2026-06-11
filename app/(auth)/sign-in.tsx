import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme';
import { Button } from '../../src/components/ui/Button';

export default function SignInScreen() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSignIn = () => {
    // Clerk auth would go here
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to continue healing</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Colors.TEXT_SECONDARY}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={Colors.TEXT_SECONDARY}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button title="Sign In" onPress={handleSignIn} size="lg" />
        <Button title="Forgot Password?" onPress={() => {}} variant="ghost" />
      </View>

      <Button
        title="Don't have an account? Sign Up"
        onPress={() => router.push('/(auth)/sign-up')}
        variant="ghost"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    marginBottom: Spacing['2xl'],
  },
  form: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  input: {
    backgroundColor: Colors.SURFACE,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    borderWidth: 0.5,
    borderColor: `${Colors.SECONDARY}33`,
  },
});
