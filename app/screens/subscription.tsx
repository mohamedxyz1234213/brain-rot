import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme';
import { SafeScreen, ScreenHeader } from '../../src/components/ui';

const TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '',
    features: ['Screen time view only', '3 tasks/day', 'Prayer times', '1 roast/day'],
    isCurrent: true,
  },
  {
    id: 'healed',
    name: 'Healed',
    price: '$4.99',
    period: '/month',
    yearlyPrice: '$39.99/year',
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
    isCurrent: false,
    isPopular: true,
    trialDays: 7,
  },
  {
    id: 'ascended',
    name: 'Ascended',
    price: '$9.99',
    period: '/month',
    yearlyPrice: '$79.99/year',
    features: [
      'Everything in Healed +',
      'AI Coach Chat (30 msgs/mo)',
      'Monthly Life Trailer',
      'App Wrapped',
      'Streak Shields (2/mo)',
      'Wall of Shame',
      'Custom notification sounds',
    ],
    isCurrent: false,
  },
  {
    id: 'family',
    name: 'Family',
    price: '$14.99',
    period: '/month',
    features: [
      '5 accounts',
      'Parent dashboard',
      'Child mode (gentle, no roasting)',
      'Shared circle',
      'All Healed features per member',
    ],
    isCurrent: false,
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$79.99',
    period: ' one-time',
    features: [
      'Everything in Ascended',
      'Forever access',
      'Beta features',
      'OG Badge',
    ],
    isCurrent: false,
  },
];

export default function SubscriptionScreen() {
  return (
    <SafeScreen>
      <ScreenHeader title="Upgrade Your Brain" subtitle="Choose the plan that fits your recovery journey." onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {TIERS.map((tier) => (
          <View
            key={tier.id}
            style={[
              styles.tierCard,
              tier.isPopular && styles.tierCardPopular,
              tier.isCurrent && styles.tierCardCurrent,
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
                <Text style={styles.price}>{tier.price}</Text>
                <Text style={styles.period}>{tier.period}</Text>
              </View>
              {tier.yearlyPrice && (
                <Text style={styles.yearlyPrice}>or {tier.yearlyPrice}</Text>
              )}
            </View>

            <View style={styles.featureList}>
              {tier.features.map((feature) => (
                <View key={feature} style={styles.featureRow}>
                  <Text style={styles.featureCheck}>✓</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            {tier.trialDays && (
              <Text style={styles.trialText}>
                {tier.trialDays}-day free trial
              </Text>
            )}

            <Pressable
              style={[
                styles.subscribeBtn,
                tier.isCurrent && styles.subscribeBtnCurrent,
              ]}
              accessibilityRole="button"
              accessibilityLabel={tier.isCurrent ? 'Current plan' : `Subscribe to ${tier.name}`}
            >
              <Text style={styles.subscribeBtnText}>
                {tier.isCurrent ? 'Current Plan' : `Subscribe to ${tier.name}`}
              </Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  tierCard: {
    padding: Spacing.xl,
    backgroundColor: Colors.SURFACE,
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tierCardPopular: {
    borderColor: Colors.PRIMARY,
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
    borderRadius: 12,
  },
  popularText: {
    color: Colors.TEXT_ON_PRIMARY,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
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
    color: Colors.SUCCESS,
    fontSize: 14,
    marginRight: Spacing.sm,
    fontWeight: Typography.weights.bold,
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
    paddingVertical: 14,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 12,
    alignItems: 'center',
  },
  subscribeBtnCurrent: {
    backgroundColor: Colors.SURFACE_RAISED,
  },
  subscribeBtnText: {
    color: Colors.TEXT_ON_PRIMARY,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
});
