import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors, Typography, Spacing, Radius, Sizing, Shadow, LetterSpacing } from '../../src/constants/theme';
import { SafeScreen } from '../../src/components/ui';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useReligionStore, PrayerName } from '../../src/stores/religionStore';
import { useXPStore } from '../../src/stores/xpStore';
import { useStreakStore } from '../../src/stores/streakStore';
import { buildSchedule } from '../../src/services/prayerReminderService';
import { getPrayerTimes } from '../../src/services/prayerTimes';

export default function PrayerBlockScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ prayer?: PrayerName }>();
  const prayer = (params.prayer as PrayerName) ?? 'dhuhr';
  const prayerLabel = t(`religion.${prayer}`);
  const logPrayer = useReligionStore((s) => s.logPrayer);
  const method = useReligionStore((s) => s.selectedCalculationMethod);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const minutesLeft = useMemo(() => {
    const schedule = buildSchedule(getPrayerTimes(method));
    const found = schedule.find((s) => s.prayer === prayer);
    if (!found) return 0;
    return Math.max(0, Math.ceil((found.end.getTime() - now) / 60_000));
  }, [prayer, now, method]);

  const handleMarkPrayed = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    logPrayer(prayer, 'on_time');
    useXPStore.getState().addXP(15, t('religion.xpPrayerOnTime', { prayer: prayerLabel }));
    useStreakStore.getState().incrementStreak('prayers');
    router.back();
  };

  return (
    <SafeScreen>
      <Animated.View entering={FadeIn.duration(400)} style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="moon" size={Sizing.avatarMd} color={Colors.PRIMARY} />
        </View>

        <Text style={styles.eyebrow}>{t('religion.prayerLock')}</Text>
        <Text style={styles.title}>{t('religion.prayerNotPrayed', { prayer: prayerLabel })}</Text>
        <Text style={styles.subtitle}>
          {t('religion.prayerMinutesLeft', { minutes: minutesLeft })}
        </Text>

        <Card glass style={styles.reminder}>
          <Ionicons name="time-outline" size={Sizing.iconMd} color={Colors.PRIMARY} />
          <Text style={styles.reminderText}>
            {t('religion.prayerReminder')}
          </Text>
        </Card>

        <View style={styles.actions}>
          <Button title={t('religion.iPrayed', { prayer: prayerLabel })} onPress={handleMarkPrayed} size="lg" />
        </View>

        <Text style={styles.footnote}>{t('religion.prayerStaysClosed', { prayer: prayerLabel })}</Text>
      </Animated.View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: Spacing.xl, justifyContent: 'center' },
  iconWrap: {
    alignSelf: 'center',
    width: Sizing.avatarLg,
    height: Sizing.avatarLg,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(75,104,110,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadow.sm,
  },
  eyebrow: {
    fontFamily: Typography.families.feature,
    fontSize: Typography.sizes.xs,
    color: Colors.PRIMARY,
    textAlign: 'center',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  title: {
    fontFamily: Typography.families.display,
    fontSize: Typography.sizes['2xl'],
    color: Colors.TEXT_PRIMARY,
    textAlign: 'center',
    letterSpacing: LetterSpacing.tight,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontFamily: Typography.families.body,
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.relaxed,
    marginBottom: Spacing.xl,
  },
  timeLeft: {
    fontFamily: Typography.families.numeric,
    color: Colors.DANGER,
  },
  reminder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  reminderText: {
    flex: 1,
    fontFamily: Typography.families.body,
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_PRIMARY,
    lineHeight: Typography.lineHeight.normal,
  },
  actions: { marginBottom: Spacing.lg },
  footnote: {
    fontFamily: Typography.families.body,
    fontSize: Typography.sizes.xs,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    letterSpacing: 0.4,
  },
});
