import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import Animated, {
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeScreen } from '../ui/SafeScreen';
import { AnimatedLogo } from '../ui/AnimatedLogo';
import { ANIMATION, Colors, Glass, Gradients, Layout, LetterSpacing, Radius, Shadow, Spacing, Typography } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { useXPStore } from '../../stores/xpStore';
import { backendService } from '../../services/backend';
import {
  getGoogleClientId,
  getGoogleProfile,
  googleDiscovery,
  googleRedirectUri,
  makeAppUser,
  signInWithApple,
  type OAuthProfile,
} from '../../services/auth/oauth';

type AuthMode = 'sign-in' | 'sign-up';

interface AuthScreenProps {
  mode: AuthMode;
}

const guideSteps = [
  { icon: 'finger-print-outline', title: 'Choose your identity', text: 'Email, Google, or Apple starts the same secure recovery profile.' },
  { icon: 'shield-checkmark-outline', title: 'Verify once', text: 'OAuth returns a trusted profile and the app stores your local session.' },
  { icon: 'rocket-outline', title: 'Start healing', text: 'New users continue to limits; returning users land on the dashboard.' },
] as const;

export function AuthScreen({ mode }: AuthScreenProps) {
  const isSignUp = mode === 'sign-up';
  const { width } = useWindowDimensions();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [busyProvider, setBusyProvider] = useState<'email' | 'google' | 'apple' | null>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [guideIndex, setGuideIndex] = useState(0);
  const pulse = useSharedValue(0);
  const googleClientId = getGoogleClientId();
  const isWide = width >= 760;

  const [googleRequest, googleResponse, promptGoogleAsync] = AuthSession.useAuthRequest(
    {
      clientId: googleClientId || 'missing-google-client-id',
      redirectUri: googleRedirectUri,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Token,
      usePKCE: false,
      extraParams: { prompt: 'select_account' },
    },
    googleDiscovery
  );

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 2200 }), -1, true);
    const timer = setInterval(() => setGuideIndex((current) => (current + 1) % guideSteps.length), 3200);
    return () => clearInterval(timer);
  }, [pulse]);

  useEffect(() => {
    WebBrowser.warmUpAsync();
    AppleAuthentication.isAvailableAsync().then(setAppleAvailable).catch(() => setAppleAvailable(false));
    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  useEffect(() => {
    if (!googleResponse) return;

    if (googleResponse.type === 'success') {
      const accessToken = googleResponse.authentication?.accessToken || googleResponse.params.access_token;
      if (!accessToken) {
        setStatus('Google did not return an access token.');
        setBusyProvider(null);
        return;
      }

      completeOAuth('google', () => getGoogleProfile(accessToken));
      return;
    }

    if (googleResponse.type === 'error') {
      setStatus(googleResponse.error?.message || 'Google sign-in failed.');
    }
    setBusyProvider(null);
  }, [googleResponse]);

  const activeGuide = guideSteps[guideIndex];
  const title = isSignUp ? 'Create your recovery account' : 'Welcome back to control';
  const subtitle = isSignUp
    ? 'Build your anti-doomscroll profile with a secure, low-friction sign-up.'
    : 'Pick up where you left off with fast social login or email.';

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.08]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.45, 0.9]),
  }));

  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    return Math.min(1, (password.length + (/[A-Z]/.test(password) ? 2 : 0) + (/\d/.test(password) ? 2 : 0)) / 12);
  }, [password]);

  async function finishAuth(profile: OAuthProfile, provider: 'google' | 'apple' | 'email') {
    const draftUser = makeAppUser(profile);
    const result = provider === 'email'
      ? isSignUp
        ? await backendService.signUpWithEmail(draftUser.name, draftUser.email, password, draftUser)
        : await backendService.signInWithEmail(draftUser.email, password)
      : await backendService.signInWithOAuth(provider, profile.token ?? '', draftUser);

    useAuthStore.getState().completeAuth(result.user, result.token);
    if (isSignUp) {
      useXPStore.getState().addXP(50, `${provider} account created`);
      router.replace('/(auth)/avatar-picker');
    } else {
      useXPStore.getState().setXP(0);
      router.replace('/(tabs)');
    }
  }

  async function completeOAuth(provider: 'google' | 'apple', loadProfile: () => Promise<OAuthProfile>) {
    try {
      setBusyProvider(provider);
      setStatus(`Completing ${provider === 'google' ? 'Google' : 'Apple'} sign-${isSignUp ? 'up' : 'in'}...`);
      const profile = await loadProfile();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await finishAuth(profile, provider);
    } catch (error) {
      const message = error instanceof Error ? error.message : `${provider} authentication failed.`;
      setStatus(message);
    } finally {
      setBusyProvider(null);
    }
  }

  async function handleEmailAuth() {
    const cleanEmail = email.trim().toLowerCase();
    const displayName = isSignUp ? name.trim() : cleanEmail.split('@')[0];

    if (!cleanEmail || !password.trim() || (isSignUp && !displayName)) {
      setStatus('Fill in the required fields to continue.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setStatus('Enter a valid email address.');
      return;
    }

    if (isSignUp && password.length < 8) {
      setStatus('Use at least 8 characters for your password.');
      return;
    }

    setBusyProvider('email');
    setStatus(isSignUp ? 'Creating your account...' : 'Signing you in...');
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await finishAuth({
        provider: 'email',
        providerId: cleanEmail,
        email: cleanEmail,
        name: displayName,
      }, 'email');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Email authentication failed.');
    } finally {
      setBusyProvider(null);
    }
  }

  async function handleGoogleAuth() {
    if (!googleClientId) {
      setStatus('Add EXPO_PUBLIC_GOOGLE_CLIENT_ID or platform-specific Google client IDs to enable Google OAuth.');
      return;
    }

    if (!googleRequest) return;
    setBusyProvider('google');
    setStatus('Opening Google secure sign-in...');
    await promptGoogleAsync();
  }

  async function handleAppleAuth() {
    if (!appleAvailable) {
      setStatus('Apple Sign In is available on supported iOS devices and builds.');
      return;
    }

    await completeOAuth('apple', signInWithApple);
  }

  return (
    <SafeScreen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboard}>
        <ScrollView contentContainerStyle={[styles.scroll, isWide && styles.scrollWide]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(ANIMATION.entrance.duration)} style={[styles.heroCard, isWide && styles.heroWide]}>
            <Animated.View style={[styles.pulseOrb, pulseStyle]} />
            <LinearGradient colors={[...Gradients.hero] as unknown as [string, string, string]} style={styles.heroGradient}>
              <View style={styles.brandRow}>
                <View style={styles.logoMark}>
                  <AnimatedLogo size={42} animated={false} />
                </View>
                <Text style={styles.brandText}>BRAINROT HEALER</Text>
              </View>
              <Text style={styles.heroTitle}>{title}</Text>
              <Text style={styles.heroSubtitle}>{subtitle}</Text>
              <View style={styles.guideCard}>
                <View style={styles.guideIcon}>
                  <Ionicons name={activeGuide.icon} size={24} color={Colors.PRIMARY} />
                </View>
                <View style={styles.guideCopy}>
                  <Animated.Text key={activeGuide.title} entering={FadeInDown.duration(320)} style={styles.guideTitle}>{activeGuide.title}</Animated.Text>
                  <Animated.Text key={activeGuide.text} entering={FadeInDown.duration(320).delay(60)} style={styles.guideText}>{activeGuide.text}</Animated.Text>
                </View>
              </View>
              <View style={styles.guideDots}>
                {guideSteps.map((step, index) => (
                  <Pressable key={step.title} onPress={() => setGuideIndex(index)} style={[styles.dot, index === guideIndex && styles.dotActive]} accessibilityRole="button" accessibilityLabel={`Show guidance step ${index + 1}`} />
                ))}
              </View>
            </LinearGradient>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(ANIMATION.entrance.duration).delay(120)} style={[styles.formCard, isWide && styles.formWide]}>
            <View style={styles.formHeader}>
              <Text style={styles.eyebrow}>{isSignUp ? 'START CLEAN' : 'SECURE RETURN'}</Text>
              <Text style={styles.formTitle}>{isSignUp ? 'Sign up' : 'Sign in'}</Text>
              <Text style={styles.formSubtitle}>OAuth is handled through system browser redirects and native Apple auth.</Text>
            </View>

            <View style={styles.oauthStack}>
              <SocialButton icon="logo-google" label={`${isSignUp ? 'Continue' : 'Sign in'} with Google`} onPress={handleGoogleAuth} loading={busyProvider === 'google'} disabled={!googleRequest || busyProvider !== null} />
              <SocialButton icon="logo-apple" label={`${isSignUp ? 'Continue' : 'Sign in'} with Apple`} onPress={handleAppleAuth} loading={busyProvider === 'apple'} disabled={!appleAvailable || busyProvider !== null} />
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or use email</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.fields}>
              {isSignUp && (
                <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" icon="person-outline" />
              )}
              <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" icon="mail-outline" />
              <Field label="Password" value={password} onChangeText={setPassword} placeholder={isSignUp ? 'Min 8 characters' : 'Your password'} secureTextEntry icon="lock-closed-outline" />
              {isSignUp && (
                <View style={styles.strengthTrack}>
                  <View style={[styles.strengthFill, { width: `${Math.max(passwordStrength * 100, password ? 16 : 0)}%` }]} />
                </View>
              )}
            </View>

            {status && <Text style={styles.statusText}>{status}</Text>}

            <Pressable style={[styles.primaryButton, busyProvider !== null && styles.disabledButton]} onPress={handleEmailAuth} disabled={busyProvider !== null} accessibilityRole="button" accessibilityLabel={isSignUp ? 'Create account with email' : 'Sign in with email'}>
              {busyProvider === 'email' ? <ActivityIndicator color={Colors.TEXT_ON_PRIMARY} /> : <Text style={styles.primaryButtonText}>{isSignUp ? 'Create account' : 'Sign in'}</Text>}
            </Pressable>

            <Pressable
              style={styles.switchButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.replace(isSignUp ? '/(auth)/sign-in' : '/(auth)/sign-up');
              }}
              accessibilityRole="button"
              accessibilityLabel={isSignUp ? 'Go to sign in' : 'Go to sign up'}
            >
              <Text style={styles.switchText}>{isSignUp ? 'Already healing? Sign in' : 'New here? Create account'}</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

function Field({ label, icon, ...props }: React.ComponentProps<typeof TextInput> & { label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputShell}>
        <Ionicons name={icon} size={18} color={Colors.TEXT_SECONDARY} />
        <TextInput {...props} placeholderTextColor={Colors.TEXT_SECONDARY} style={styles.input} accessibilityLabel={label} />
      </View>
    </View>
  );
}

function SocialButton({ icon, label, loading, disabled, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; loading: boolean; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.socialButton, disabled && styles.disabledButton]} onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label}>
      {loading ? <ActivityIndicator color={Colors.TEXT_PRIMARY} /> : <Ionicons name={icon} size={20} color={Colors.TEXT_PRIMARY} />}
      <Text style={styles.socialText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  scroll: { flexGrow: 1, padding: Spacing.lg, paddingBottom: Spacing['2xl'], gap: Spacing.lg, justifyContent: 'center' },
  scrollWide: { maxWidth: 1080, width: '100%', alignSelf: 'center', flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing['2xl'] },
  heroCard: { borderRadius: Radius['2xl'], overflow: 'hidden', ...Shadow.lg },
  heroWide: { flex: 1.05, minHeight: 620 },
  pulseOrb: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(255,255,255,0.18)', right: -80, top: -80, zIndex: 1 },
  heroGradient: { minHeight: 360, padding: Spacing.xl, justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing['2xl'] },
  logoMark: { width: 42, height: 42, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  brandText: { color: Colors.TEXT_ON_PRIMARY, fontFamily: Typography.families.featureSemi, fontSize: Typography.sizes.xs, letterSpacing: LetterSpacing.wide },
  heroTitle: { color: Colors.TEXT_ON_PRIMARY, fontFamily: Typography.families.display, fontSize: Typography.sizes['4xl'], letterSpacing: LetterSpacing.tight, lineHeight: 44, marginBottom: Spacing.md },
  heroSubtitle: { color: 'rgba(242,230,218,0.82)', fontSize: Typography.sizes.md, lineHeight: Typography.lineHeight.relaxed, marginBottom: Spacing.xl },
  guideCard: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg, borderRadius: Radius.xl, backgroundColor: 'rgba(255,255,255,0.86)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)' },
  guideIcon: { width: 48, height: 48, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.BACKGROUND },
  guideCopy: { flex: 1 },
  guideTitle: { color: Colors.TEXT_PRIMARY, fontFamily: Typography.families.featureSemi, fontSize: Typography.sizes.md, marginBottom: 3 },
  guideText: { color: Colors.TEXT_SECONDARY, fontSize: Typography.sizes.sm, lineHeight: 19 },
  guideDots: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
  dot: { width: 8, height: 8, borderRadius: Radius.full, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { width: 28, backgroundColor: Colors.TEXT_ON_PRIMARY },
  formCard: { padding: Spacing.xl, borderRadius: Radius['2xl'], backgroundColor: Glass.fillStrong, borderWidth: 1, borderColor: Glass.border, ...Shadow.md },
  formWide: { flex: 0.95, maxWidth: Layout.maxContentWidth },
  formHeader: { marginBottom: Spacing.lg },
  eyebrow: { color: Colors.PRIMARY, fontFamily: Typography.families.featureSemi, fontSize: Typography.sizes.xs, letterSpacing: LetterSpacing.wide, marginBottom: Spacing.xs },
  formTitle: { color: Colors.TEXT_PRIMARY, fontFamily: Typography.families.display, fontSize: Typography.sizes['3xl'], letterSpacing: LetterSpacing.tight },
  formSubtitle: { color: Colors.TEXT_SECONDARY, fontSize: Typography.sizes.sm, lineHeight: 20, marginTop: Spacing.xs },
  oauthStack: { gap: Spacing.sm },
  socialButton: { minHeight: 54, borderRadius: Radius.lg, backgroundColor: Colors.SURFACE, borderWidth: 1, borderColor: Colors.BORDER, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  socialText: { color: Colors.TEXT_PRIMARY, fontFamily: Typography.families.bodySemibold, fontSize: Typography.sizes.md },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginVertical: Spacing.lg },
  divider: { flex: 1, height: 1, backgroundColor: Colors.BORDER },
  dividerText: { color: Colors.TEXT_SECONDARY, fontSize: Typography.sizes.xs, textTransform: 'uppercase', letterSpacing: LetterSpacing.wide },
  fields: { gap: Spacing.md },
  fieldGroup: { gap: Spacing.xs },
  label: { color: Colors.TEXT_SECONDARY, fontFamily: Typography.families.bodyMedium, fontSize: Typography.sizes.sm },
  inputShell: { minHeight: 54, borderRadius: Radius.lg, backgroundColor: Colors.SURFACE, borderWidth: 1, borderColor: Colors.BORDER, paddingHorizontal: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  input: { flex: 1, color: Colors.TEXT_PRIMARY, fontSize: Typography.sizes.md, paddingVertical: Platform.OS === 'web' ? Spacing.md : 0 },
  strengthTrack: { height: 5, borderRadius: Radius.full, backgroundColor: Colors.BORDER_LIGHT, overflow: 'hidden', marginTop: -Spacing.xs },
  strengthFill: { height: '100%', borderRadius: Radius.full, backgroundColor: Colors.SUCCESS },
  statusText: { color: Colors.TEXT_SECONDARY, fontSize: Typography.sizes.sm, lineHeight: 19, marginTop: Spacing.md },
  primaryButton: { minHeight: 56, borderRadius: Radius.lg, backgroundColor: Colors.PRIMARY, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.lg, ...Shadow.sm },
  primaryButtonText: { color: Colors.TEXT_ON_PRIMARY, fontFamily: Typography.families.bodySemibold, fontSize: Typography.sizes.lg },
  disabledButton: { opacity: 0.55 },
  switchButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm },
  switchText: { color: Colors.PRIMARY, fontFamily: Typography.families.bodyMedium, fontSize: Typography.sizes.md },
});
