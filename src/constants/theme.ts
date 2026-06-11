/**
 * BrainRot Healer Design System Tokens
 * All UI components must reference these tokens.
 */

export const Colors = {
  PRIMARY: '#43686F',
  PRIMARY_LIGHT: '#6A9099',
  PRIMARY_DARK: '#2C4A50',
  SECONDARY: '#B0B1B0',
  SECONDARY_LIGHT: '#D4D5D4',
  BACKGROUND: '#0D1117',
  SURFACE: '#161B22',
  SURFACE_RAISED: '#1C2330',
  SUCCESS: '#2EA043',
  WARNING: '#D29922',
  DANGER: '#F85149',
  TEXT_PRIMARY: '#E6EDF3',
  TEXT_SECONDARY: '#8B949E',
} as const;

export const Typography = {
  sizes: {
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 38,
  },
  families: {
    display: 'System', // SF Pro Display (iOS) / Google Sans (Android)
    body: 'System', // SF Pro Text (iOS) / Roboto (Android)
    arabic: 'Cairo',
    quran: 'Amiri',
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export type ColorKey = keyof typeof Colors;
export type SpacingKey = keyof typeof Spacing;
export type RadiusKey = keyof typeof Radius;
export type TypographySizeKey = keyof typeof Typography.sizes;
