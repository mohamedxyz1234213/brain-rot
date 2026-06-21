import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow, LetterSpacing } from '../../src/constants/theme';
import { SafeScreen } from '../../src/components/ui/SafeScreen';
import { useAuthStore } from '../../src/stores/authStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useXPStore } from '../../src/stores/xpStore';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsLoading(true);

    useAuthStore.getState().setUser({
      id: `user_${Date.now()}`,
      clerkId: `clerk_${Date.now()}`,
      name: email.split('@')[0] || 'User',
      email: email.trim(),
      brainScore: 0,
      xp: 0,
      level: 'Zombie',
      streakDays: 0,
      roastPersona: useSettingsStore.getState().roastPersona,
      language: useSettingsStore.getState().language,
      religionEnabled: useSettingsStore.getState().religionEnabled,
      subscriptionTier: 'free',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    useXPStore.getState().setXP(0);
    setIsLoading(false);
    router.replace('/(tabs)');
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>Welcome back. بنعالجك تاني.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={Colors.TEXT_SECONDARY}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel="Email address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor={Colors.TEXT_SECONDARY}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              accessibilityLabel="Password"
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.actions}>
          <Pressable style={[styles.signInBtn, isLoading && styles.signInBtnDisabled]} onPress={handleSignIn} disabled={isLoading} accessibilityRole="button" accessibilityLabel="Sign in">
            <Text style={styles.signInBtnText}>{isLoading ? 'Signing in...' : 'Sign In'}</Text>
          </Pressable>

          <Pressable style={styles.signUpLink} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(auth)/sign-up'); }} accessibilityRole="button" accessibilityLabel="Go to sign up">
            <Text style={styles.signUpLinkText}>Don't have an account? Sign Up</Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: Spacing.xl, justifyContent: 'center' },
  title: { fontSize: Typography.sizes['2xl'], fontWeight: 700, color: Colors.TEXT_PRIMARY, marginBottom: Spacing.sm, letterSpacing: LetterSpacing.tight },
  subtitle: { fontSize: Typography.sizes.md, color: Colors.TEXT_SECONDARY, marginBottom: Spacing.xl },
  form: { marginBottom: Spacing.xl },
  inputGroup: { marginBottom: Spacing.lg },
  label: { fontSize: Typography.sizes.sm, color: Colors.TEXT_SECONDARY, marginBottom: Spacing.sm },
  input: { backgroundColor: Colors.SURFACE, borderRadius: Radius.lg, padding: Spacing.lg, fontSize: Typography.sizes.md, color: Colors.TEXT_PRIMARY, borderWidth: 1, borderColor: Colors.BORDER, minHeight: 44 },
  actions: { gap: Spacing.md },
  signInBtn: { backgroundColor: Colors.PRIMARY, borderRadius: Radius.lg, paddingVertical: Spacing.lg, alignItems: 'center', ...Shadow.sm },
  signInBtnDisabled: { opacity: 0.4 },
  signInBtnText: { color: Colors.TEXT_ON_PRIMARY, fontSize: Typography.sizes.lg, fontWeight: 600 },
  signUpLink: { paddingVertical: Spacing.md, alignItems: 'center' },
  signUpLinkText: { fontSize: Typography.sizes.md, color: Colors.TEXT_SECONDARY },
});
