import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow, Gradients, LetterSpacing } from '../../src/constants/theme';
import { SafeScreen } from '../../src/components/ui/SafeScreen';
import { AnimatedLogo } from '../../src/components/ui/AnimatedLogo';
import { AnimatedSvgIllustration } from '../../src/components/ui/AnimatedSvgIllustration';
import { useAuthStore } from '../../src/stores/authStore';

export default function WelcomeScreen() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(auth)/sign-up');
  };

  const handleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(auth)/sign-in');
  };

  return (
    <SafeScreen>
      <Animated.View entering={FadeInDown.duration(600)} style={styles.content}>
        <View style={styles.logoWrap}>
          <AnimatedLogo size={140} />
        </View>
        <Text style={styles.title}>BrainRot</Text>
        <Text style={styles.subtitle}>Recover from social media addiction. Get roasted. بنعالجك.</Text>

        <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.heroIllustration}>
          <AnimatedSvgIllustration
            illustrationKey="avatar-thinking-6"
            width={180}
            variant="float"
            delay={500}
          />
        </Animated.View>

        <View style={styles.features}>
          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            <FeatureRow icon="lock-closed-outline" text="Block apps that steal your time" />
          </Animated.View>
          <Animated.View entering={FadeInDown.duration(400).delay(300)}>
            <FeatureRow icon="flame-outline" text="Get roasted when you fail" />
          </Animated.View>
          <Animated.View entering={FadeInDown.duration(400).delay(400)}>
            <FeatureRow icon="bar-chart-outline" text="Track your brain score daily" />
          </Animated.View>
          <Animated.View entering={FadeInDown.duration(400).delay(500)}>
            <FeatureRow icon="moon-outline" text="Islamic prayer tracking" />
          </Animated.View>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.primaryBtn} onPress={handleGetStarted} accessibilityRole="button" accessibilityLabel="Get started">
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={handleSignIn} accessibilityRole="button" accessibilityLabel="Sign in">
            <Text style={styles.secondaryBtnText}>Sign In</Text>
          </Pressable>
        </View>
      </Animated.View>
    </SafeScreen>
  );
}

function FeatureRow({ icon, text }: { icon: React.ComponentProps<typeof Ionicons>['name']; text: string }) {
  return (
    <View style={styles.featureRow}>
      <Ionicons name={icon} size={24} color={Colors.PRIMARY} style={styles.featureIcon} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', padding: Spacing.xl },
  logoWrap: { alignSelf: 'center', marginBottom: Spacing.lg, width: 140, height: 140 },
  title: { fontSize: Typography.sizes['3xl'], fontWeight: 700, color: Colors.TEXT_PRIMARY, textAlign: 'center', marginBottom: Spacing.sm, letterSpacing: LetterSpacing.tight },
  subtitle: { fontSize: Typography.sizes.md, color: Colors.TEXT_SECONDARY, textAlign: 'center', lineHeight: Typography.lineHeight.normal, marginBottom: Spacing['2xl'] },
  heroIllustration: { alignItems: 'center', marginBottom: Spacing.lg },
  features: { marginBottom: Spacing['2xl'] },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, backgroundColor: Colors.SURFACE, borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.BORDER },
  featureIcon: { marginRight: Spacing.md },
  featureText: { fontSize: Typography.sizes.md, color: Colors.TEXT_PRIMARY, lineHeight: Typography.lineHeight.normal },
  actions: { gap: Spacing.md },
  primaryBtn: { backgroundColor: Colors.PRIMARY, borderRadius: Radius.lg, paddingVertical: Spacing.lg, alignItems: 'center', ...Shadow.sm },
  primaryBtnText: { color: Colors.TEXT_ON_PRIMARY, fontSize: Typography.sizes.lg, fontWeight: 600 },
  secondaryBtn: { borderRadius: Radius.lg, paddingVertical: Spacing.md, alignItems: 'center' },
  secondaryBtnText: { color: Colors.TEXT_SECONDARY, fontSize: Typography.sizes.md },
});
