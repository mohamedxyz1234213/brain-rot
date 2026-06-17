# BrainRot Healer — Design Polish Plan (Agent Brief)

> **You are a senior product designer + React Native engineer.** Your job is to take this
> functionally-complete Expo app and make the UI **super clean, modern, rounded, and
> animated** — with **zero regressions and zero errors**. This is a **design-only pass.**

---

## 0. Hard rules (read first, do not violate)

1. **DESIGN ONLY.** Do **not** change behavior, data flow, store logic, navigation targets,
   prop contracts, or business logic. You may only touch: styling, layout, spacing, color,
   typography, radius, shadow/elevation, and animation. If a visual change *requires* a logic
   change, stop and leave a `// DESIGN-NOTE:` comment instead of changing logic.
2. **No new runtime errors.** After every screen you touch, the app must still compile and run.
   Verify continuously (see §9).
3. **Reuse the design system.** Pull every value from `src/constants/theme.ts`
   (`Colors`, `Typography`, `Spacing`, `Radius`, `Sizing`, `Shadow`, `ANIMATION`).
   **Never hardcode hex, px font sizes, or magic spacing** in screens. If a token is missing,
   add it to `theme.ts` first, then use it.
4. **Stay on the existing stack.** `react-native-reanimated` (already used), `expo-haptics`,
   `react-native-svg`, `expo-linear-gradient` (add via `npx expo install expo-linear-gradient`
   if not present — it is Expo-SDK-managed and safe). **Do not add other animation/UI libs.**
5. **Expo SDK 56 docs are authoritative.** Before using any Expo API, confirm against
   https://docs.expo.dev/versions/v56.0.0/ (per repo `AGENTS.md`).
6. **Accessibility is part of "done".** Preserve every existing `accessibilityRole` /
   `accessibilityLabel`. Maintain min 44px touch targets (`Sizing.touchTarget`). Keep text
   contrast ≥ 4.5:1 against its background.
7. **Don't churn.** No renames, no file moves, no refactors beyond styling. Prefer editing
   `StyleSheet.create` blocks and JSX className/style props over restructuring components.

---

## 1. Design language ("clean, modern, rounded, animated")

The app is a **dark, focus-oriented wellness product**. Target vibe: calm, premium, tactile —
think Linear / Things / Apple Fitness, not neon gamer UI. The existing palette is a muted
slate-teal dark theme; **keep it and refine it**, don't reinvent it.

**Five pillars:**

- **Depth through softness** — surfaces separated by subtle elevation + hairline borders, not
  harsh lines. Soft shadows, never black drop-shadows.
- **Generous rounding** — everything has rounded edges. Cards `Radius.lg`(16)–`Radius.xl`(24),
  pills/chips `Radius.full`, inputs/buttons `Radius.md`(10)–`Radius.lg`. No sharp 0-radius
  rectangles anywhere except full-bleed backgrounds.
- **Confident whitespace** — lean on `Spacing.lg`/`xl`/`2xl`. Let hero numbers breathe.
- **Purposeful motion** — every screen entrance, every state change, and every press is
  animated, but **fast and subtle** (150–500ms). Motion guides attention; it never blocks.
- **One accent, used sparingly** — `PRIMARY`/`PRIMARY_LIGHT` teal is the brand accent. Use
  semantic colors (`SUCCESS`/`WARNING`/`DANGER`) only for status. Avoid rainbow UIs.

---

## 2. Token upgrades (do these FIRST, in `src/constants/theme.ts`)

These are additive — existing tokens stay. This gives every screen richer building blocks.

1. **Add gradient tokens** (consumed by `expo-linear-gradient`):
   ```ts
   export const Gradients = {
     brand: ['#6A9099', '#43686F'] as const,        // PRIMARY_LIGHT -> PRIMARY
     brandDark: ['#43686F', '#2C4A50'] as const,
     surface: ['#1A2332', '#141B27'] as const,       // subtle top-down sheen on cards
     success: ['#2EA043', '#1F7A33'] as const,
     danger:  ['#F85149', '#C23A33'] as const,
     score:   ['#F85149', '#D29922', '#2EA043'] as const, // low->mid->high brain score
   };
   ```
2. **Add a refined shadow tier** (current `Shadow.sm/md/lg` are fine but add a "glow" used for
   hero/active states):
   ```ts
   // append to Shadow
   glow: {
     shadowColor: '#6A9099',
     shadowOffset: { width: 0, height: 0 },
     shadowOpacity: 0.35,
     shadowRadius: 16,
     elevation: 10,
   },
   ```
3. **Add motion presets** to `ANIMATION` so screens share one vocabulary:
   ```ts
   // append to ANIMATION
   entrance: { duration: 450 },        // FadeInDown base
   stagger: 70,                        // ms between list items
   pressScale: 0.96,
   springSoft: { damping: 18, stiffness: 180, mass: 0.6 },
   ```
4. **Add a hairline + letterSpacing helper set:**
   ```ts
   export const Layout = {
     hairline: 1,
     maxContentWidth: 520,   // center content on web/tablets
   };
   export const LetterSpacing = { tight: -0.4, normal: 0, wide: 1.5 };
   ```
   Update `export const theme = {...}` to include `gradients`, `layout`, `letterSpacing`.

> After editing `theme.ts`, run `npx tsc --noEmit` before touching anything else.

---

## 3. Core component refresh (`src/components/ui/`)

Polish the shared primitives once — every screen inherits the improvement. Keep all props and
exports identical.

### `Card.tsx`
- Default to `Radius.xl` (24) for the hero feel; keep `Radius.lg` for dense list cards via a new
  optional `dense?: boolean` prop (default false → xl, true → lg). **Default behavior must look
  the same or better; do not break existing callers.**
- Add a subtle top-down gradient sheen option `glass?: boolean` using `expo-linear-gradient`
  (absolute-filled behind children, `Gradients.surface`). Default off.
- Apply `Shadow.sm` to `surface`, `Shadow.md` to `raised`. Border becomes hairline
  (`Layout.hairline`, `Colors.BORDER`).
- Add an optional press animation: when `onPress` is set, wrap in the same scale-spring used by
  `Button` (`ANIMATION.pressScale` + `springSoft`). Pure visual, no logic change.

### `Button.tsx`
- Already has scale-spring + haptics — keep it. Refinements:
  - Primary variant gets a `Gradients.brand` `LinearGradient` background (rounded to
    `Radius.lg`). Keep the same min height and text styles.
  - Increase corner radius from `Radius.md` → `Radius.lg`.
  - Add `Shadow.sm` to primary/danger; ghost stays flat.
  - Add a disabled state that lowers elevation, not just opacity.

### `CircularProgress.tsx`
- Add a `gradient?: readonly string[]` prop; when provided, render an SVG `<LinearGradient>` def
  and stroke the progress arc with it (use `Gradients.score` on the brain-score ring). Keep the
  existing solid-color path as default.
- Round the stroke caps (`strokeLinecap="round"`) for a softer arc.

### `ProgressBar.tsx`
- Round both track and fill fully (`Radius.full`). Animate width changes with
  `withTiming(..., ANIMATION.timing.normal)` if not already. Optional `gradient` fill prop.

### `SkeletonLoader.tsx`
- Ensure shimmer uses a looping reanimated opacity/translate (0.5→1). Match card radii so
  skeletons are pixel-aligned with the real cards they stand in for.

### `SafeScreen.tsx` / `ScreenHeader`
- `ScreenHeader`: tighten to a consistent grid — back/close row, then large title with
  `LetterSpacing.tight`, then secondary subtitle. Add a `FadeInDown` entrance.
- `SafeScreen`: on web, constrain content to `Layout.maxContentWidth`, centered.

> After component edits: `npx tsc --noEmit`, then smoke-test one screen that uses each.

---

## 4. Navigation chrome (`app/(tabs)/_layout.tsx`)

- Give the tab bar a floating, rounded feel: increase height to ~64, add top hairline only,
  `Colors.SURFACE` with `Shadow.lg` upward. Active tint = `Colors.PRIMARY_LIGHT` (brand), not
  pure white, for a calmer look. Inactive = `Colors.TEXT_SECONDARY`.
- Use the **filled icon when active, outline when inactive** (Ionicons supports `"home"` /
  `"home-outline"`). This is a visual-only change to the `tabBarIcon` render.
- Keep all 5 routes, titles, and order exactly as-is.

---

## 5. Motion system (apply consistently everywhere)

Use Reanimated (already a dependency). One vocabulary across all screens:

| Interaction | Animation |
|---|---|
| Screen mount | Header + first card `FadeInDown.duration(ANIMATION.entrance.duration)` |
| Lists / grids | Stagger children: `FadeInDown.delay(i * ANIMATION.stagger)` (cap delay at ~6 items) |
| Press (cards/buttons/pills) | Scale to `ANIMATION.pressScale` with `springSoft` on pressIn, back to 1 on pressOut |
| Number changes (scores, XP, timers) | Count-up via animated text (interpolate a shared value); never hard-snap big hero numbers |
| Progress (rings/bars) | Animate fill with `withTiming(..., timing.normal/slow)` |
| Success moments (task done, focus complete, prayer logged) | A short pop/confetti-free scale bounce + existing haptic |
| Modals | Slide+fade in; backdrop fades `Colors.OVERLAY` |

**Rules:** keep durations 150–500ms; never animate layout in a way that causes reflow jank;
respect reduced-motion if trivially possible (optional). Don't animate on every store tick —
only on meaningful state transitions.

---

## 6. Screen-by-screen polish

Apply §1–§5 to each. For every screen: (a) consistent screen padding `Spacing.lg`,
(b) entrance animation, (c) rounded cards, (d) empty/loading/error states styled, (e) no
hardcoded values. Below are the screen-specific intents.

### Tabs
- **`index.tsx` (Dashboard)** — the hero. Make the **Brain Score** the centerpiece: use
  `CircularProgress` (or existing `BrainScoreRing` domain component) with `Gradients.score`,
  large count-up number, level label, and `Shadow.glow`. Morning-briefing banner = glass card
  with brand accent left-border. Stat row → rounded pill cards with mini progress. "Eat the
  Frog" card → warning-accent glass card. App-limit pills → rounded, gradient progress.
- **`tasks.tsx`** — clean list rows (rounded cards, generous tap targets, animated checkbox
  fill on complete, swipe-free abandon button). Tab chips fully rounded with animated active
  pill. "Plan Day" modal + schedule blocks: timeline feel, rounded blocks, offline chip styled
  as a subtle warning pill. Keep all handlers untouched.
- **`focus.tsx`** — make the timer screen breathtaking: large gradient `CircularProgress` ring,
  soft glow when running, mode cards as rounded selectable tiles with active border-glow.
  Completion screen: celebratory scale-bounce on the emoji + XP pill.
- **`religion.tsx`** — prayer rows as clean rounded cards with status color dots; dhikr counter
  as a big tactile rounded button with a tap ripple/scale; Quran/fasting cards consistent.
  Respect Arabic typography (`Typography.families.arabicQuran` / `arabicUI`) for Arabic text.
- **`profile.tsx`** — avatar/character hero, level + XP gradient progress, stat grid of rounded
  cards, settings entry rows with chevrons and 44px targets.

### Stack screens (`app/screens/`)
- **`analytics.tsx`** — charts get rounded cards, gradient bars/lines, clear axis labels,
  consistent legend chips. Cost card = danger-tinted glass. Keep the real-data wiring.
- **`subscription.tsx`** — premium paywall: plan cards with selected-state ring/glow, gradient
  CTA button, feature checklist rows. Make it feel worth paying for.
- **`leaderboard.tsx`, `challenges.tsx`, `accountability.tsx`, `wall-of-shame.tsx`,
  `roast-history.tsx`, `app-wrapped.tsx`** — list/grid polish, rounded cards, rank/medal accents,
  consistent headers via `ScreenHeader`, animated list entrance.
- **`settings.tsx`** — grouped sections with section headers, rounded grouped rows, switches
  styled to brand color (`trackColor`/`thumbColor`), chevrons on nav rows. Keep every toggle's
  `onValueChange` and nav target exactly as wired.

### Auth & onboarding (`app/(auth)/`)
- **`welcome.tsx`** — strong first impression: gradient/brand hero, app name, tagline, primary
  CTA (gradient) + secondary ghost. Animated entrance.
- **`sign-in.tsx`, `sign-up.tsx`** — clean rounded inputs (focus ring in brand color),
  generous spacing, primary gradient submit, inline link styling.
- **`quiz.tsx`** — friendly question cards, animated progress between questions, rounded option
  buttons with selected glow.
- **`setup/limits.tsx`, `setup/religion.tsx`, `setup/persona.tsx`** — consistent multi-step feel:
  step indicator, rounded selectable cards, "Skip" as ghost, "Continue" as gradient primary.
  Keep all routing (`router.push/replace`) untouched.

### Modals (`app/(modals)/`)
These are the app's "viral"/emotional moments — they should feel cinematic but on-brand.
- **`roast.tsx`** — typewriter text already exists; wrap in a rounded glass card, persona avatar,
  subtle danger/warning accent. Don't touch the generation logic.
- **`app-blocked.tsx`, `intervention.tsx`, `driving-alert.tsx`** — full-bleed dramatic
  background (dark gradient), centered message, large rounded primary action. High contrast.
- **`brain-scan.tsx`, `life-trailer.tsx`, `villain-arc.tsx`, `ghost.tsx`, `breakup-letter.tsx`,
  `slot-machine.tsx`** — keep their unique concepts; just apply rounded cards, consistent type
  scale, smooth entrance/exit, and brand-consistent accents. `slot-machine.tsx` animation logic
  stays; only restyle the frame/pills.

---

## 7. Typography rules

- Hero numbers: `Typography.sizes['4xl']`, weight `extrabold`, `LetterSpacing.tight`.
- Screen titles: `2xl`/`3xl`, weight `bold`, `LetterSpacing.tight`.
- Section titles: `lg`, weight `semibold`.
- Body: `md`, weight `regular`, `lineHeight.relaxed`.
- Captions/meta: `sm`, `TEXT_SECONDARY`.
- Overlines/tags: `xs`, weight `bold`, `LetterSpacing.wide`, uppercase, brand or muted color.
- Arabic text must use `arabicUI` (Cairo) for UI and `arabicQuran` (Amiri) for Quran verses,
  with looser line height. Confirm the fonts are actually loaded in `app/_layout.tsx`; if not,
  leave a `// DESIGN-NOTE:` rather than wiring font loading (that's borderline functional).

---

## 8. Color & contrast discipline

- Backgrounds: `BACKGROUND` (app), `SURFACE` (cards), `SURFACE_RAISED` (nested/inputs).
- Borders: always hairline `BORDER` / `BORDER_LIGHT`. No thick borders except active-state rings.
- Accent (`PRIMARY`/`PRIMARY_LIGHT`) for interactive + brand only.
- Semantic colors strictly for status (success/warning/danger). The `*_LIGHT` variants
  (already 33-alpha) are your tints for chips/cards.
- Verify text contrast on every new background. `TEXT_SECONDARY` (#8B949E) on `SURFACE` is fine
  for meta but **not** for primary content.

---

## 9. Verification protocol (run continuously — this is how you guarantee "no errors")

After **each** component and **each** screen you edit:

1. `npx tsc --noEmit` → **must be 0 errors.**
2. Visual smoke check of the screen's states: **default, empty, loading, populated, error**
   (where applicable). No clipped text, no overflow, no 0-radius rectangles, no off-grid spacing.
3. Confirm all touch targets ≥ 44px and every interactive element kept its `accessibilityLabel`.

After the **full pass**:

4. `npx expo export --platform web` → **must exit 0 and produce `dist/`.**
5. Run the app (`npx expo start`) and click through: all 5 tabs, the auth flow, the Plan-Day
   modal, a focus session, logging a prayer, and 3–4 of the viral modals. Nothing crashes,
   every transition is smooth, every press has feedback.
6. Diff review: confirm you changed **only** styling/layout/animation — no store, service,
   navigation-target, or prop-contract changes. Grep your own diff for new hardcoded hex
   (`#`) and raw font sizes in screen files — there should be none outside `theme.ts`.

---

## 10. Suggested execution order (minimize risk, maximize compounding wins)

1. `theme.ts` token upgrades (§2) → typecheck.
2. UI primitives (§3): Card, Button, CircularProgress, ProgressBar, SkeletonLoader, SafeScreen.
   → typecheck + smoke test after each.
3. Tab bar chrome (§4).
4. Dashboard (`index.tsx`) — the hero screen; proves the language end-to-end.
5. Remaining tabs: focus, tasks, religion, profile.
6. Stack screens (analytics, subscription, settings first; then the rest).
7. Auth + onboarding.
8. Modals.
9. Full verification protocol (§9.4–9.6).

Work screen-by-screen. **Never leave the tree in a non-compiling state between edits.**
If a change feels like it needs logic, stop and leave a `// DESIGN-NOTE:` instead.

---

### Definition of done
- Every screen feels part of one calm, modern, rounded, animated system.
- `tsc --noEmit` clean; `expo export --platform web` exits 0.
- No behavior changed; no hardcoded design values in screens; accessibility preserved.
- The dashboard, focus timer, and at least one viral modal look genuinely premium.
