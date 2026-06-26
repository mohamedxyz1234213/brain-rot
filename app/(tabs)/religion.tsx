import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Colors, Typography, Spacing, Radius, Sizing, Shadow, LetterSpacing, ANIMATION } from '../../src/constants/theme';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { SafeScreen, TabHeader } from '../../src/components/ui/SafeScreen';
import { useReligionStore, PrayerName, PrayerStatus } from '../../src/stores/religionStore';
import { useStreakStore } from '../../src/stores/streakStore';
import { useXPStore } from '../../src/stores/xpStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { PullToRefresh } from '../../src/components/ui/PullToRefresh';
import { useRefreshAll } from '../../src/hooks/useRefreshAll';
import { AnimatedSvgIllustration } from '../../src/components/ui/AnimatedSvgIllustration';
import { adhkar } from '../../src/data/adhkar';
import { getPrayerTimes } from '../../src/services/prayerTimes';

const DHIKR_CYCLE = [
  'subhanallah_33',
  'alhamdulillah_33',
  'allahuakbar_33',
  'subhanallah_wabihamdihi',
  'subhanallah_aladheem',
  'salawat_ibrahimiyya',
];

const PRAYER_STATUS_COLORS: Record<string, string> = { on_time: Colors.SUCCESS, late: Colors.WARNING, missed: Colors.DANGER, pending: Colors.TEXT_SECONDARY };

export default function ReligionScreen() {
  const { t } = useTranslation();
  const lang = useSettingsStore((s) => s.language);
  const prayerLogs = useReligionStore((s) => s.prayerLogs);
  const logPrayer = useReligionStore((s) => s.logPrayer);
  const quranProgress = useReligionStore((s) => s.quranProgress);
  const updateQuranProgress = useReligionStore((s) => s.updateQuranProgress);
  const method = useReligionStore((s) => s.selectedCalculationMethod);
  const dhikrSessions = useReligionStore((s) => s.dhikrSessions);
  const [todayStatuses, setTodayStatuses] = useState<Record<PrayerName, PrayerStatus>>({} as any);
  const refreshAll = useRefreshAll();

  const DHIKR_TARGET = 33;
  const activeDhikr = dhikrSessions[dhikrSessions.length - 1];
  const activeCycleId = activeDhikr?.dhikrId && DHIKR_CYCLE.includes(activeDhikr.dhikrId)
    ? activeDhikr.dhikrId
    : DHIKR_CYCLE[0];
  const activeCycleIndex = DHIKR_CYCLE.indexOf(activeCycleId);
  const activeMeta = adhkar.find((d) => d.id === activeCycleId) ?? adhkar.find((d) => d.id === DHIKR_CYCLE[0])!;
  const dhikrCount = activeDhikr && !activeDhikr.isCompleted && activeDhikr.dhikrId === activeCycleId
    ? activeDhikr.completedCount
    : 0;

  const prayerTimes = getPrayerTimes(method);
  const prayers: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const statuses: Record<PrayerName, PrayerStatus> = {} as any;
    for (const p of prayers) {
      const log = prayerLogs.find((l) => l.prayer === p && l.date.startsWith(today));
      statuses[p] = log ? log.status : 'pending';
    }
    setTodayStatuses(statuses);
  }, [prayerLogs]);

  const handleLogPrayer = (prayer: PrayerName, status: 'on_time' | 'late' | 'missed') => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    logPrayer(prayer, status);
    const prayerLabel = t(`religion.${prayer}`);
    if (status === 'on_time') {
      useXPStore.getState().addXP(15, lang === 'ar' ? `صليت ${prayerLabel} في وقتها` : `Prayed ${prayerLabel} on time`);
      useStreakStore.getState().incrementStreak('prayers');
    } else if (status === 'missed') {
      useXPStore.getState().deductXP(15, lang === 'ar' ? `فاتتني ${prayerLabel}` : `Missed ${prayerLabel}`);
    }
  };

  const handleDhikrTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const store = useReligionStore.getState();
    const current = store.dhikrSessions[store.dhikrSessions.length - 1];

    if (!current || current.isCompleted) {
      const nextId = current?.isCompleted && DHIKR_CYCLE.includes(current.dhikrId)
        ? DHIKR_CYCLE[(DHIKR_CYCLE.indexOf(current.dhikrId) + 1) % DHIKR_CYCLE.length]
        : DHIKR_CYCLE[0];
      store.startDhikr(nextId, DHIKR_TARGET);
      store.incrementDhikr();
      return;
    }

    store.incrementDhikr();

    const afterTap = useReligionStore.getState().dhikrSessions.slice(-1)[0];
    if (afterTap?.isCompleted) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const idx = DHIKR_CYCLE.indexOf(afterTap.dhikrId);
      const nextId = DHIKR_CYCLE[(idx + 1) % DHIKR_CYCLE.length];
      store.startDhikr(nextId, DHIKR_TARGET);
      useXPStore.getState().addXP(5, lang === 'ar' ? `أتممت ${DHIKR_TARGET} ذكر` : `Completed ${DHIKR_TARGET} dhikr`);
    }
  };

  const handleReadQuran = () => {
    updateQuranProgress({ pagesReadToday: quranProgress.pagesReadToday + 1, lastReadAt: new Date().toISOString() });
    useXPStore.getState().addXP(10, lang === 'ar' ? 'قرأت صفحة قرآن' : 'Quran page read');
  };

  return (
    <SafeScreen tabBarSpacing>
      <TabHeader eyebrow={t('religion.methodLabel', { method })} title={t('religion.prayerTracker')} />
      <PullToRefresh showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} onRefresh={refreshAll}>
        <Animated.View entering={FadeInDown.duration(ANIMATION.entrance.duration)}>
          {prayers.map((prayer, index) => (
            <Animated.View key={prayer} entering={FadeInDown.duration(300).delay(index * ANIMATION.stagger)}>
            <Card dense glass style={styles.prayerCard}>
              <View style={styles.prayerRow}>
                <View style={styles.prayerLeft}>
                  <View style={[styles.statusDot, { backgroundColor: PRAYER_STATUS_COLORS[todayStatuses[prayer] ?? 'pending'] }]} />
                  <View>
                    <Text style={styles.prayerName}>{t(`religion.${prayer}`)}</Text>
                    <Text style={styles.prayerTime}>{prayerTimes[prayer]}</Text>
                  </View>
                </View>
                <View style={styles.prayerRight}>
                  {todayStatuses[prayer] === 'pending' ? (
                    <View style={styles.prayerActions}>
                      <Pressable style={[styles.statusBtn, { backgroundColor: Colors.SUCCESS }]} onPress={() => handleLogPrayer(prayer, 'on_time')} accessibilityRole="button" accessibilityLabel={t('religion.prayedOnTime', { prayer: t(`religion.${prayer}`) })}>
                        <Ionicons name="checkmark" size={Sizing.iconSm} color={Colors.TEXT_ON_PRIMARY} />
                      </Pressable>
                      <Pressable style={[styles.statusBtn, { backgroundColor: Colors.WARNING }]} onPress={() => handleLogPrayer(prayer, 'late')} accessibilityRole="button" accessibilityLabel={t('religion.prayedLate', { prayer: t(`religion.${prayer}`) })}>
                        <Ionicons name="time-outline" size={Sizing.iconSm} color={Colors.TEXT_ON_PRIMARY} />
                      </Pressable>
                      <Pressable style={[styles.statusBtn, { backgroundColor: Colors.DANGER }]} onPress={() => handleLogPrayer(prayer, 'missed')} accessibilityRole="button" accessibilityLabel={t('religion.missed', { prayer: t(`religion.${prayer}`) })}>
                        <Ionicons name="close" size={Sizing.iconSm} color={Colors.TEXT_ON_PRIMARY} />
                      </Pressable>
                    </View>
                  ) : (
                    <View style={[styles.statusIndicator, { backgroundColor: PRAYER_STATUS_COLORS[todayStatuses[prayer]] }]}>
                      <Ionicons name={todayStatuses[prayer] === 'on_time' ? 'checkmark' : todayStatuses[prayer] === 'late' ? 'time-outline' : 'close'} size={Sizing.iconMd} color={Colors.TEXT_ON_PRIMARY} />
                    </View>
                  )}
                </View>
              </View>
            </Card>
            </Animated.View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <Card glass style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t('religion.quranProgress')}</Text>
            <Text style={styles.quranText}>{t('religion.quranPageLabel', { page: quranProgress.currentPage, juz: quranProgress.currentJuz, pages: quranProgress.pagesReadToday })}</Text>
            <View style={styles.quranActions}>
              <Button title={t('religion.readPage')} onPress={handleReadQuran} size="sm" />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(300)}>
          <Card glass style={styles.sectionCard}>
            <View style={styles.dhikrHeader}>
              <Text style={styles.sectionTitle}>{t('religion.dhikrCounter')}</Text>
              <Text style={styles.dhikrCycleLabel}>{activeCycleIndex + 1} / {DHIKR_CYCLE.length}</Text>
            </View>
            <Text style={styles.dhikrText}>{activeMeta.arabic}</Text>
            <Text style={styles.dhikrTrans}>{activeMeta.transliteration}</Text>
            <Pressable style={styles.dhikrButton} onPress={handleDhikrTap} accessibilityRole="button" accessibilityLabel={t('religion.tapToCount')}>
              <Text style={styles.dhikrButtonText}>{dhikrCount} / {DHIKR_TARGET}</Text>
            </Pressable>
            <View style={styles.dhikrDots}>
              {DHIKR_CYCLE.map((id, i) => (
                <View
                  key={id}
                  style={[
                    styles.dhikrDot,
                    i === activeCycleIndex && styles.dhikrDotActive,
                  ]}
                />
              ))}
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <Card glass style={styles.sectionCard}>
            <View style={styles.fastingHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>{t('religion.fasting')}</Text>
                <Text style={styles.fastingText}>{t('religion.fastingDesc')}</Text>
              </View>
              <AnimatedSvgIllustration illustrationKey="man-drinking-water" width={80} variant="breathe" delay={400} />
            </View>
            <Button title={t('religion.logFast')} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} size="sm" />
          </Card>
        </Animated.View>
      </PullToRefresh>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, paddingBottom: Spacing['3xl'] },
  prayerCard: { marginBottom: Spacing.md },
  prayerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  prayerLeft: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: Spacing.sm, height: Spacing.sm, borderRadius: Radius.full, marginRight: Spacing.md },
  prayerName: { fontSize: Typography.sizes.md, fontFamily: Typography.families.featureSemi, color: Colors.TEXT_PRIMARY },
  prayerTime: { fontSize: Typography.sizes.sm, fontFamily: Typography.families.numeric, color: Colors.TEXT_SECONDARY, marginTop: Spacing.xs },
  prayerRight: { flexDirection: 'row' },
  prayerActions: { flexDirection: 'row', gap: Spacing.sm },
  statusBtn: { width: Sizing.touchTarget, height: Sizing.touchTarget, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  statusIndicator: { width: Sizing.iconLg + Spacing.sm, height: Sizing.iconLg + Spacing.sm, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  sectionCard: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: Typography.sizes.xl, fontFamily: Typography.families.displaySemi, color: Colors.TEXT_PRIMARY, marginBottom: Spacing.md, letterSpacing: LetterSpacing.tight },
  quranText: { fontSize: Typography.sizes.md, fontFamily: Typography.families.body, color: Colors.TEXT_SECONDARY, lineHeight: Typography.lineHeight.normal },
  quranActions: { marginTop: Spacing.md },
  dhikrText: { fontSize: Typography.sizes['2xl'], color: Colors.TEXT_PRIMARY, textAlign: 'center', lineHeight: Typography.lineHeight.loose, marginBottom: Spacing.sm, fontFamily: Typography.families.arabicQuran },
  dhikrTrans: { fontSize: Typography.sizes.md, fontFamily: Typography.families.body, color: Colors.TEXT_SECONDARY, textAlign: 'center', marginBottom: Spacing.lg, fontStyle: 'italic' },
  dhikrButton: { backgroundColor: Colors.PRIMARY, borderRadius: Radius.xl, paddingVertical: Spacing.xl, alignItems: 'center', minHeight: Sizing.touchTarget, ...Shadow.glow },
  dhikrButtonText: { color: Colors.TEXT_ON_PRIMARY, fontSize: Typography.sizes['2xl'], fontFamily: Typography.families.numeric, letterSpacing: LetterSpacing.tight },
  dhikrHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  dhikrCycleLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.families.feature, color: Colors.TEXT_SECONDARY, letterSpacing: 1.2, textTransform: 'uppercase' },
  dhikrDots: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.xs, marginTop: Spacing.md },
  dhikrDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.BORDER },
  dhikrDotActive: { width: 18, backgroundColor: Colors.PRIMARY },
  fastingHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  fastingText: { fontSize: Typography.sizes.md, fontFamily: Typography.families.body, color: Colors.TEXT_SECONDARY, marginBottom: Spacing.md, lineHeight: Typography.lineHeight.normal },
});
