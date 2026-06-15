import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
type PrayerStatus = 'on_time' | 'late' | 'missed' | 'pending';

interface PrayerRowProps {
  name: PrayerName;
  time: string;
  status: PrayerStatus;
  onLog: (name: PrayerName, status: 'on_time' | 'late' | 'missed') => void;
}

const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

const PRAYER_EMOJIS: Record<PrayerName, string> = {
  fajr: '🌅',
  dhuhr: '☀️',
  asr: '🌤️',
  maghrib: '🌆',
  isha: '🌙',
};

const STATUS_COLORS: Record<PrayerStatus, string> = {
  on_time: Colors.SUCCESS,
  late: Colors.WARNING,
  missed: Colors.DANGER,
  pending: Colors.SECONDARY,
};

export function PrayerRow({ name, time, status, onLog }: PrayerRowProps) {
  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <View style={styles.container}>
        <View style={styles.left}>
          <Text style={styles.emoji}>{PRAYER_EMOJIS[name]}</Text>
          <View>
            <Text style={styles.name}>{PRAYER_LABELS[name]}</Text>
            <Text style={styles.time}>{time}</Text>
          </View>
        </View>

        <View style={styles.right}>
          {status === 'pending' ? (
            <View style={styles.actions}>
              <Pressable
                style={[styles.statusBtn, { backgroundColor: Colors.SUCCESS }]}
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  onLog(name, 'on_time');
                }}
              >
                <Text style={styles.statusBtnText}>✓</Text>
              </Pressable>
              <Pressable
                style={[styles.statusBtn, { backgroundColor: Colors.WARNING }]}
                onPress={() => onLog(name, 'late')}
              >
                <Text style={styles.statusBtnText}>⏰</Text>
              </Pressable>
              <Pressable
                style={[styles.statusBtn, { backgroundColor: Colors.DANGER }]}
                onPress={() => onLog(name, 'missed')}
              >
                <Text style={styles.statusBtnText}>✗</Text>
              </Pressable>
            </View>
          ) : (
            <View
              style={[styles.statusIndicator, { backgroundColor: STATUS_COLORS[status] }]}
            >
              <Text style={styles.statusText}>
                {status === 'on_time' ? '✓' : status === 'late' ? '⏰' : '✗'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.SURFACE,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    borderWidth: 0.5,
    borderColor: `${Colors.SECONDARY}33`,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  name: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    fontWeight: '600',
  },
  time: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginTop: 2,
  },
  right: { flexDirection: 'row' },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statusBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
