// AURA Design System — calm warm-light palette built on three signature tones:
//   teal  #43686F  (primary accent / actions / active states)
//   gray  #B0B1B0  (neutral secondary / chips / dividers)
//   cream #F2E6DA  (canvas)
// Text is a warm deep-slate that harmonizes with the teal. Token names are
// preserved so every screen inherits the re-skin from this single source.
export const Colors = {
  BACKGROUND: '#F2E6DA', // warm cream canvas (signature)
  SURFACE: '#FFFFFF', // white cards / elevated surfaces
  SURFACE_RAISED: '#E8E2D9', // inputs, nested containers (warm off-white)
  PRIMARY: '#43686F', // teal — primary CTAs, highlights, active states (signature)
  PRIMARY_LIGHT: '#577E86', // lighter teal — hover / active tint
  PRIMARY_DARK: '#324E54', // deep teal — pressed, borders
  SECONDARY: '#B0B1B0', // neutral gray — secondary / chips / muted accents (signature)
  SECONDARY_LIGHT: '#C7C8C7',
  SECONDARY_DARK: '#8E8F8E',
  DANGER: '#B85C5C', // muted brick red for errors / negative trends
  DANGER_LIGHT: 'rgba(184,92,92,0.12)',
  WARNING: '#C2914E', // muted clay — semantic warnings only
  WARNING_LIGHT: 'rgba(194,145,78,0.14)',
  SUCCESS: '#5A8F7B', // deep sage — success / positive trends
  SUCCESS_LIGHT: 'rgba(90,143,123,0.14)',
  TEXT_PRIMARY: '#283133', // deep warm slate (never pure #000)
  TEXT_SECONDARY: 'rgba(40,49,51,0.55)', // muted meta text
  TEXT_ON_PRIMARY: '#F2E6DA', // CREAM text on teal / accent surfaces
  TEXT_ON_SURFACE: '#283133',
  BORDER: 'rgba(40,49,51,0.10)', // subtle slate hairline
  BORDER_LIGHT: 'rgba(40,49,51,0.05)',
  OVERLAY: 'rgba(40,49,51,0.45)',
  BLACK: '#000000',

  // ('#131313', 'Background'),
   // ('#2D2B2D', 'Card BG'),
  //  ('#4A4B48', 'Tertiary'),
  //  ('#6D6D69', 'Muted Text'),
  //  ('#8E9292', 'Secondary Text'),
  //  ('#B3B0AD', 'Light Text'),
    //('#D2D2D1', 'Warm White'),
    //('#F0F0F0', 'Pure White'),
   // ('#B4845F', 'Coral Accent'),
   // ('#7C4932', 'Deep Coral'),
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
    display: 'PlayfairDisplay_700Bold', // editorial serif — big headlines only
    displaySemi: 'PlayfairDisplay_600SemiBold',
    // Space Grotesk — cool geometric bold. Numbers, tab labels, eyebrows, stats.
    feature: 'SpaceGrotesk_700Bold',
    featureSemi: 'SpaceGrotesk_600SemiBold',
    featureMedium: 'SpaceGrotesk_500Medium',
    numeric: 'SpaceGrotesk_700Bold', // tabular-feel big numbers
    body: 'Inter_400Regular',
    bodyMedium: 'Inter_500Medium',
    bodySemibold: 'Inter_600SemiBold',
    bodyBold: 'Inter_700Bold',
    arabicUI: 'Cairo',
    arabicQuran: 'Amiri',
    mono: 'SpaceMono',
  },
  // Premium system uses 400/500/600/700 only — no thin 300, no heavy 800/900.
  // `light` and `extrabold` are kept as aliases (clamped into range) so existing
  // callers compile while honoring the weight discipline.
  weights: {
    light: '400' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '700' as const,
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

export const Gradients = {
  brand: ['#577E86', '#43686F'] as const, // teal sheen for primary CTAs (signature)
  brandDark: ['#43686F', '#324E54'] as const,
  surface: ['#FFFFFF', '#FBF8F4'] as const, // subtle top-down warmth on cards
  success: ['#7DB9A8', '#5A8F7B'] as const,
  danger: ['#C97B7B', '#B85C5C'] as const,
  score: ['#B85C5C', '#C2914E', '#5A8F7B'] as const, // low->mid->high brain score
  // App canvas — warm cream up top descending into a cool teal-tinted base.
  // A true two-color blend (cream -> pale teal) that the AuroraBackground
  // layers drifting blurred orbs over. Single source of the app background.
  canvas: ['#F6ECE0', '#E7EAE2', '#D6E2DE'] as const,
  // Teal hero panels / feature spotlights.
  hero: ['#577E86', '#43686F', '#324E54'] as const,
  // Soft tonal wash for decorative blobs over the canvas (very low opacity).
  glow: ['rgba(67,104,111,0.18)', 'rgba(67,104,111,0)'] as const,
};

// Glassmorphism base layers — translucent warm white that lets the canvas
// gradient read through the card, finished with a bright top-light rim.
export const Glass = {
  fill: 'rgba(255,255,255,0.62)',
  fillStrong: 'rgba(255,255,255,0.78)',
  border: 'rgba(255,255,255,0.65)', // bright glass rim highlight
  borderSlate: 'rgba(40,49,51,0.08)', // subtle slate hairline alt
};

export const Layout = {
  hairline: 1,
  maxContentWidth: 520,
  // Vertical space a tab screen must leave clear for the floating tab bar
  // (bar height + gap above the home indicator).
  tabBarClearance: 84,
};

export const LetterSpacing = { tight: -0.4, normal: 0, wide: 1.5 };

// Warm brown-tinted shadows keep depth natural on the cream canvas.
export const Shadow = {
  sm: {
    shadowColor: '#3C2814',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#3C2814',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#3C2814',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 28,
    elevation: 8,
  },
  glow: {
    shadowColor: '#3C2814',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 30,
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
  entrance: { duration: 450 },
  stagger: 70,
  pressScale: 0.96,
  springSoft: { damping: 18, stiffness: 180, mass: 0.6 },
};

export const theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  radius: Radius,
  sizing: Sizing,
  shadow: Shadow,
  animation: ANIMATION,
  gradients: Gradients,
  glass: Glass,
  layout: Layout,
  letterSpacing: LetterSpacing,
};
