import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SvgXml } from 'react-native-svg';
import { Colors, Typography, Spacing, Radius, Shadow, LetterSpacing } from '../../src/constants/theme';
import { SafeScreen } from '../../src/components/ui/SafeScreen';
import { AVATARS, AVATAR_IDS } from '../../src/data/avatars';
import { useAuthStore } from '../../src/stores/authStore';
import { backendService } from '../../src/services/backend';

const LABELS: Record<string, string> = {
  'man-vampire-light-skin-tone': 'Vampire',
  'man-technologist-medium-skin-tone': 'Technologist',
  'man-supervillain-medium-skin-tone': 'Supervillain',
  'man-supervillain-medium-dark-skin-tone': 'Supervillain',
  'man-superhero-medium-skin-tone': 'Superhero',
  'man-superhero-light-skin-tone': 'Superhero',
  'man-superhero-dark-skin-tone': 'Superhero',
  'man-student-medium-skin-tone': 'Student',
  'man-pouting-light-skin-tone': 'Pouting',
  'man-pouting-dark-skin-tone': 'Pouting',
  'man-police-officer-medium-skin-tone': 'Police',
  'man-health-worker-medium-skin-tone': 'Health Worker',
  'man-light-skin-tone-beard': 'Beard',
  'man-light-skin-tone-curly-hair': 'Curly Hair',
  'man-medium-dark-skin-tone-curly-hair': 'Curly Hair',
};

const GRID_COLUMNS = 3;
const SCREEN_WIDTH = Dimensions.get('window').width;
const CELL_SIZE = Math.floor((SCREEN_WIDTH - Spacing.xl * 2 - Spacing.md * (GRID_COLUMNS - 1)) / GRID_COLUMNS);

export default function AvatarPickerScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);

  const handleContinue = () => {
    if (!selected) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Save avatar to local store
    useAuthStore.getState().updateProfile({ avatar: selected });

    // Save to backend (fire and forget)
    if (user?.id) {
      backendService.updateUser(user.id, { avatar: selected }).catch(() => {});
    }

    // Navigate to religion picker (next step in onboarding)
    router.replace('/(auth)/religion-picker');
  };

  return (
    <SafeScreen>
      <Animated.View entering={FadeInDown.duration(500)} style={styles.headerSection}>
        <View style={styles.iconWrap}>
          <Ionicons name="person-outline" size={52} color={Colors.PRIMARY} />
        </View>
        <Text style={styles.title}>Your Avatar</Text>
        <Text style={styles.subtitle}>
          Pick an avatar that represents you. This will appear next to your name.
        </Text>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {AVATAR_IDS.map((id, index) => {
          const isActive = id === selected;
          return (
            <Animated.View
              key={id}
              entering={FadeInDown.duration(300).delay(Math.min(index, 14) * 40)}
            >
              <Pressable
                style={[styles.cell, isActive && styles.cellActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelected(id);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Select ${LABELS[id] || id} avatar`}
              >
                <View style={[styles.avatarWrap, isActive && styles.avatarWrapActive]}>
                  <SvgXml xml={AVATARS[id]} width={CELL_SIZE - 24} height={CELL_SIZE - 24} />
                </View>
                {isActive && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={14} color={Colors.TEXT_ON_PRIMARY} />
                  </View>
                )}
                <Text style={styles.label} numberOfLines={1}>
                  {LABELS[id] || id}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>

      <View style={styles.actions}>
        <Pressable
          style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!selected}
          accessibilityRole="button"
          accessibilityLabel="Continue"
        >
          <Text style={styles.continueBtnText}>
            {selected ? 'Continue' : 'Pick an avatar to continue'}
          </Text>
        </Pressable>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  iconWrap: {
    alignSelf: 'center',
    marginBottom: Spacing.lg,
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(67,104,111,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.sizes['3xl'],
    fontFamily: Typography.families.display,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    letterSpacing: LetterSpacing.tight,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.normal,
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  cell: {
    width: CELL_SIZE,
    alignItems: 'center',
    gap: 6,
    position: 'relative',
  },
  avatarWrap: {
    width: CELL_SIZE - 8,
    height: CELL_SIZE - 8,
    borderRadius: Radius.xl,
    backgroundColor: Colors.SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    ...Shadow.sm,
  },
  avatarWrapActive: {
    borderColor: Colors.PRIMARY,
    backgroundColor: 'rgba(67,104,111,0.12)',
  },
  cellActive: {},
  checkBadge: {
    position: 'absolute',
    top: 2,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.families.featureMedium,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
  },
  actions: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['2xl'],
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  continueBtn: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    ...Shadow.sm,
  },
  continueBtnDisabled: {
    opacity: 0.5,
  },
  continueBtnText: {
    color: Colors.TEXT_ON_PRIMARY,
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
  },

});
