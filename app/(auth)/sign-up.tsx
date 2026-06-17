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

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsLoading(true);

    useAuthStore.getState().setUser({
      id: `user_${Date.now()}`,
      clerkId: `clerk_${Date.now()}`,
      name: name.trim(),
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

    useXPStore.getState().addXP(50, 'Account created');
    setIsLoading(false);
    router.push('/setup/limits');
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start your brain recovery journey</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={Colors.TEXT_SECONDARY}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              accessibilityLabel="Name"
            />
          </View>

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
              placeholder="Min 8 characters"
              placeholderTextColor={Colors.TEXT_SECONDARY}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              accessibilityLabel="Password"
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.actions}>
          <Pressable style={[styles.signUpBtn, isLoading && styles.signUpBtnDisabled]} onPress={handleSignUp} disabled={isLoading} accessibilityRole="button" accessibilityLabel="Create account">
            <Text style={styles.signUpBtnText}>{isLoading ? 'Creating account...' : 'Create Account'}</Text>
          </Pressable>

          <Pressable style={styles.signInLink} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(auth)/sign-in'); }} accessibilityRole="button" accessibilityLabel="Go to sign in">
            <Text style={styles.signInLinkText}>Already have an account? Sign In</Text>
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
  signUpBtn: { backgroundColor: Colors.PRIMARY, borderRadius: Radius.lg, paddingVertical: Spacing.lg, alignItems: 'center', ...Shadow.sm },
  signUpBtnDisabled: { opacity: 0.4 },
  signUpBtnText: { color: Colors.TEXT_ON_PRIMARY, fontSize: Typography.sizes.lg, fontWeight: 600 },
  signInLink: { paddingVertical: Spacing.md, alignItems: 'center' },
  signInLinkText: { fontSize: Typography.sizes.md, color: Colors.TEXT_SECONDARY },
});
