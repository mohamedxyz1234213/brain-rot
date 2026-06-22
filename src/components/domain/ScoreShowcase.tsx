import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors, Typography, Spacing, Radius, Shadow, LetterSpacing, ANIMATION } from '../../constants/theme';
import { BrainScoreOrb } from './BrainScoreOrb';

interface ScoreShowcaseProps {
  score: number;
  levelName: string;
  delta?: number | null;
  breakdown: {
    screenTimeScore: number;
    taskScore: number;
    focusScore: number;
    prayerScore: number;
    sleepScore: number;
  };
  style?: ViewStyle;
}

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const BREAKDOWN_META: { key: keyof ScoreShowcaseProps['breakdown']; labelKey: string; icon: IoniconName }[] = [
  { key: 'screenTimeScore', labelKey: 'dashboard.scoreBreakdownScreen', icon: 'phone-portrait-outline' },
  { key: 'taskScore', labelKey: 'dashboard.scoreBreakdownTasks', icon: 'checkmark-done-outline' },
  { key: 'focusScore', labelKey: 'dashboard.scoreBreakdownFocus', icon: 'timer-outline' },
  { key: 'prayerScore', labelKey: 'dashboard.scoreBreakdownSpirit', icon: 'moon-outline' },
  { key: 'sleepScore', labelKey: 'dashboard.scoreBreakdownSleep', icon: 'bed-outline' },
];

function getZoneColor(score: number): string {
  if (score >= 80) return Colors.SUCCESS;
  if (score >= 60) return Colors.PRIMARY;
  if (score >= 40) return Colors.WARNING;
  return Colors.DANGER;
}

function BreakdownCell({ value, icon, label, isArabic }: { value: number; icon: IoniconName; label: string; isArabic: boolean }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const color = getZoneColor(v);
  return (
    <View style={breakdownStyles.cell}>
      <View style={[breakdownStyles.iconWrap, { backgroundColor: `${color}22`, borderColor: `${color}44` }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={breakdownStyles.value}>{v}</Text>
      <Text style={[breakdownStyles.label, isArabic && breakdownStyles.labelArabic]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>{label}</Text>
    </View>
  );
}

export function ScoreShowcase({ score, levelName, delta, breakdown, style }: ScoreShowcaseProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const zone = getZoneColor(score);

  return (
    <Animated.View entering={FadeInDown.duration(ANIMATION.entrance.duration)} style={[styles.card, style]}>
      <BlurView intensity={48} tint="light" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(242,230,218,0.55)', 'rgba(214,226,222,0.45)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.tintOrb, { backgroundColor: `${zone}22`, top: -60, right: -60 }]} />
      <View style={[styles.tintOrb, { backgroundColor: 'rgba(67,104,111,0.14)', bottom: -80, left: -40, width: 220, height: 220 }]} />

      <View style={styles.inner}>
        <View style={styles.headerRow}>
          <View style={[styles.levelChip, { borderColor: `${zone}66`, backgroundColor: `${zone}1A` }]}>
            <View style={[styles.levelDot, { backgroundColor: zone }]} />
            <Text style={[styles.levelText, { color: zone }]}>{levelName}</Text>
          </View>
          {delta !== null && delta !== undefined && (
            <View
              style={[
                styles.deltaPill,
                {
                  backgroundColor: delta >= 0 ? `${Colors.SUCCESS}1F` : `${Colors.DANGER}1F`,
                  borderColor: delta >= 0 ? `${Colors.SUCCESS}55` : `${Colors.DANGER}55`,
                },
              ]}
            >
              <Ionicons
                name={delta >= 0 ? 'trending-up' : 'trending-down'}
                size={12}
                color={delta >= 0 ? Colors.SUCCESS : Colors.DANGER}
              />
              <Text style={[styles.deltaText, { color: delta >= 0 ? Colors.SUCCESS : Colors.DANGER }]}>
                {delta >= 0 ? '+' : ''}{delta}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.orbWrap}>
          <BrainScoreOrb score={score} size={220} />
        </View>

        <View style={styles.breakdownRow}>
          {BREAKDOWN_META.map((meta) => (
            <BreakdownCell
              key={meta.key}
              value={breakdown[meta.key]}
              icon={meta.icon}
              label={t(meta.labelKey)}
              isArabic={isArabic}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    ...Shadow.md,
  },
  inner: { padding: Spacing.xl },
  tintOrb: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  levelDot: { width: 7, height: 7, borderRadius: 4 },
  levelText: {
    fontSize: 11,
    fontFamily: Typography.families.featureSemi,
    letterSpacing: LetterSpacing.wide,
    textTransform: 'uppercase',
  },
  deltaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  deltaText: {
    fontSize: 11,
    fontFamily: Typography.families.featureSemi,
    letterSpacing: 0.4,
  },
  orbWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xl,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(40,49,51,0.08)',
  },
});

const breakdownStyles = StyleSheet.create({
  cell: { flex: 1, alignItems: 'center', gap: 4 },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    fontFamily: Typography.families.numeric,
    color: Colors.TEXT_PRIMARY,
    letterSpacing: -0.3,
  },
  label: {
    fontSize: 9,
    fontFamily: Typography.families.featureSemi,
    color: Colors.TEXT_SECONDARY,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  labelArabic: {
    fontFamily: Typography.families.bodySemibold,
    fontSize: 9,
    letterSpacing: 0,
    textTransform: 'none',
    writingDirection: 'rtl',
    includeFontPadding: false,
  },
});
