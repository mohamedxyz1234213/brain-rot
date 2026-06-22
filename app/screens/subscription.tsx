import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow, Layout, LetterSpacing, Sizing } from '../../src/constants/theme';
import { SafeScreen, ScreenHeader } from '../../src/components/ui';
import { resolveTiers, getRegionInfo, TierId, SUPPORTED_REGIONS } from '../../src/services/pricing';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useSubscriptionStore } from '../../src/stores/subscriptionStore';
import { useAuthStore } from '../../src/stores/authStore';

interface TierContent {
  id: TierId;
  name: string;
  features: string[];
  isCurrent?: boolean;
  isPopular?: boolean;
  trialDays?: number;
}

const TIER_CONTENT: TierContent[] = [
  {
    id: 'free',
    name: 'Free',
    features: ['Screen time view only', '3 tasks/day', 'Prayer times', '1 roast/day'],
    isCurrent: true,
  },
  {
    id: 'healed',
    name: 'Cured',
    features: [
      'Full app blocking',
      'Unlimited tasks',
      'AI day planner',
      'All 6 roast personas',
      'Focus sessions',
      'Religion section',
      'Streaks & XP',
      'Accountability circles',
      'Weekly brain scan',
      'All viral features',
      'Offline sync',
    ],
    isPopular: true,
    trialDays: 7,
  },
  {
    id: 'ascended',
    name: 'Ascended',
    features: [
      'Everything in Cured +',
      'AI Coach Chat (30 msgs/mo)',
      'Monthly Life Trailer',
      'App Wrapped',
      'Streak Shields (2/mo)',
      'Wall of Shame',
      'Custom notification sounds',
    ],
  },
  {
    id: 'family',
    name: 'Family',
    features: [
      '5 accounts',
      'Parent dashboard',
      'Child mode (gentle, no roasting)',
      'Shared circle',
      'All Cured features per member',
    ],
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    features: [
      'Everything in Ascended',
      'Forever access',
      'Beta features',
      'OG Badge',
    ],
  },
];

type BillingPeriod = 'monthly' | 'yearly';

export default function SubscriptionScreen() {
  const [billing, setBilling] = useState<BillingPeriod>('monthly');
  const [regionPickerOpen, setRegionPickerOpen] = useState(false);
  const regionOverride = useSettingsStore((s) => s.regionOverride);
  const setRegionOverrideStore = useSettingsStore((s) => s.setRegionOverride);
  const userId = useAuthStore((s) => s.user?.id);
  const currentTier = useSubscriptionStore((s) => s.tier);
  const setTier = useSubscriptionStore((s) => s.setTier);
  const syncSubscription = useSubscriptionStore((s) => s.syncSubscription);

  // Re-resolve whenever the override changes (regionOverride drives the
  // pricing cache reset via the root layout effect).
  const resolved = useMemo(() => resolveTiers(), [regionOverride]);
  const region = useMemo(() => getRegionInfo(), [regionOverride]);
  const regionLabel = SUPPORTED_REGIONS.find((r) => r.code === region.region)?.label ?? region.region;

  return (
    <SafeScreen>
      <ScreenHeader title="Upgrade Your Brain" subtitle="Choose the plan that fits your recovery journey." onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>

        <Pressable
          onPress={() => setRegionPickerOpen(true)}
          style={styles.regionRow}
          accessibilityRole="button"
          accessibilityLabel="Change region"
        >
          <Ionicons name="globe-outline" size={Sizing.iconSm} color={Colors.TEXT_SECONDARY} />
          <Text style={styles.regionText}>
            {regionLabel} · {region.currency}
            {regionOverride ? ' (manual)' : ''}
          </Text>
          <Ionicons name="chevron-down" size={Sizing.iconSm} color={Colors.TEXT_SECONDARY} />
        </Pressable>

        <View style={styles.billingToggle}>
          {(['monthly', 'yearly'] as BillingPeriod[]).map((opt) => (
            <Pressable
              key={opt}
              onPress={() => setBilling(opt)}
              style={[styles.billingChip, billing === opt && styles.billingChipActive]}
              accessibilityRole="button"
              accessibilityLabel={`Bill ${opt}`}
            >
              <Text style={[styles.billingText, billing === opt && styles.billingTextActive]}>
                {opt === 'monthly' ? 'Monthly' : 'Yearly'}
              </Text>
            </Pressable>
          ))}
        </View>

        {TIER_CONTENT.map((tier) => {
          const isCurrent = tier.id === currentTier;
          const prices = resolved.find((r) => r.id === tier.id);
          const monthly = prices?.monthly;
          const yearly = prices?.yearly;
          const lifetime = prices?.lifetime;

          const primary = tier.id === 'lifetime'
            ? lifetime
            : billing === 'yearly'
            ? (yearly ?? monthly)
            : monthly;
          const periodLabel = tier.id === 'lifetime'
            ? ' one-time'
            : billing === 'yearly' && yearly
            ? '/year'
            : monthly
            ? '/month'
            : '';

          const secondary = tier.id === 'lifetime' || !monthly
            ? null
            : billing === 'monthly' && yearly
            ? `or ${yearly.label}/year${prices?.yearlySavingsPercent ? ` · save ${prices.yearlySavingsPercent}%` : ''}`
            : billing === 'yearly' && monthly
            ? `or ${monthly.label}/month`
            : null;

          return (
            <View
              key={tier.id}
              style={[
                styles.tierCard,
                tier.isPopular && styles.tierCardPopular,
                isCurrent && styles.tierCardCurrent,
              ]}
            >
              {tier.isPopular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>Most Popular</Text>
                </View>
              )}

              <View style={styles.tierHeader}>
                <Text style={styles.tierName}>{tier.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>{primary?.label ?? `${region.currency} 0`}</Text>
                  <Text style={styles.period}>{periodLabel}</Text>
                </View>
                {secondary && <Text style={styles.yearlyPrice}>{secondary}</Text>}
              </View>

              <View style={styles.featureList}>
                {tier.features.map((feature) => (
                  <View key={feature} style={styles.featureRow}>
                    <Ionicons name="checkmark" size={Sizing.iconSm} color={Colors.SUCCESS} style={styles.featureCheck} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {tier.trialDays ? (
                <Text style={styles.trialText}>
                  {tier.trialDays}-day free trial
                </Text>
              ) : null}

              <Pressable
                style={[
                  styles.subscribeBtn,
                  isCurrent && styles.subscribeBtnCurrent,
                ]}
                onPress={() => {
                  setTier(tier.id);
                  if (userId) syncSubscription(userId);
                }}
                accessibilityRole="button"
                accessibilityLabel={isCurrent ? 'Current plan' : `Subscribe to ${tier.name}`}
              >
                <Text style={styles.subscribeBtnText}>
                  {isCurrent ? 'Current Plan' : `Subscribe to ${tier.name}`}
                </Text>
              </Pressable>
            </View>
          );
        })}

        <Text style={styles.footnote}>
          Final price is set by the App Store / Play Store at checkout and may differ slightly.
        </Text>
      </ScrollView>

      <Modal
        visible={regionPickerOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setRegionPickerOpen(false)}
      >
        <SafeScreen>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Choose your region</Text>
            <Pressable onPress={() => setRegionPickerOpen(false)} accessibilityRole="button" accessibilityLabel="Close">
              <Ionicons name="close" size={Sizing.iconLg} color={Colors.TEXT_PRIMARY} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pickerList}>
            <Pressable
              onPress={() => { setRegionOverrideStore(null); setRegionPickerOpen(false); }}
              style={[styles.pickerRow, !regionOverride && styles.pickerRowActive]}
              accessibilityRole="button"
              accessibilityLabel="Auto-detect region"
            >
              <Ionicons name="locate-outline" size={Sizing.iconMd} color={Colors.PRIMARY} />
              <Text style={styles.pickerRowText}>Auto-detect</Text>
              {!regionOverride && <Ionicons name="checkmark" size={Sizing.iconMd} color={Colors.PRIMARY} />}
            </Pressable>
            {SUPPORTED_REGIONS.map((r) => {
              const active = regionOverride === r.code;
              return (
                <Pressable
                  key={r.code}
                  onPress={() => { setRegionOverrideStore(r.code); setRegionPickerOpen(false); }}
                  style={[styles.pickerRow, active && styles.pickerRowActive]}
                  accessibilityRole="button"
                  accessibilityLabel={r.label}
                >
                  <Text style={styles.pickerRowCode}>{r.code}</Text>
                  <Text style={styles.pickerRowText}>{r.label}</Text>
                  {active && <Ionicons name="checkmark" size={Sizing.iconMd} color={Colors.PRIMARY} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </SafeScreen>
      </Modal>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  regionText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.families.feature,
    color: Colors.TEXT_SECONDARY,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  billingToggle: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: Colors.SURFACE_RAISED,
    borderRadius: Radius.full,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  billingChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
  },
  billingChipActive: {
    backgroundColor: Colors.PRIMARY,
  },
  billingText: {
    fontFamily: Typography.families.featureSemi,
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    letterSpacing: 0.3,
  },
  billingTextActive: {
    color: Colors.TEXT_ON_PRIMARY,
  },
  tierCard: {
    padding: Spacing.xl,
    backgroundColor: Colors.SURFACE,
    borderRadius: Radius.xl,
    marginBottom: Spacing.lg,
    borderWidth: Layout.hairline,
    borderColor: 'transparent',
    ...Shadow.sm,
  },
  tierCardPopular: {
    borderColor: Colors.PRIMARY,
    ...Shadow.glow,
  },
  tierCardCurrent: {
    borderColor: Colors.BORDER,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: Spacing.lg,
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  popularText: {
    color: Colors.TEXT_ON_PRIMARY,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    letterSpacing: LetterSpacing.tight,
  },
  tierHeader: {
    marginBottom: Spacing.lg,
  },
  tierName: {
    fontSize: Typography.sizes.xl,
    color: Colors.TEXT_PRIMARY,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: Typography.sizes['3xl'],
    color: Colors.TEXT_PRIMARY,
    fontWeight: Typography.weights.extrabold,
  },
  period: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    marginLeft: Spacing.xs,
  },
  yearlyPrice: {
    fontSize: Typography.sizes.sm,
    color: Colors.PRIMARY,
    marginTop: Spacing.xs,
  },
  featureList: {
    marginBottom: Spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  featureCheck: {
    marginRight: Spacing.sm,
  },
  featureText: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
  },
  trialText: {
    fontSize: Typography.sizes.sm,
    color: Colors.SUCCESS,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subscribeBtn: {
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.PRIMARY,
    borderRadius: Radius.lg,
    alignItems: 'center',
    minHeight: 44,
  },
  subscribeBtnCurrent: {
    backgroundColor: Colors.SURFACE_RAISED,
  },
  subscribeBtnText: {
    color: Colors.TEXT_ON_PRIMARY,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
  footnote: {
    fontSize: Typography.sizes.xs,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    lineHeight: 18,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: Layout.hairline,
    borderBottomColor: Colors.BORDER,
  },
  pickerTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.families.displaySemi,
    color: Colors.TEXT_PRIMARY,
    letterSpacing: LetterSpacing.tight,
  },
  pickerList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: Layout.hairline,
    borderBottomColor: Colors.BORDER_LIGHT,
  },
  pickerRowActive: {
    backgroundColor: 'rgba(75,104,110,0.08)',
  },
  pickerRowCode: {
    fontFamily: Typography.families.feature,
    fontSize: Typography.sizes.xs,
    color: Colors.PRIMARY,
    letterSpacing: 1.2,
    width: 36,
  },
  pickerRowText: {
    flex: 1,
    fontSize: Typography.sizes.md,
    fontFamily: Typography.families.body,
    color: Colors.TEXT_PRIMARY,
  },
});
