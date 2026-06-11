# 🧠 BrainRot Healer

A cross-platform mobile app (iOS + Android) built with **React Native + Expo** that helps people recover from social media addiction.

## Features

- **App Blocking** — Screen Time API (iOS) + UsageStats/Accessibility (Android)
- **AI Roasting** — 6 personas that roast you when you fail (powered by Claude)
- **Focus Sessions** — Pomodoro, Deep Work, Flow, Quick Sprint modes
- **Brain Score** — Daily 0-100 score calculated from screen time, tasks, focus, prayers, sleep
- **Islamic Integration** — Prayer times, Quran progress, Dhikr counter, Fasting tracker
- **Gamification** — XP, levels, streaks, achievements, loot boxes, avatar evolution
- **Accountability** — Circles, challenges, leaderboards, Wall of Shame
- **Viral Features** — Slot machine, Intervention Mode, Ghost of Productivity, Life Trailer
- **Driving Detection** — Auto-blocks phone when driving detected

## Tech Stack

- **Frontend:** React Native + Expo SDK 56, TypeScript, Expo Router v3
- **State:** Zustand
- **Backend A:** Node.js + Express + MongoDB Atlas
- **Backend B:** Supabase (switchable via `EXPO_PUBLIC_BACKEND` env var)
- **AI:** Anthropic Claude claude-sonnet-4-20250514
- **Auth:** Clerk
- **Payments:** RevenueCat
- **Native iOS:** Swift (Screen Time API, CoreMotion)
- **Native Android:** Kotlin (UsageStats, AccessibilityService)

## Getting Started

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env

# Start Expo dev server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Project Structure

```
app/                  # Expo Router screens
  (auth)/            # Welcome, sign-in, sign-up
  (tabs)/            # Dashboard, tasks, focus, religion, profile
  (modals)/          # Roast, app-blocked, driving-alert, slot-machine, intervention

src/
  components/ui/     # Design system components
  components/domain/ # Feature-specific components
  constants/         # Theme tokens
  data/              # Static data (roasts, achievements, adhkar)
  i18n/              # Translations (English + Arabic)
  native/            # Native module bridges
  services/backend/  # Backend abstraction (Mongo + Supabase)
  stores/            # Zustand state stores
```

## Backend Switching

Change one environment variable to switch backends:

```bash
# Use MongoDB/Express backend
EXPO_PUBLIC_BACKEND=mongo

# Use Supabase backend
EXPO_PUBLIC_BACKEND=supabase
```

## Design System

- Dark-first theme (background: `#0D1117`)
- Primary teal: `#43686F`
- Full Arabic RTL support
- Haptic feedback on all interactions
- 60fps animations via Reanimated

## Subscription Tiers

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | Screen time view, 3 tasks/day, 1 roast/day |
| Healed | $4.99/mo | Full blocking, AI planner, all personas |
| Ascended | $9.99/mo | AI coach, Life Trailer, premium features |
| Family | $14.99/mo | 5 accounts, parent dashboard |
| Lifetime | $79.99 | Everything forever |

## License

Private — All rights reserved.
