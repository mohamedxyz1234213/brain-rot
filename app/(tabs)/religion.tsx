import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Radius, Sizing, Shadow, LetterSpacing, ANIMATION } from '../../src/constants/theme';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { SafeScreen, TabHeader } from '../../src/components/ui/SafeScreen';
import { useReligionStore, PrayerName, PrayerStatus } from '../../src/stores/religionStore';
import { useStreakStore } from '../../src/stores/streakStore';
import { useXPStore } from '../../src/stores/xpStore';
import { useSettingsStore } from '../../src/stores/settingsStore';

const PRAYER_LABELS: Record<PrayerName, string> = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };
const PRAYER_STATUS_COLORS: Record<string, string> = { on_time: Colors.SUCCESS, late: Colors.WARNING, missed: Colors.DANGER, pending: Colors.TEXT_SECONDARY };

function getPrayerTimes(method: string): Record<PrayerName, string> {
  const baseTimes: Record<PrayerName, string> = { fajr: '05:12', dhuhr: '12:30', asr: '15:45', maghrib: '18:22', isha: '19:50' };
  const offsets: Record<string, Record<PrayerName, number>> = {
    MWL: { fajr: -5, dhuhr: 0, asr: 10, maghrib: 5, isha: 10 },
    ISNA: { fajr: -10, dhuhr: -5, asr: 5, maghrib: 0, isha: 5 },
    Egypt: { fajr: 0, dhuhr: 5, asr: 15, maghrib: 8, isha: 12 },
    Makkah: { fajr: 3, dhuhr: -3, asr: 8, maghrib: 3, isha: 7 },
    Tehran: { fajr: -8, dhuhr: -2, asr: 12, maghrib: 6, isha: 15 },
  };
  const offset = offsets[method] ?? offsets.Makkah;
  const result: Record<PrayerName, string> = {} as any;
  for (const p of Object.keys(baseTimes) as PrayerName[]) {
    const [h, m] = baseTimes[p].split(':').map(Number);
    const total = h * 60 + m + (offset[p] ?? 0);
    result[p] = `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
  }
  return result;
}

export default function ReligionScreen() {
  const prayerLogs = useReligionStore((s) => s.prayerLogs);
  const logPrayer = useReligionStore((s) => s.logPrayer);
  const quranProgress = useReligionStore((s) => s.quranProgress);
  const updateQuranProgress = useReligionStore((s) => s.updateQuranProgress);
  const method = useReligionStore((s) => s.selectedCalculationMethod);
  const dhikrSessions = useReligionStore((s) => s.dhikrSessions);
  const [todayStatuses, setTodayStatuses] = useState<Record<PrayerName, PrayerStatus>>({} as any);

  const DHIKR_TARGET = 33;
  const activeDhikr = dhikrSessions[dhikrSessions.length - 1];
  const dhikrCount = activeDhikr && !activeDhikr.isCompleted ? activeDhikr.completedCount : activeDhikr?.isCompleted ? activeDhikr.targetCount : 0;

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
    if (status === 'on_time') {
      useXPStore.getState().addXP(15, `Prayed ${PRAYER_LABELS[prayer]} on time`);
      useStreakStore.getState().incrementStreak('prayers');
    } else if (status === 'missed') {
      useXPStore.getState().deductXP(15, `Missed ${PRAYER_LABELS[prayer]}`);
    }
  };

  const handleDhikrTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const store = useReligionStore.getState();
    const current = store.dhikrSessions[store.dhikrSessions.length - 1];
    if (!current || current.isCompleted) {
      store.startDhikr('subhanallah', DHIKR_TARGET);
    }
    store.incrementDhikr();
  };

  const handleReadQuran = () => {
    updateQuranProgress({ pagesReadToday: quranProgress.pagesReadToday + 1, lastReadAt: new Date().toISOString() });
    useXPStore.getState().addXP(10, 'Quran page read');
  };

  return (
    <SafeScreen tabBarSpacing>
      <TabHeader eyebrow={`Method · ${method}`} title="Prayers & Worship" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.duration(ANIMATION.entrance.duration)}>
          {prayers.map((prayer, index) => (
            <Animated.View key={prayer} entering={FadeInDown.duration(300).delay(index * ANIMATION.stagger)}>
            <Card dense glass style={styles.prayerCard}>
              <View style={styles.prayerRow}>
                <View style={styles.prayerLeft}>
                  <View style={[styles.statusDot, { backgroundColor: PRAYER_STATUS_COLORS[todayStatuses[prayer] ?? 'pending'] }]} />
                  <View>
                    <Text style={styles.prayerName}>{PRAYER_LABELS[prayer]}</Text>
                    <Text style={styles.prayerTime}>{prayerTimes[prayer]}</Text>
                  </View>
                </View>
                <View style={styles.prayerRight}>
                  {todayStatuses[prayer] === 'pending' ? (
                    <View style={styles.prayerActions}>
                      <Pressable style={[styles.statusBtn, { backgroundColor: Colors.SUCCESS }]} onPress={() => handleLogPrayer(prayer, 'on_time')} accessibilityRole="button" accessibilityLabel={`Prayed ${PRAYER_LABELS[prayer]} on time`}>
                        <Ionicons name="checkmark" size={Sizing.iconSm} color={Colors.TEXT_ON_PRIMARY} />
                      </Pressable>
                      <Pressable style={[styles.statusBtn, { backgroundColor: Colors.WARNING }]} onPress={() => handleLogPrayer(prayer, 'late')} accessibilityRole="button" accessibilityLabel={`Prayed ${PRAYER_LABELS[prayer]} late`}>
                        <Ionicons name="time-outline" size={Sizing.iconSm} color={Colors.TEXT_ON_PRIMARY} />
                      </Pressable>
                      <Pressable style={[styles.statusBtn, { backgroundColor: Colors.DANGER }]} onPress={() => handleLogPrayer(prayer, 'missed')} accessibilityRole="button" accessibilityLabel={`Missed ${PRAYER_LABELS[prayer]}`}>
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
            <Text style={styles.sectionTitle}>Quran Progress</Text>
            <Text style={styles.quranText}>Page {quranProgress.currentPage} · Juz {quranProgress.currentJuz}/30 · {quranProgress.pagesReadToday} pages today</Text>
            <View style={styles.quranActions}>
              <Button title="Read 1 Page" onPress={handleReadQuran} size="sm" />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(300)}>
          <Card glass style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Dhikr Counter</Text>
            <Text style={styles.dhikrText}>سُبْحَانَ اللهِ وَبِحَمْدِهِ</Text>
            <Text style={styles.dhikrTrans}>SubhanAllahi wa biHamdihi</Text>
            <Pressable style={styles.dhikrButton} onPress={handleDhikrTap} accessibilityRole="button" accessibilityLabel="Tap to count dhikr">
              <Text style={styles.dhikrButtonText}>{dhikrCount} / 33</Text>
            </Pressable>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <Card glass style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Fasting Tracker</Text>
            <Text style={styles.fastingText}>Track voluntary fasts and Ramadan</Text>
            <Button title="Log Fast" onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} size="sm" />
          </Card>
        </Animated.View>
      </ScrollView>
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
  fastingText: { fontSize: Typography.sizes.md, fontFamily: Typography.families.body, color: Colors.TEXT_SECONDARY, marginBottom: Spacing.md, lineHeight: Typography.lineHeight.normal },
});
