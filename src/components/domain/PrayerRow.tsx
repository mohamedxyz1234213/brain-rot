import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../constants/theme';

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
  on_time: theme.colors.success,
  late: theme.colors.warning,
  missed: theme.colors.danger,
  pending: theme.colors.secondary,
};

export function PrayerRow({ name, time, status, onLog }: PrayerRowProps) {
  return (
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
              style={[styles.statusBtn, { backgroundColor: theme.colors.success }]}
              onPress={() => onLog(name, 'on_time')}
            >
              <Text style={styles.statusBtnText}>✓</Text>
            </Pressable>
            <Pressable
              style={[styles.statusBtn, { backgroundColor: theme.colors.warning }]}
              onPress={() => onLog(name, 'late')}
            >
              <Text style={styles.statusBtnText}>⏰</Text>
            </Pressable>
            <Pressable
              style={[styles.statusBtn, { backgroundColor: theme.colors.danger }]}
              onPress={() => onLog(name, 'missed')}
            >
              <Text style={styles.statusBtnText}>✗</Text>
            </Pressable>
          </View>
        ) : (
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: STATUS_COLORS[status] },
            ]}
          >
            <Text style={styles.statusText}>
              {status === 'on_time' ? '✓' : status === 'late' ? '⏰' : '✗'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: `${theme.colors.secondary}33`,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  name: {
    fontSize: theme.typography.md,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  time: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
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
