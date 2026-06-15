import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

interface RoastCardProps {
  persona: string;
  personaEmoji: string;
  text: string;
  trigger: string;
  createdAt: string;
  isOffline: boolean;
  onShare?: () => void;
}

export function RoastCard({
  persona,
  personaEmoji,
  text,
  trigger,
  createdAt,
  isOffline,
  onShare,
}: RoastCardProps) {
  const date = new Date(createdAt);
  const timeAgo = getTimeAgo(date);

  return (
    <Animated.View entering={FadeInUp.duration(300)} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.personaRow}>
          <Text style={styles.personaEmoji}>{personaEmoji}</Text>
          <Text style={styles.personaName}>{persona}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.trigger}>{trigger}</Text>
          {isOffline && <Text style={styles.offlineBadge}>offline</Text>}
        </View>
      </View>

      <Text style={styles.text}>{text}</Text>

      <View style={styles.footer}>
        <Text style={styles.time}>{timeAgo}</Text>
        {onShare && (
          <Pressable style={styles.shareBtn} onPress={onShare}>
            <Text style={styles.shareBtnText}>Share My Shame 💀</Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    backgroundColor: Colors.SURFACE,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    borderWidth: 0.5,
    borderColor: `${Colors.DANGER}44`,
  },
  header: { marginBottom: Spacing.md },
  personaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  personaEmoji: { fontSize: 20, marginRight: Spacing.sm },
  personaName: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  trigger: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    textTransform: 'capitalize',
  },
  offlineBadge: {
    fontSize: 10,
    color: Colors.WARNING,
    backgroundColor: `${Colors.WARNING}22`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  text: {
    fontSize: Typography.sizes.lg,
    color: Colors.TEXT_PRIMARY,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
  },
  shareBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: `${Colors.DANGER}22`,
    borderRadius: Radius.sm,
  },
  shareBtnText: {
    fontSize: Typography.sizes.sm,
    color: Colors.DANGER,
    fontWeight: '600',
  },
});
