import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow, LetterSpacing } from '../../src/constants/theme';
import { SafeScreen } from '../../src/components/ui/SafeScreen';
import { useSettingsStore } from '../../src/stores/settingsStore';

export default function ReligionPickerScreen() {
  const [selected, setSelected] = useState<'muslim' | 'christian' | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    useSettingsStore.getState().setReligion(selected);
    router.push('/(auth)/avatar-picker');
  };

  return (
    <SafeScreen>
      <Animated.View entering={FadeInDown.duration(500)} style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="heart-outline" size={52} color={Colors.PRIMARY} />
        </View>
        <Text style={styles.title}>Your Faith</Text>
        <Text style={styles.subtitle}>Which faith do you follow? This helps us tailor your experience.</Text>

        <View style={styles.options}>
          <Pressable
            style={[styles.optionCard, selected === 'muslim' && styles.optionActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelected('muslim'); }}
            accessibilityRole="button"
            accessibilityLabel="Muslim"
          >
            <Ionicons name="moon-outline" size={32} color={selected === 'muslim' ? Colors.TEXT_ON_PRIMARY : Colors.PRIMARY} />
            <View style={styles.optionTextWrap}>
              <Text style={[styles.optionTitle, selected === 'muslim' && styles.optionTextActive]}>Muslim</Text>
              <Text style={[styles.optionDesc, selected === 'muslim' && styles.optionTextActive]}>
                Prayer times, Quran tracking, Dhikr, and Fasting reminders
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={[styles.optionCard, selected === 'christian' && styles.optionActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelected('christian'); }}
            accessibilityRole="button"
            accessibilityLabel="Christian"
          >
            <Ionicons name="sunny-outline" size={32} color={selected === 'christian' ? Colors.TEXT_ON_PRIMARY : Colors.PRIMARY} />
            <View style={styles.optionTextWrap}>
              <Text style={[styles.optionTitle, selected === 'christian' && styles.optionTextActive]}>Christian</Text>
              <Text style={[styles.optionDesc, selected === 'christian' && styles.optionTextActive]}>
                Focus on screen time, tasks, and brain score without religious features
              </Text>
            </View>
          </Pressable>
        </View>

        <Pressable
          style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!selected}
          accessibilityRole="button"
          accessibilityLabel="Continue"
        >
          <Text style={styles.continueBtnText}>Continue</Text>
        </Pressable>
      </Animated.View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', padding: Spacing.xl },
  iconWrap: { alignSelf: 'center', marginBottom: Spacing.lg },
  title: { fontSize: Typography.sizes['3xl'], fontFamily: Typography.families.display, fontWeight: 700, color: Colors.TEXT_PRIMARY, textAlign: 'center', marginBottom: Spacing.sm, letterSpacing: LetterSpacing.tight },
  subtitle: { fontSize: Typography.sizes.md, color: Colors.TEXT_SECONDARY, textAlign: 'center', lineHeight: Typography.lineHeight.normal, marginBottom: Spacing['2xl'] },
  options: { gap: Spacing.md, marginBottom: Spacing['2xl'] },
  optionCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderRadius: Radius.xl, backgroundColor: Colors.SURFACE, borderWidth: 1.5, borderColor: Colors.BORDER, ...Shadow.sm },
  optionActive: { backgroundColor: Colors.PRIMARY, borderColor: Colors.PRIMARY },
  optionTextWrap: { flex: 1, marginLeft: Spacing.md },
  optionTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.families.featureSemi, color: Colors.TEXT_PRIMARY, marginBottom: Spacing.xs },
  optionDesc: { fontSize: Typography.sizes.sm, color: Colors.TEXT_SECONDARY, lineHeight: Typography.lineHeight.normal },
  optionTextActive: { color: Colors.TEXT_ON_PRIMARY },
  continueBtn: { backgroundColor: Colors.PRIMARY, borderRadius: Radius.lg, paddingVertical: Spacing.lg, alignItems: 'center', ...Shadow.sm },
  continueBtnDisabled: { opacity: 0.5 },
  continueBtnText: { color: Colors.TEXT_ON_PRIMARY, fontSize: Typography.sizes.lg, fontWeight: 600 },
});
