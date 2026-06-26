import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { AVATARS } from '../../data/avatars';

interface AvatarDisplayProps {
  /** The avatar key from AVATARS (e.g. 'man-vampire-light-skin-tone') */
  avatarId?: string | null;
  /** Display size in pixels */
  size?: number;
  /** Optional border radius (defaults to full circle) */
  borderRadius?: number;
  /** Extra style */
  style?: object;
  /** Fallback icon when no avatar is set */
  fallback?: React.ReactNode;
}

/**
 * Renders a user's chosen SVG avatar in a circular container.
 * Falls back to the provided `fallback` (or a default person icon) when no avatarId is set.
 */
export function AvatarDisplay({
  avatarId,
  size = 48,
  borderRadius,
  style,
  fallback,
}: AvatarDisplayProps) {
  const xml = avatarId ? AVATARS[avatarId] : null;

  if (!xml) {
    return (
      <View
        style={[
          styles.fallback,
          { width: size, height: size, borderRadius: borderRadius ?? size / 2 },
          style,
        ]}
      >
        {fallback ?? null}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: borderRadius ?? size / 2 },
        style,
      ]}
    >
      <SvgXml xml={xml} width={size} height={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: 'rgba(67,104,111,0.08)',
  },
  fallback: {
    overflow: 'hidden',
    backgroundColor: 'rgba(67,104,111,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
