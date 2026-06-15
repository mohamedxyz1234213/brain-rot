import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Radius, Sizing } from '../../src/constants/theme';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { SafeScreen } from '../../src/components/ui/SafeScreen';
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
  const [todayStatuses, setTodayStatuses] = useState<Record<PrayerName, PrayerStatus>>({} as any);
  const [dhikrCount, setDhikrCount] = useState(0);

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
    setDhikrCount((c) => c + 1);
  };

  const handleReadQuran = () => {
    updateQuranProgress({ pagesReadToday: quranProgress.pagesReadToday + 1, lastReadAt: new Date().toISOString() });
    useXPStore.getState().addXP(10, 'Quran page read');
  };

  return (
    <SafeScreen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Prayers & Worship</Text>
        <Text style={styles.methodText}>Method: {method}</Text>

        <Animated.View entering={FadeInDown.duration(400)}>
          {prayers.map((prayer) => (
            <Card key={prayer} style={styles.prayerCard}>
              <View style={styles.prayerRow}>
                <View style={styles.prayerLeft}>
                  <View>
                    <Text style={styles.prayerName}>{PRAYER_LABELS[prayer]}</Text>
                    <Text style={styles.prayerTime}>{prayerTimes[prayer]}</Text>
                  </View>
                </View>
                <View style={styles.prayerRight}>
                  {todayStatuses[prayer] === 'pending' ? (
                    <View style={styles.prayerActions}>
                      <Pressable style={[styles.statusBtn, { backgroundColor: Colors.SUCCESS }]} onPress={() => handleLogPrayer(prayer, 'on_time')} accessibilityRole="button" accessibilityLabel={`Prayed ${PRAYER_LABELS[prayer]} on time`}>
                        <Text style={styles.statusBtnText}>✓</Text>
                      </Pressable>
                      <Pressable style={[styles.statusBtn, { backgroundColor: Colors.WARNING }]} onPress={() => handleLogPrayer(prayer, 'late')} accessibilityRole="button" accessibilityLabel={`Prayed ${PRAYER_LABELS[prayer]} late`}>
                        <Text style={styles.statusBtnText}>⏰</Text>
                      </Pressable>
                      <Pressable style={[styles.statusBtn, { backgroundColor: Colors.DANGER }]} onPress={() => handleLogPrayer(prayer, 'missed')} accessibilityRole="button" accessibilityLabel={`Missed ${PRAYER_LABELS[prayer]}`}>
                        <Text style={styles.statusBtnText}>✗</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <View style={[styles.statusIndicator, { backgroundColor: PRAYER_STATUS_COLORS[todayStatuses[prayer]] }]}>
                      <Text style={styles.statusText}>{todayStatuses[prayer] === 'on_time' ? '✓' : todayStatuses[prayer] === 'late' ? '⏰' : '✗'}</Text>
                    </View>
                  )}
                </View>
              </View>
            </Card>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Quran Progress</Text>
            <Text style={styles.quranText}>Page {quranProgress.currentPage} · Juz {quranProgress.currentJuz}/30 · {quranProgress.pagesReadToday} pages today</Text>
            <View style={styles.quranActions}>
              <Button title="Read 1 Page" onPress={handleReadQuran} size="sm" />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(300)}>
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Dhikr Counter</Text>
            <Text style={styles.dhikrText}>سُبْحَانَ اللهِ وَبِحَمْدِهِ</Text>
            <Text style={styles.dhikrTrans}>SubhanAllahi wa biHamdihi</Text>
            <Pressable style={styles.dhikrButton} onPress={handleDhikrTap} accessibilityRole="button" accessibilityLabel="Tap to count dhikr">
              <Text style={styles.dhikrButtonText}>{dhikrCount} / 33</Text>
            </Pressable>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <Card style={styles.sectionCard}>
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
  title: { fontSize: Typography.sizes['2xl'], fontWeight: 700, color: Colors.TEXT_PRIMARY },
  methodText: { fontSize: Typography.sizes.sm, color: Colors.TEXT_SECONDARY, marginTop: Spacing.xs, marginBottom: Spacing.xl },
  prayerCard: { marginBottom: Spacing.sm },
  prayerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  prayerLeft: { flexDirection: 'row', alignItems: 'center' },
  prayerName: { fontSize: Typography.sizes.md, color: Colors.TEXT_PRIMARY, fontWeight: 600 },
  prayerTime: { fontSize: Typography.sizes.sm, color: Colors.TEXT_SECONDARY, marginTop: 2 },
  prayerRight: { flexDirection: 'row' },
  prayerActions: { flexDirection: 'row', gap: Spacing.sm },
  statusBtn: { width: Sizing.iconLg, height: Sizing.iconLg, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  statusBtnText: { color: Colors.TEXT_ON_PRIMARY, fontSize: Typography.sizes.sm, fontWeight: 700 },
  statusIndicator: { width: Sizing.iconLg + Spacing.sm, height: Sizing.iconLg + Spacing.sm, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  statusText: { color: Colors.TEXT_ON_PRIMARY, fontSize: Typography.sizes.lg, fontWeight: 700 },
  sectionCard: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: Typography.sizes.lg, fontWeight: 600, color: Colors.TEXT_PRIMARY, marginBottom: Spacing.md },
  quranText: { fontSize: Typography.sizes.md, color: Colors.TEXT_SECONDARY, lineHeight: Typography.lineHeight.normal },
  quranActions: { marginTop: Spacing.md },
  dhikrText: { fontSize: Typography.sizes['2xl'], color: Colors.TEXT_PRIMARY, textAlign: 'center', lineHeight: Typography.lineHeight.loose, marginBottom: Spacing.sm },
  dhikrTrans: { fontSize: Typography.sizes.md, color: Colors.TEXT_SECONDARY, textAlign: 'center', marginBottom: Spacing.lg },
  dhikrButton: { backgroundColor: Colors.PRIMARY, borderRadius: Radius.lg, paddingVertical: Spacing.xl, alignItems: 'center' },
  dhikrButtonText: { color: Colors.TEXT_ON_PRIMARY, fontSize: Typography.sizes.xl, fontWeight: 700 },
  fastingText: { fontSize: Typography.sizes.md, color: Colors.TEXT_SECONDARY, marginBottom: Spacing.md, lineHeight: Typography.lineHeight.normal },
});
