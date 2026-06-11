import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../../src/constants/theme';

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Upgrade Your Brain</Text>
        <Text style={styles.subtitle}>Choose the plan that fits your recovery journey.</Text>
      </View>

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
            >
              <Text style={styles.subscribeBtnText}>
                {tier.isCurrent ? 'Current Plan' : `Subscribe to ${tier.name}`}
              </Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  backBtn: {
    fontSize: Typography.sizes.md,
    color: Colors.PRIMARY,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes['2xl'],
    color: Colors.TEXT_PRIMARY,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
  },
  tierCard: {
    padding: Spacing.xl,
    backgroundColor: Colors.SURFACE,
    borderRadius: 16,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tierCardPopular: {
    borderColor: Colors.PRIMARY,
  },
  tierCardCurrent: {
    borderColor: Colors.SECONDARY,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  tierHeader: {
    marginBottom: Spacing.lg,
  },
  tierName: {
    fontSize: Typography.sizes.xl,
    color: Colors.TEXT_PRIMARY,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: Typography.sizes['3xl'],
    color: Colors.TEXT_PRIMARY,
    fontWeight: '800',
  },
  period: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    marginLeft: 4,
  },
  yearlyPrice: {
    fontSize: Typography.sizes.sm,
    color: Colors.PRIMARY,
    marginTop: 4,
  },
  featureList: {
    marginBottom: Spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureCheck: {
    color: Colors.SUCCESS,
    fontSize: 14,
    marginRight: 8,
    fontWeight: 'bold',
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
    color: '#fff',
    fontSize: Typography.sizes.md,
    fontWeight: '600',
  },
});
