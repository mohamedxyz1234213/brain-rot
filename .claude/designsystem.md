AURA Design System

Premium Warm-Modern UI/UX Transformation Skill

Version: 1.0
Purpose: Transform any web or mobile app into a premium, warm, clean, editorial-grade design that never looks AI-generated.
Core Philosophy: "Designed by humans, for humans." Warmth, tactility, and intentional imperfection.
CRITICAL RULES (Non-Negotiable)

NO EMOJIS — Never use emojis in UI text, labels, buttons, or anywhere visible to users. Use Lucide icons or custom SVGs only.
NO GENERIC AI VIBE — Avoid: neon gradients, rainbow accents, sharp 90° corners on interactive elements, default system fonts, stock-looking layouts, excessive borders, checkerboard patterns, robot/AI illustrations.
WARMTH FIRST — Every color, shadow, and spacing decision must feel warm and inviting, not cold or clinical.
EDITORIAL ELEGANCE — Design should feel like a high-end magazine or luxury brand app, not a dashboard or enterprise tool.
TACTILE REALISM — Elements should feel physical: soft shadows, rounded edges, subtle textures, breathing room.
THEME SYSTEM

Adaptive Theme Engine

The design system auto-adapts between two modes based on app context:
Mode A: "Noir" (Dark Cinematic)

Use for: Social, entertainment, streaming, creative portfolios, nightlife
Background: #0A0A0A (deep warm black, not pure #000)
Surface: #141414 to #1C1C1E (warm dark gray)
Surface Elevated: #242424 with backdrop-filter: blur(24px)
Text Primary: #F5F5F0 (warm white, not pure #FFF)
Text Secondary: rgba(245, 245, 240, 0.6)
Text Tertiary: rgba(245, 245, 240, 0.35)
Accent: #C4A77D (warm champagne gold) or #D4A574 (warm terracotta)
Accent Soft: rgba(196, 167, 125, 0.15)
Success: #7DB9A8 (muted sage green)
Danger: #C97B7B (muted rose)
Mode B: "Linen" (Warm Light)

Use for: Booking, wellness, lifestyle, editorial, e-commerce, food
Background: #F5F0EB (warm linen/cream)
Surface: #FFFFFF (pure white cards)
Surface Elevated: #FFFFFF with box-shadow: 0 8px 32px rgba(60, 40, 20, 0.08)
Text Primary: #1A1A1A (soft black, not pure #000)
Text Secondary: rgba(26, 26, 26, 0.55)
Text Tertiary: rgba(26, 26, 26, 0.3)
Accent: #1A1A1A (black for primary actions) or #8B6914 (warm antique gold)
Accent Soft: rgba(139, 105, 20, 0.1)
Success: #5A8F7B (deep sage)
Danger: #B85C5C (brick red)
Context-Aware Switching

If the app is social/entertainment/streaming → Default to Noir
If the app is booking/wellness/lifestyle/food → Default to Linen
Always provide a subtle toggle between modes if appropriate
TYPOGRAPHY SYSTEM

Font Stack

css

--font-display: 'Playfair Display', 'Cormorant Garamond', Georgia, serif;
--font-body: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'SF Mono', 'Fira Code', monospace;
Scale (Mobile-First)

Table


Token	Size	Weight	Line-Height	Letter-Spacing	Use
hero	48px	300 (Light)	1.1	-0.02em	Splash screens, major headlines
h1	32px	600	1.2	-0.01em	Page titles
h2	24px	600	1.3	-0.005em	Section headers
h3	20px	500	1.35	0	Card titles
body-large	17px	400	1.5	0.01em	Primary body text
body	15px	400	1.55	0.01em	Standard text
caption	13px	500	1.4	0.02em	Labels, timestamps (UPPERCASE)
micro	11px	600	1.3	0.04em	Badges, tags (UPPERCASE)
Typography Rules

Display font (serif) ONLY for: brand names, hero headlines, major section titles
Body font (sans-serif) for: everything else — UI labels, buttons, body text, navigation
Never use display font for: buttons, navigation, small labels, form inputs
Letter-spacing: Tighter for large text, slightly loose for small/caption text
Line-height: Generous (1.5+) for readability, tight (1.1-1.2) for headlines
SPACING SYSTEM

Base Unit: 4px

css

--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
Spacing Rules

Card padding: 20px-24px (never less than 16px)
Section gaps: 32px-48px between major sections
Element gaps: 12px-16px between related elements
Edge padding: 20px-24px on mobile, 40px+ on desktop
Breathing room: When in doubt, add MORE space, not less
SHAPE & CORNER SYSTEM

Radius Scale

css

--radius-sm: 8px;      /* Small buttons, tags, inputs */
--radius-md: 12px;     /* Medium cards, list items */
--radius-lg: 16px;     /* Standard cards, modals */
--radius-xl: 20px;     /* Large cards, image containers */
--radius-2xl: 24px;    /* Hero cards, featured sections */
--radius-3xl: 32px;    /* Full-screen modals, bottom sheets */
--radius-full: 9999px; /* Avatars, pills, circular buttons */
Shape Rules

Cards: 16px-24px radius (never sharp corners)
Buttons: 12px-16px radius (pill shape for primary CTAs: radius-full)
Inputs: 12px radius with 1px subtle border
Images: 16px-20px radius (slightly less than their container)
Avatars: Fully circular (radius-full)
Tags/Chips: Pill shape (radius-full)
Bottom sheets: 24px-32px top radius only
SHADOW SYSTEM

Shadow Philosophy

Shadows must feel like natural light casting on a warm surface. Never harsh, never blue-tinted.
css

/* Linen Mode Shadows */
--shadow-sm: 0 2px 8px rgba(60, 40, 20, 0.06);
--shadow-md: 0 4px 16px rgba(60, 40, 20, 0.08);
--shadow-lg: 0 8px 32px rgba(60, 40, 20, 0.1);
--shadow-xl: 0 16px 48px rgba(60, 40, 20, 0.12);
--shadow-float: 0 24px 64px rgba(60, 40, 20, 0.14);

/* Noir Mode Shadows */
--shadow-dark-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
--shadow-dark-md: 0 4px 16px rgba(0, 0, 0, 0.4);
--shadow-dark-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
--shadow-glow: 0 0 24px rgba(196, 167, 125, 0.15);
Shadow Rules

Light mode: Warm brown tint in shadows (not gray/black)
Dark mode: Pure black shadows with subtle warm glow for accents
Cards always have at least shadow-md
Floating elements (nav bars, FABs) use shadow-lg or shadow-float
Never use colored shadows (no red/green/blue shadows)
COMPONENT LIBRARY

Buttons

Primary Button

css

.btn-primary {
  background: var(--accent);
  color: var(--background);
  padding: 16px 32px;
  border-radius: 9999px; /* Pill shape */
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.02em;
  border: none;
  box-shadow: 0 4px 16px rgba(196, 167, 125, 0.3);
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.2s ease;
}
.btn-primary:active {
  transform: scale(0.96);
  box-shadow: 0 2px 8px rgba(196, 167, 125, 0.2);
}
Secondary Button

css

.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  padding: 16px 32px;
  border-radius: 9999px;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 500;
  border: 1px solid var(--text-tertiary);
  transition: background 0.2s ease, border-color 0.2s ease;
}
.btn-secondary:hover {
  background: var(--accent-soft);
  border-color: var(--accent);
}
Ghost Button

css

.btn-ghost {
  background: rgba(245, 245, 240, 0.08);
  color: var(--text-primary);
  padding: 12px 20px;
  border-radius: 12px;
  border: none;
  backdrop-filter: blur(12px);
}
Cards

Standard Card (Linen)

css

.card {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(60, 40, 20, 0.08);
  border: 1px solid rgba(60, 40, 20, 0.04);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.3s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(60, 40, 20, 0.12);
}
Glass Card (Noir)

css

.card-glass {
  background: rgba(36, 36, 36, 0.6);
  border-radius: 20px;
  padding: 24px;
  backdrop-filter: blur(24px) saturate(1.2);
  border: 1px solid rgba(245, 245, 240, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
Image Card

css

.card-image {
  border-radius: 20px;
  overflow: hidden;
  position: relative;
}
.card-image::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  border-radius: 0 0 20px 20px;
}
Inputs

Text Input

css

.input {
  background: var(--surface);
  border: 1px solid rgba(60, 40, 20, 0.1);
  border-radius: 12px;
  padding: 16px 20px;
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--text-primary);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-soft);
}
.input::placeholder {
  color: var(--text-tertiary);
}
Tags / Chips

css

.tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.02em;
  background: var(--surface);
  color: var(--text-secondary);
  border: 1px solid rgba(60, 40, 20, 0.08);
}
.tag-active {
  background: var(--text-primary);
  color: var(--background);
  border-color: transparent;
}
Avatars

css

.avatar {
  border-radius: 9999px;
  object-fit: cover;
  border: 2px solid var(--background);
  box-shadow: 0 2px 8px rgba(60, 40, 20, 0.1);
}
.avatar-sm { width: 32px; height: 32px; }
.avatar-md { width: 48px; height: 48px; }
.avatar-lg { width: 64px; height: 64px; }
.avatar-xl { width: 96px; height: 96px; }
Navigation

Floating Bottom Bar (Noir)

css

.nav-bottom {
  position: fixed;
  bottom: 24px;
  left: 24px;
  right: 24px;
  height: 64px;
  background: rgba(28, 28, 30, 0.85);
  backdrop-filter: blur(24px) saturate(1.2);
  border-radius: 24px;
  border: 1px solid rgba(245, 245, 240, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 16px;
}
Top Navigation (Linen)

css

.nav-top {
  position: sticky;
  top: 0;
  background: rgba(245, 240, 235, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(60, 40, 20, 0.06);
  padding: 16px 24px;
  z-index: 100;
}
ANIMATION SYSTEM

Easing Curves

css

--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);      /* Bouncy, organic */
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);            /* Standard material */
--ease-decelerate: cubic-bezier(0, 0, 0.2, 1);        /* Entering elements */
--ease-accelerate: cubic-bezier(0.4, 0, 1, 1);        /* Exiting elements */
--ease-dramatic: cubic-bezier(0.87, 0, 0.13, 1);      /* Hero transitions */
Duration Scale

css

--duration-instant: 100ms;   /* Micro-interactions, hovers */
--duration-fast: 200ms;      /* Button presses, toggles */
--duration-normal: 300ms;    /* Card transitions, modals */
--duration-slow: 500ms;      /* Page transitions, reveals */
--duration-dramatic: 800ms;  /* Hero animations, splash */
Animation Patterns

Card Entrance (Staggered)

css

@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.card-enter {
  animation: cardEnter 0.5s var(--ease-spring) forwards;
}
/* Stagger children: animation-delay: calc(var(--index) * 80ms) */
Page Transition

css

@keyframes pageEnter {
  from {
    opacity: 0;
    transform: translateX(20px);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
    filter: blur(0);
  }
}
Image Reveal

css

@keyframes imageReveal {
  from {
    clip-path: inset(100% 0 0 0);
    transform: scale(1.1);
  }
  to {
    clip-path: inset(0 0 0 0);
    transform: scale(1);
  }
}
Pulse (Subtle Attention)

css

@keyframes gentlePulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.9; }
}
Shimmer (Loading State)

css

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(
    90deg,
    var(--surface) 25%,
    rgba(196, 167, 125, 0.1) 50%,
    var(--surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
Interaction Micro-Animations

Button press: Scale to 0.96, 200ms spring easing
Card tap: Scale to 0.98, subtle shadow reduction
Toggle switch: Spring overshoot (goes slightly past target, settles back)
Pull-to-refresh: Elastic resistance, snap back with spring
Scroll parallax: Images move at 0.8x scroll speed, text at 1x
Hover lift: Card lifts 4px, shadow expands (desktop only)
LAYOUT PATTERNS

Mobile Layout Grid

css

--grid-columns: 4;
--grid-margin: 20px;
--grid-gutter: 12px;
Common Layouts

Hero + Scroll (Noir Social)

plain

[Status Bar]
[Logo + Icons] — minimal, 24px height
[Horizontal Avatar Scroll] — 80px circles, edge-to-edge
[Section Title] — 32px bold, left-aligned
[Horizontal Card Scroll] — 280px wide cards, 16px gap, peek next
[Grid Section] — 2 columns, 16px gap
[Floating Bottom Nav] — 64px pill, centered
Stacked Cards (Linen Booking)

plain

[Hero Image] — Full width, 24px bottom radius, gradient overlay
[Overlapping Card] — Negative margin -40px, white, 24px radius, shadow-lg
  [Service Title]
  [Stylist Row] — Avatar + Name + Verified badge
  [Divider] — 1px, subtle
  [Details Grid] — 2 columns, icon + label
[CTA Button] — Full width, pill, fixed bottom with safe area
Editorial Grid

plain

[Header] — Sticky, blur background
[Featured Card] — Large, full-width, image dominant
[ Masonry Grid ] — 2 columns, varying heights, 12px gap
[Load More] — Ghost button, centered
IMAGE TREATMENT

Image Rules

Always use real photography — Never use generic illustrations, 3D renders, or AI-generated art
Warm color grading — Slightly warm temperature, reduced contrast, soft highlights
Gradient overlays — For text-on-image, use warm-tinted gradients:
Bottom-to-top: linear-gradient(to top, rgba(10,10,10,0.8), transparent 60%)
Warm tint: linear-gradient(135deg, rgba(196,167,125,0.1), transparent)
Rounded corners — All images have 16px-20px radius (never sharp)
Object-fit: cover for thumbnails, contain for product shots
Loading state: Warm-toned skeleton shimmer, never spinning circles
Image Placeholder

css

.image-placeholder {
  background: linear-gradient(135deg, #E8E0D8, #F0EBE5);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: 13px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
ICON SYSTEM

Icon Rules

Use Lucide icons only — Never emojis, never custom SVGs unless necessary
Stroke width: 1.5px (not default 2px — thinner feels more premium)
Size scale: 16px (micro), 20px (standard), 24px (navigation), 32px (feature)
Color: Inherit from text color, or use accent for active states
No icon + text on small buttons — Icon-only for nav, text-only for CTAs, or icon-left + text for secondary actions
Icon Treatment

css

.icon {
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.2s var(--ease-spring);
}
.icon-button:hover .icon {
  transform: scale(1.1);
}
SCROLL & GESTURE BEHAVIOR

Horizontal Scrolls

css

.scroll-horizontal {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 0 20px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE */
}
.scroll-horizontal::-webkit-scrollbar {
  display: none;
}
.scroll-horizontal > * {
  scroll-snap-align: start;
  flex-shrink: 0;
}
/* First/last item padding for edge-to-edge feel */
.scroll-horizontal::before,
.scroll-horizontal::after {
  content: '';
  flex: 0 0 4px;
}
Pull to Refresh

Elastic resistance (feels like pulling a rubber band)
Warm champagne gold spinner or custom animation
Snap back with spring physics
Infinite Scroll

Skeleton cards appear at bottom with staggered animation
No "Loading..." text — visual only
Smooth content insertion with layout animation
EMPTY STATES

Empty State Design

css

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  text-align: center;
}
.empty-state-icon {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: var(--accent-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}
.empty-state-icon svg {
  width: 32px;
  height: 32px;
  color: var(--accent);
  stroke-width: 1.5;
}
.empty-state-title {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 400;
  color: var(--text-primary);
  margin-bottom: 8px;
}
.empty-state-body {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.5;
  max-width: 280px;
}
ACCESSIBILITY

Contrast Requirements

Text primary: 7:1 minimum contrast ratio
Text secondary: 4.5:1 minimum
Interactive elements: 3:1 minimum against adjacent colors
Motion Preferences

css

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
Focus States

css

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 4px;
}
ANTI-PATTERNS (What NOT To Do)

Never use: Rainbow gradients, neon colors, sharp 90° corners on cards
Never use: Default system fonts as display fonts
Never use: Emojis in UI (use Lucide icons)
Never use: Blue-tinted shadows or gray shadows in light mode
Never use: Thin 1px borders around everything (use shadow + background contrast)
Never use: Center-aligned body text (left-align for readability)
Never use: All-caps for body text (only for micro labels)
Never use: More than 2 font families
Never use: Pure black (#000) or pure white (#FFF) as backgrounds (use warm variants)
Never use: Linear, mechanical animations (always use spring/ease)
Never use: Generic stock illustrations or 3D character art
Never use: More than 3 colors in a single view
Never use: Harsh drop shadows with high opacity
Never use: Underlined text for buttons (use padding + background)
Never use: Default browser form styling
IMPLEMENTATION CHECKLIST

When applying this design system to any app:
[ ] Determine Noir vs Linen mode based on app category
[ ] Set up CSS custom properties (variables) for the chosen theme
[ ] Import Playfair Display (400, 600) and Inter (400, 500, 600) fonts
[ ] Apply base spacing (20px margins, 16px gaps minimum)
[ ] Round ALL corners: cards 20px, buttons pill or 16px, images 20px
[ ] Add warm shadows to all elevated surfaces
[ ] Replace all emojis with Lucide icons
[ ] Implement staggered card entrance animations
[ ] Add spring physics to all interactive elements
[ ] Ensure 48px minimum touch targets
[ ] Add backdrop-filter blur to floating/nav elements
[ ] Use gradient overlays on all text-over-image scenarios
[ ] Implement smooth page transitions
[ ] Add skeleton loading states with warm shimmer
[ ] Test reduced motion preferences
[ ] Verify contrast ratios meet WCAG AA
QUICK START TEMPLATE

HTML


<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aura App</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    :root {
      /* Choose ONE theme: */

      /* LINEN (Light) */
      --bg: #F5F0EB;
      --surface: #FFFFFF;
      --surface-elevated: #FFFFFF;
      --text-primary: #1A1A1A;
      --text-secondary: rgba(26, 26, 26, 0.55);
      --text-tertiary: rgba(26, 26, 26, 0.3);
      --accent: #1A1A1A;
      --accent-soft: rgba(26, 26, 26, 0.06);
      --shadow: 0 8px 32px rgba(60, 40, 20, 0.08);
      --shadow-hover: 0 16px 48px rgba(60, 40, 20, 0.12);

      /* NOIR (Dark) - Uncomment to use */
      /*
      --bg: #0A0A0A;
      --surface: #1C1C1E;
      --surface-elevated: rgba(36, 36, 36, 0.6);
      --text-primary: #F5F5F0;
      --text-secondary: rgba(245, 245, 240, 0.6);
      --text-tertiary: rgba(245, 245, 240, 0.35);
      --accent: #C4A77D;
      --accent-soft: rgba(196, 167, 125, 0.15);
      --shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      --shadow-hover: 0 16px 48px rgba(0, 0, 0, 0.5);
      */

      --font-display: 'Playfair Display', Georgia, serif;
      --font-body: 'Inter', -apple-system, sans-serif;
      --radius: 20px;
      --radius-pill: 9999px;
      --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: var(--font-body);
      background: var(--bg);
      color: var(--text-primary);
      -webkit-font-smoothing: antialiased;
    }

    .card {
      background: var(--surface);
      border-radius: var(--radius);
      padding: 24px;
      box-shadow: var(--shadow);
      transition: transform 0.3s var(--ease-spring), box-shadow 0.3s ease;
    }
    .card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-hover);
    }

    .btn-primary {
      background: var(--accent);
      color: var(--bg);
      padding: 16px 32px;
      border-radius: var(--radius-pill);
      font-family: var(--font-body);
      font-size: 15px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: transform 0.2s var(--ease-spring);
    }
    .btn-primary:active { transform: scale(0.96); }

    .display { font-family: var(--font-display); }
  </style>
</head>
<body>
  <!-- Your app content -->
  <script>lucide.createIcons();</script>
</body>
</html>
Aura Design System — Crafted for premium human experiences.