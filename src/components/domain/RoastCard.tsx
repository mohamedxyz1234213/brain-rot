import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../constants/theme';

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
    <View style={styles.container}>
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
    </View>
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
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: `${theme.colors.danger}44`,
  },
  header: {
    marginBottom: 12,
  },
  personaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  personaEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  personaName: {
    fontSize: theme.typography.md,
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trigger: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  offlineBadge: {
    fontSize: 10,
    color: theme.colors.warning,
    backgroundColor: `${theme.colors.warning}22`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  text: {
    fontSize: theme.typography.lg,
    color: theme.colors.textPrimary,
    lineHeight: 24,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  shareBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: `${theme.colors.danger}22`,
    borderRadius: theme.radius.sm,
  },
  shareBtnText: {
    fontSize: theme.typography.sm,
    color: theme.colors.danger,
    fontWeight: '600',
  },
});
