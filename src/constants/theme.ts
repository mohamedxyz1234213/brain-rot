export const Colors = {
  BACKGROUND: '#0F1419',
  SURFACE: '#1A2332',
  SURFACE_RAISED: '#243447',
  PRIMARY: '#43686F',
  PRIMARY_LIGHT: '#6A9099',
  PRIMARY_DARK: '#2C4A50',
  SECONDARY: '#8B949E',
  SECONDARY_LIGHT: '#B0B1B0',
  SECONDARY_DARK: '#6E7681',
  DANGER: '#F85149',
  DANGER_LIGHT: '#F8514933',
  WARNING: '#D29922',
  WARNING_LIGHT: '#D2992233',
  SUCCESS: '#2EA043',
  SUCCESS_LIGHT: '#2EA04333',
  TEXT_PRIMARY: '#E6EDF3',
  TEXT_SECONDARY: '#8B949E',
  TEXT_ON_PRIMARY: '#FFFFFF',
  TEXT_ON_SURFACE: '#E6EDF3',
  BORDER: '#30363D',
  BORDER_LIGHT: '#21262D',
  OVERLAY: '#0F1419CC',
  BLACK: '#000000',
};

export const Typography = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 38,
  },
  families: {
    display: 'System',
    body: 'System',
    arabicUI: 'Cairo',
    arabicQuran: 'Amiri',
    mono: 'SpaceMono',
  },
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeight: {
    tight: 18,
    normal: 22,
    relaxed: 26,
    loose: 30,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
  screenTop: 60,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
};

export const Sizing = {
  iconSm: 16,
  iconMd: 24,
  iconLg: 32,
  avatarSm: 40,
  avatarMd: 64,
  avatarLg: 80,
  touchTarget: 44,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const ANIMATION = {
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 0.5,
  },
  timing: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
};

export const theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  radius: Radius,
  sizing: Sizing,
  shadow: Shadow,
  animation: ANIMATION,
};
