# BrainRot Healer — Presentation Builder

---

## Agent Prompt

You are a senior pitch deck designer. Using the full document below as your source material, create a **comprehensive investor-ready presentation** for the BrainRot Healer mobile app.

### Presentation Requirements

**Format:** A pitch deck structured for VCs and angel investors — clear, persuasive, data-backed.

**Structure (create slides for each):**

1. **Title Slide** — App name, tagline, one-liner value prop
2. **The Problem** — Social media addiction crisis (stats: screen time, attention spans, mental health)
3. **The Solution** — BrainRot Healer as the answer (holistic: AI + gamification + spiritual accountability)
4. **How It Works** — Simple 3-step flow (Track → Get Roasted → Recover)
5. **Core Features Overview** — Visual grid of key features
6. **The Brain Score** — Explain the 0-100 score, the formula, the levels (Zombie → Ascended)
7. **AI Roasting System** — The viral hook. 6 personas, real-time data, Claude AI, typewriter UX. Show retention potential.
8. **App Blocking & Screen Time** — Technical moat (native iOS/Android modules). Hard blocks. Unlock mechanics.
9. **Gamification Engine** — XP, levels, streaks, loot boxes, avatar evolution. Dopamine loop for recovery.
10. **Islamic Integration** — Massive TAM differentiator. Prayer times, Quran tracking, prayer hard-block. MENA market wedge.
11. **Social Accountability** — Circles, challenges, leaderboards, Wall of Shame. Network effects.
12. **Viral Features** — Slot Machine, Ghost of Productivity, Life Trailer, Breakup Letter, Intervention Mode. Shareability.
13. **Business Model** — 5 tiers (Free → Lifetime). Region-aware PPP pricing (30+ currencies). RevenueCat IAP.
14. **Tech Stack & Architecture** — Expo/RN + dual backend (MongoDB/Supabase) + Claude AI. Scalable.
15. **Traction / Roadmap** — Current state (v1 complete), next milestones
16. **Team** — Placeholder for team slide
17. **Investment Ask** — What you're raising, what it funds, growth targets

**Style Guidelines:**
- Every claim must cite real code facts from the source document (file paths, data points)
- Include specific numbers: XP values, level thresholds, pricing, market regions, persona count
- Highlight moats: AI integration, native modules, PPP pricing engine, Islamic features
- Use bullet points, not paragraphs
- Add slide notes with citations (e.g., `[src/stores/brainScoreStore.ts]`)

---

---

# BrainRot Healer — Complete Feature Breakdown

> **A cross-platform mobile app (iOS + Android) built with React Native + Expo SDK 56**  
> _Helping people recover from social media addiction through AI-powered interventions, gamification, and spiritual accountability_

---

## Table of Contents

1. [Tech Stack Overview](#1-tech-stack-overview)
2. [Architecture & Project Structure](#2-architecture--project-structure)
3. [Feature Deep-Dives](#3-feature-deep-dives)
   - [Dashboard & Brain Score System](#31-dashboard--brain-score-system)
   - [AI Roasting System](#32-ai-roasting-system)
   - [App Blocking & Screen Time Management](#33-app-blocking--screen-time-management)
   - [Focus Timer Sessions](#34-focus-timer-sessions)
   - [Task Management & AI Day Planning](#35-task-management--ai-day-planning)
   - [Islamic Integration (Prayer, Quran, Dhikr, Fasting)](#36-islamic-integration)
   - [Gamification (XP, Levels, Streaks, Achievements, Loot Boxes, Avatars)](#37-gamification-system)
   - [Accountability Circles, Challenges & Leaderboards](#38-accountability-circles-challenges--leaderboards)
   - [Viral & Emotional Intervention Features](#39-viral--emotional-intervention-features)
   - [Driving Detection & Safety](#310-driving-detection--safety)
   - [Authentication (Email, Google, Apple)](#311-authentication-system)
   - [Subscription Tiers & Region-Aware Pricing](#312-subscription-tiers--region-aware-pricing)
   - [Notifications & Scheduled Roasts](#313-notifications--scheduled-roasts)
   - [Analytics & History](#314-analytics--history)
   - [Multi-Language & RTL Support](#315-multi-language--rtl-support)
   - [Design System](#316-design-system)
   - [Admin Dashboard](#317-admin-dashboard)
   - [Backend Switching (MongoDB vs Supabase)](#318-backend-switching)
4. [Data Flow Diagrams](#4-data-flow-diagrams)
5. [Project File Map](#5-project-file-map)

---

## 1. Tech Stack Overview

### Frontend (Mobile App)

| Technology | Purpose | Implementation |
|---|---|---|
| **React Native 0.81.5** | Cross-platform mobile framework | All UI components and screens |
| **Expo SDK 56** | Managed native APIs and build toolchain | `app.json`, Expo plugins, build pipeline |
| **TypeScript 5.3** | Type-safe development | Full strict mode, path aliases (`@/*`) |
| **Expo Router v3 (file-based)** | Navigation and routing | `app/` directory structure, Stack + Tabs |
| **Zustand 5** | State management | 16 stores, persisted to AsyncStorage |
| **react-native-reanimated 4.1** | 60fps animations | Screen entrances, press feedback, number count-ups |
| **react-native-gesture-handler** | Touch interactions | Swipe, press, pan gestures |
| **i18next / react-i18next** | Internationalization | English + Arabic, RTL support |
| **expo-linear-gradient** | Background gradients | Brand hero panels, glassmorphism cards |
| **react-native-svg** | Custom vector graphics | Progress rings, brain score orb, charts |
| **victory-native** | Charting library | Analytics line/bar charts |
| **Ionicons (@expo/vector-icons)** | Icon system | Tab bar, cards, buttons |
| **adhan** (library) | Islamic prayer time calculation | 5 calculation methods (MWL, ISNA, Egypt, Makkah, Tehran) |

### Backend Infrastructure

| Technology | Purpose | Implementation |
|---|---|---|
| **Node.js + Express** | REST API server | `mongo.service.ts` — full CRUD endpoints |
| **MongoDB Atlas** | Primary database | Mongoose schemas for all domain models |
| **Supabase** | Alternative backend | `supabase.service.ts` — PostgreSQL + RPC + Edge Functions |
| **Anthropic Claude** | AI generation | `claude-sonnet-4-20250514` — roasts, day plans, suggestions, briefings |
| **Clerk** | Authentication | Managed auth sessions, JWT tokens |
| **RevenueCat** | In-app purchases | Subscription management, receipt validation |

### Native Modules

| Platform | Technology | Purpose |
|---|---|---|
| **iOS** | Swift (Screen Time API) | App usage monitoring, hard block enforcement |
| **iOS** | Swift (CoreMotion) | Driving detection via motion sensors |
| **iOS** | Swift (Apple Sign In) | Native OAuth |
| **Android** | Kotlin (UsageStatsManager) | App usage data collection |
| **Android** | Kotlin (AccessibilityService) | App blocking overlay |
| **Android** | Kotlin (ActivityRecognition) | Driving detection |

### DevOps & Tooling

| Tool | Purpose |
|---|---|
| **Jest** | Unit testing |
| **TypeScript (`tsc`)** | Static type checking |
| **ESLint** (implicit via Expo) | Code quality |
| **Git** | Version control |
| **expo-secure-store** | Secure credential storage |

---

## 2. Architecture & Project Structure

```
brain-rot/
├── app/                              # Expo Router file-based routing
│   ├── _layout.tsx                   # Root layout — font loading, scheduling, auth
│   ├── +html.tsx                     # Web-specific HTML shell
│   ├── +not-found.tsx                # 404 screen
│   ├── (auth)/                       # Auth & onboarding stack
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx               # Landing / splash
│   │   ├── sign-in.tsx               # Sign in screen
│   │   ├── sign-up.tsx               # Sign up screen
│   │   ├── quiz.tsx                  # Onboarding quiz
│   │   ├── religion-picker.tsx       # Religion preference
│   │   └── setup/                    # Multi-step onboarding
│   │       ├── limits.tsx            # Screen time limits setup
│   │       ├── religion.tsx          # Prayer/dhikr preferences
│   │       └── persona.tsx           # Roast persona selection
│   ├── (tabs)/                       # Main tab navigation
│   │   ├── _layout.tsx               # Tab bar with FloatingTabBar
│   │   ├── index.tsx                 # Dashboard (home)
│   │   ├── tasks.tsx                 # Task management
│   │   ├── focus.tsx                 # Focus timer sessions
│   │   ├── religion.tsx              # Islamic practices (conditional tab)
│   │   └── profile.tsx              # User profile, settings, stats
│   ├── (modals)/                     # Full-screen modal interventions
│   │   ├── roast.tsx                 # AI roast display with typewriter
│   │   ├── app-blocked.tsx           # App limit hard block
│   │   ├── prayer-block.tsx          # Prayer time enforcement
│   │   ├── driving-alert.tsx         # Driving safety screen
│   │   ├── intervention.tsx          # 5-person intervention simulation
│   │   ├── slot-machine.tsx          # Doom scroll slot machine
│   │   ├── ghost.tsx                 # Ghost of Productivity Past
│   │   ├── life-trailer.tsx          # Cinematic monthly recap
│   │   ├── breakup-letter.tsx        # AI-generated breakup letter
│   │   ├── villain-arc.tsx           # 3-day villain mode
│   │   └── brain-scan.tsx            # Brain scan visualization
│   └── screens/                      # Stack screens (pushed from tabs)
│       ├── _layout.tsx
│       ├── analytics.tsx             # Charts & brain score history
│       ├── subscription.tsx          # Paywall / plan selection
│       ├── settings.tsx              # All settings toggles
│       ├── leaderboard.tsx           # Global leaderboard
│       ├── challenges.tsx            # Community challenges
│       ├── accountability.tsx        # Accountability circles
│       ├── wall-of-shame.tsx         # Wall of Shame
│       ├── roast-history.tsx         # Past roast logs
│       └── app-wrapped.tsx           # Year-in-review style recap
├── src/
│   ├── components/
│   │   ├── ui/                       # Design system primitives
│   │   │   ├── AuroraBackground.tsx   # Animated gradient canvas
│   │   │   ├── Button.tsx            # Primary/secondary/ghost/danger with spring
│   │   │   ├── Card.tsx              # Glassmorphism cards with shadows
│   │   │   ├── CircularProgress.tsx  # SVG ring progress
│   │   │   ├── EmptyState.tsx        # Empty state placeholder
│   │   │   ├── FloatingTabBar.tsx    # Custom tab bar
│   │   │   ├── HeroPanel.tsx         # Dashboard hero section
│   │   │   ├── ProgressBar.tsx       # Animated progress bar
│   │   │   ├── SafeScreen.tsx        # SafeArea + padding wrapper
│   │   │   └── SkeletonLoader.tsx    # Shimmer loading skeleton
│   │   ├── domain/                   # Feature-specific components
│   │   │   ├── AppLimitCard.tsx      # App limit status card
│   │   │   ├── AvatarCharacter.tsx   # Evolving character avatar
│   │   │   ├── BrainScoreOrb.tsx     # 3D-like brain score sphere
│   │   │   ├── BrainScoreRing.tsx    # Circular score display
│   │   │   ├── DhikrCounter.tsx      # Tactile dhikr tap button
│   │   │   ├── FocusTimer.tsx        # Timer with controls
│   │   │   ├── PrayerRow.tsx         # Prayer status row
│   │   │   ├── QuranProgressRing.tsx # Quran reading progress
│   │   │   ├── RoastCard.tsx         # Roast history card
│   │   │   ├── ScoreShowcase.tsx     # Dashboard score hero
│   │   │   ├── SlotMachine.tsx       # Slot machine reels
│   │   │   └── TaskRow.tsx           # Task list row
│   │   ├── auth/AuthScreen.tsx       # Auth screen (shared by sign-in/up)
│   │   └── charts/index.tsx          # Analytics chart components
│   ├── constants/
│   │   └── theme.ts                  # Full design system tokens
│   ├── stores/                       # 16 Zustand stores
│   │   ├── authStore.ts              # Authentication state
│   │   ├── taskStore.ts              # Task CRUD + Eat the Frog
│   │   ├── focusStore.ts             # Focus session management
│   │   ├── screenTimeStore.ts        # Screen time logs & limits
│   │   ├── religionStore.ts          # Prayers, Quran, Dhikr
│   │   ├── roastStore.ts             # Roast history & persona
│   │   ├── gamificationStore.ts      # Achievements, loot boxes, villain arc
│   │   ├── xpStore.ts                # XP, levels, rewards
│   │   ├── streakStore.ts            # Streaks with fire levels
│   │   ├── brainScoreStore.ts        # Brain score calculation
│   │   ├── subscriptionStore.ts       # Subscription tier & features
│   │   ├── settingsStore.ts          # User preferences
│   │   ├── accountabilityStore.ts     # Circles, challenges, leaderboard
│   │   ├── drivingStore.ts           # Driving detection state
│   │   ├── notificationStore.ts       # Notification toggles
│   │   └── adminStore.ts             # Admin panel state
│   ├── services/
│   │   ├── aiService.ts              # Claude API integration
│   │   ├── brainScoreCalculator.ts   # Score math engine
│   │   ├── prayerTimes.ts            # Prayer time calculation
│   │   ├── prayerReminderService.ts  # Notification scheduling
│   │   ├── pricing.ts                # Region-aware pricing engine
│   │   ├── roastNotificationService.ts # Scheduled roast notifications
│   │   ├── auth/oauth.ts            # Google & Apple OAuth
│   │   └── backend/                  # Backend abstraction layer
│   │       ├── interface.ts          # IBackendService interface
│   │       ├── index.ts              # Factory (env-switchable)
│   │       ├── mongo.service.ts      # MongoDB/Express implementation
│   │       └── supabase.service.ts   # Supabase implementation
│   ├── data/                         # Static content
│   │   ├── achievements.ts           # Achievement definitions
│   │   ├── adhkar.ts                 # Morning/evening adhkar
│   │   ├── notificationRoasts.ts     # Push notification roast templates
│   │   ├── roastPersonas.ts          # 6 persona configurations
│   │   └── roastTemplates.ts         # Fallback offline roasts
│   ├── i18n/                         # Internationalization
│   │   ├── index.ts                  # i18next setup
│   │   ├── en.json                   # English translations
│   │   └── ar.json                   # Arabic translations (full RTL)
│   ├── lib/
│   │   └── persistence.ts            # Zustand persist middleware
│   └── native/
│       ├── Motion.ts                 # Native motion bridge
│       └── ScreenTime.ts             # Native screen time bridge
├── assets/
│   ├── fonts/                        # Custom fonts (SpaceMono)
│   └── images/                       # Icons, splash, adaptive
├── admin-dashboard/                  # Separate admin web panel
├── .kilo/                            # Kilo AI agent config
├── app.json                          # Expo configuration
├── tsconfig.json                     # Strict TS config
├── package.json                      # Dependencies & scripts
└── AGENTS.md                         # Agent instructions
```

---

## 3. Feature Deep-Dives

---

### 3.1 Dashboard & Brain Score System

**Files:** `app/(tabs)/index.tsx`, `src/stores/brainScoreStore.ts`, `src/services/brainScoreCalculator.ts`, `src/components/domain/ScoreShowcase.tsx`, `src/components/domain/BrainScoreRing.tsx`, `src/components/domain/BrainScoreOrb.tsx`

**What it does:** The Dashboard is the app's hero screen. It presents a holistic "Brain Score" (0–100) calculated daily from five weighted dimensions. The score determines the user's level name (Zombie → Ascended). The dashboard also shows live stats, AI morning briefing, AI next-task suggestion, Eat the Frog card, app limit pills, XP progress, and an active focus session indicator.

**Brain Score Formula (in `brainScoreStore.ts`):**

```
Brain Score = screenTimeScore × 30% + taskScore × 25% + focusScore × 20% + prayerScore × 15% + sleepScore × 10%
```

Each sub-score uses threshold-based piecewise functions:
- **Screen Time:** Ratio of used/limit. >2x limit = 0, <0.5x = 100
- **Tasks:** Completion rate. >90% = 100, <25% = 0
- **Focus:** Session count & completion. 2+ completed = 100, 0 attempted = 20
- **Prayer:** (Conditional — disabled if religion off) Prayer completion. 5/5 = 100, 0/5 = 0
- **Sleep:** Based on screen-off hour. Before 11pm = 100, 2am+ = 0

**Implementation:**
- `brainScoreStore.ts` uses Zustand with `persist`. `calculateScore()` recomputes in real-time and upserts today's entry into history.
- `syncScores()` fetches remote scores from backend (last 30 days).
- Dashboard `useEffect` recalculates whenever screen time, focus, tasks, or prayers change.
- Pull-to-refresh (via `RefreshControl`) triggers re-calculation.
- The `ScoreShowcase` component displays the score with animated count-up, delta indicator (vs yesterday), and a breakdown bar chart.
- Level names: Zombie (0-20), Waking Up (20-40), Struggling (40-60), Recovering (60-75), Restoring (75-85), Thriving (85-95), Ascended (95-100).

**Tech Details:**
- Score history stored locally (last 30 entries) and synced to backend
- Animated number transitions via Reanimated shared values
- Color-coded gradient on CircularProgress (`Gradients.score`: red → yellow → green)

---

### 3.2 AI Roasting System

**Files:** `app/(modals)/roast.tsx`, `src/services/aiService.ts`, `src/stores/roastStore.ts`, `src/data/roastPersonas.ts`, `src/data/roastTemplates.ts`, `src/components/domain/RoastCard.tsx`

**What it does:** The signature feature. 6 distinct AI personas roast the user with personalized, data-driven insults when they exceed app limits, miss tasks, or request a roast. Roasts are generated by Claude API with real context (screen time, tasks, specific apps).

**6 Personas:**
| ID | Name | Style |
|---|---|---|
| `egyptian_dad` | Egyptian Dad | Guilt-tripping, "I didn't raise you like this" |
| `egyptian_mom` | Egyptian Mom | Passive-aggressive disappointment |
| `future_self` | Future Self | Regret-driven, "I'm writing from a life of..." |
| `drill_sergeant` | Drill Sergeant | Military, loud, aggressive |
| `sigmund_freud` | Sigmund Freud | Psychoanalytic, "what would your mother say" |
| `david_goggins` | David Goggins | Ultra-motivational, "stay hard" |

**How it works:**
1. **Triggers:** App limit exceeded, daily review, task missed, intervention mode, driving + phone
2. **Context gathering:** `generateRoast()` collects real-time data: screen time, tasks done, top wasted app, streaks
3. **API call:** Sends to Claude (`claude-sonnet-4-20250514`) with persona system prompt + structured context
4. **Typewriter display:** `roast.tsx` renders text character-by-character at 30ms intervals
5. **Evidence panel:** Shows screen time, tasks done, brain score, streak alongside the roast
6. **Two response buttons:** "I Deserved This" (dismiss) / "Prove Them Wrong →" (redirects to tasks)
7. **Fallback:** `roastTemplates.ts` provides offline roasts if API is unreachable
8. **History:** All roasts persisted in `roastStore.ts`, viewable in `roast-history.tsx`

**Tech Details:**
- Claude prompt built with `buildRoastPrompt()` — includes full context + persona instructions
- Supports Arabic: Egyptian dialect prompt when `lang === 'ar'`
- API key expected in `EXPO_PUBLIC_ANTHROPIC_API_KEY` (note: readme states production should route through backend proxy)
- Offline mode flag (`isOffline`) distinguishes API vs template roasts

---

### 3.3 App Blocking & Screen Time Management

**Files:** `src/stores/screenTimeStore.ts`, `src/native/ScreenTime.ts`, `app/(modals)/app-blocked.tsx`, `src/components/domain/AppLimitCard.tsx`

**What it does:** Users set daily minute limits per app. When exceeded, a full-screen modal blocks access with multiple unlock options. Native modules (Swift on iOS, Kotlin on Android) enforce hard blocks at the OS level.

**App Limit Model:**
```typescript
interface AppLimit {
  id: string;
  appBundleId: string;
  appName: string;
  dailyLimitMinutes: number;
  isHardBlock: boolean;
  isEnabled: boolean;
}
```

**Block Screen Options (in `app-blocked.tsx`):**
1. **Task Unlock** — Complete an "app unlocker" task for 15 min access
2. **Slot Machine** — Spin for random outcome (unlock, greyscale, Quran, wait, blocked)
3. **Timer Wait** — Wait 10 minutes, then re-spin
4. **Hard Block** — Accept the block, no access until tomorrow
5. **Soft Exit** — "I accept my weakness" (lets them through with —5 XP)

**Real-time Monitoring (in `_layout.tsx`):**
- `checkUsage()` runs every 60 seconds via `setInterval`
- Compares current usage against per-app limits
- If overage found: fires a roast, then navigates to `/(modals)/app-blocked`
- Deduplication via `lastBlockedOverageKey` prevents repeated blocking for same session

**Native Integration:**
- `ScreenTime.ts` exposes native module methods to read usage stats and trigger blocking overlays
- iOS: Screen Time API via Swift
- Android: UsageStatsManager + AccessibilityService via Kotlin

---

### 3.4 Focus Timer Sessions

**Files:** `app/(tabs)/focus.tsx`, `src/stores/focusStore.ts`, `src/components/domain/FocusTimer.tsx`

**What it does:** Four focus modes with timer, pause/resume, distraction logging, and completion tracking.

**Modes & Durations:**
| Mode | Duration | Use Case |
|---|---|---|
| Pomodoro | 25 min | Classic work/break cycle |
| Deep Work | 90 min | Extended focused sessions |
| Flow | 60 min | Balanced deep work |
| Quick Sprint | 15 min | Micro-hustle sessions |

**Implementation Details:**
- `focusStore.ts` manages `activeSession`, `remainingSeconds`, `isActive`
- Timer ticks via `tickTimer()` (called from screen interval)
- `logDistraction()` tracks interruptions per session
- Session data synced to backend via `backendService.createFocusSession()`
- XP rewards: 30 XP for normal sessions, 50 XP for deep work sessions
- Completion triggers streak increment and UI celebration

---

### 3.5 Task Management & AI Day Planning

**Files:** `app/(tabs)/tasks.tsx`, `src/stores/taskStore.ts`, `src/components/domain/TaskRow.tsx`, `src/services/aiService.ts`

**What it does:** Full task management with 4 tabs (Today, Upcoming, Completed, Abandoned), priority levels, "Eat the Frog" mechanic, and AI-powered planning.

**Task Model:**
```typescript
interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'completed' | 'abandoned';
  isEatTheFrog: boolean;
  isAppUnlocker: boolean;
  postponeCount: number;
  estimatedMinutes?: number;
  dueDate?: string;
}
```

**Features:**
- **Eat the Frog:** Task auto-promoted to "frog" after 3 postpones. Completing it rewards 75 XP.
- **AI Day Planner:** `generateDayPlan()` sends pending tasks to Claude, returns a time-blocked schedule. User selects energy level (Morning/Afternoon/Evening).
- **Next Task Suggestion:** `suggestNextTask()` on Dashboard. Claude picks the optimal next task based on priority, estimated time, procrastination count, and time of day.
- **XP Per Priority:** Low=10, Medium=20, High=40, Critical=75
- **App Unlocker Tasks:** Designated tasks that, when completed, unblock restricted apps for 15 minutes.
- **Abandon Penalty:** Abandoning a task costs —20 XP.

---

### 3.6 Islamic Integration

**Files:** `app/(tabs)/religion.tsx`, `src/stores/religionStore.ts`, `src/services/prayerTimes.ts`, `src/services/prayerReminderService.ts`, `app/(modals)/prayer-block.tsx`, `src/components/domain/PrayerRow.tsx`, `src/components/domain/DhikrCounter.tsx`, `src/components/domain/QuranProgressRing.tsx`, `src/data/adhkar.ts`

**What it does:** Comprehensive Islamic practices tracker. The religion tab is conditionally shown (via `religion === 'muslim'` check).

**Sub-features:**

#### Prayer Tracking
- 5 daily prayers: Fajr, Dhuhr, Asr, Maghrib, Isha
- Statuses: `pending | on_time | late | missed`
- 5 calculation methods: MWL, ISNA, Egypt, Makkah, Tehran
- Times are computed with offsets from `BASE_TIMES` + prayer-specific offsets per method
- Available via `adhan` npm library (integrated but computation is custom)

#### Prayer Hard-Block
- `prayerReminderService.ts` schedules 3 push reminders per prayer (at start, +15 min, +30 min)
- Full-screen `prayer-block.tsx` modal activates when a prayer window is closing (within 30 min)
- User must mark prayer as prayed before continuing. Shows countdown timer to window end.
- XP reward: 15 XP per on-time prayer

#### Quran Progress
- Tracks: current Surah, Ayah, Juz, Page
- Daily page goal (default 5), khatm (complete reading) count
- Circular progress ring visualization
- Goal-based khatm targets with tracking

#### Dhikr Counter
- Tactile button with haptic feedback on each tap
- Preset adhkar from `src/data/adhkar.ts` (morning/evening duas)
- Start/increment/complete session flow
- Tracks completed count vs target count

#### Fasting
- Streak type available: `'fasting'` — tracked in `streakStore.ts`

---

### 3.7 Gamification System

**Files:** `src/stores/xpStore.ts`, `src/stores/streakStore.ts`, `src/stores/gamificationStore.ts`, `src/data/achievements.ts`

**What it does:** Multi-layered progression system that rewards positive behaviors and penalizes negative ones.

#### XP & Level System (`xpStore.ts`)
**Levels:**
| Level | Min XP | Title |
|---|---|---|
| 1 | 0 | Zombie |
| 2 | 500 | Waking Up |
| 3 | 1,500 | Struggling |
| 4 | 3,500 | Recovering |
| 5 | 7,000 | Restoring |
| 6 | 13,000 | Thriving |
| 7 | 25,000 | Ascended |

**XP Rewards:**
| Action | XP |
|---|---|
| Complete critical task | +75 |
| Complete high task | +40 |
| Complete focus session (deep work) | +50 |
| Complete normal focus session | +30 |
| Pray on time | +15 |
| Stay under screen time limit | +25 |
| Streak milestone | +100 |
| Eat the Frog | +75 |
| New account | +50 |

**XP Deductions:**
| Action | XP |
|---|---|
| Blocked app attempt | —5 |
| Exceed limit | —30 |
| Abandon task | —20 |

#### Streaks (`streakStore.ts`)
- 6 streak types: `screen_time`, `tasks`, `prayers`, `focus`, `no_social`, `fasting`
- Fire level system: Level 1 (1 day), Level 2 (7 days), Level 3 (30 days)
- Streak shields: Can protect a streak from breaking (max shields vary by tier)
- `useShield()` consumes one shield to prevent streak break

#### Achievements (`gamificationStore.ts`)
- Static list from `achievements.ts`
- Unlocked via `unlockAchievement()`
- Each achievement has: title, description, icon, XP reward
- Persisted: unlocked IDs list

#### Loot Boxes
- 3 rarities: Common, Rare, Legendary
- Contents pool: personae, themes, streak shields, wallpapers, sounds
- `openLootBox()` randomly picks from pool based on box type
- Legendary items: "Prophet Mode (Gentle)" persona, "Golden Hour" theme, "Immortal Shield"

#### Avatar Evolution
- 7 stages (index 0–6) based on brain score thresholds: 0, 20, 35, 50, 65, 80, 95
- `updateAvatarStage(score)` auto-updates as score changes
- Visualized in `AvatarCharacter.tsx` component

---

### 3.8 Accountability Circles, Challenges & Leaderboards

**Files:** `src/stores/accountabilityStore.ts`, `app/screens/accountability.tsx`, `app/screens/challenges.tsx`, `app/screens/leaderboard.tsx`, `app/screens/wall-of-shame.tsx`

**What it does:** Social accountability layer that lets users form groups, compete in challenges, and climb leaderboards.

**Accountability Circles:**
- Create/join/leave circles (max 8 members per circle)
- Each circle has an owner and member list
- Persisted via `accountabilityStore.ts` and synced to backend

**Challenges:**
- Duration-based (days), with difficulty levels: easy/medium/hard
- Joinable, tracks participant count
- Types span screen time reduction, task completion, focus hours

**Leaderboard:**
- Community-wide ranking by: score, streak days, XP, focus hours
- Rank number displayed per entry
- `setLeaderboard()` updates from remote data

**Wall of Shame:**
- Displays "worst" performers (inverted leaderboard)
- Designed as a humorous motivator
- Rendered in `wall-of-shame.tsx`

---

### 3.9 Viral & Emotional Intervention Features

**Files:** All files under `app/(modals)/`

These are designed for shareability and emotional impact — the app's "viral hooks."

#### Slot Machine (`slot-machine.tsx`)
- 3-reel slot machine visual with Ionicons
- Random outcomes on spin (2s animation):
  - 8%: Unlock (15 min access)
  - 40%: Blocked (+10 min to tomorrow's limit)
  - 20%: Greyscale (unlocked but in greyscale at 0.75x speed)
  - 12%: Quran (read 5 min first)
  - 20%: Wait (10 min cooldown)

#### Ghost of Productivity Past (`ghost.tsx`)
- Side-by-side comparison: "You" vs "Ghost You"
- 7 categories: Screen Time, Tasks, Focus, Prayer, Sleep, Brain Score
- Shows what could have been if the user followed through
- "Challenge Accepted" CTA button

#### Life Trailer (`life-trailer.tsx`)
- Monthly recap rendered as a movie trailer script
- Typewriter animation shows stats: unlocks, tasks, prayers, brain score changes
- "Share Trailer" button (social sharing)
- Tagline: "BRAINROT — بنعالجك"

#### Breakup Letter (`breakup-letter.tsx`)
- AI-generated letter from the user's "abandoned goal"
- Typewriter animation, nostalgic/guilt-tripping tone
- Two actions: "Win It Back" (3 micro-tasks to restart) or "Let It Go"

#### Intervention Mode (`intervention.tsx`)
- 5 consecutive speakers: Dr. Amina (Psychologist), Coach Hassan, Ustadh Khalid, Future You (Age 45), Mama
- Each delivers a short message tailored to their role
- Final choice: "Emergency Detox Mode" (24hr hard block) or "I'll do better"

#### Villain Arc (`villain-arc.tsx`)
- 3-day "villain mode" — worst score sits at #1 on leaderboard (ironic)
- Menacing avatar, respectful roasts only
- Auto-ends after 3 days with: "Villain arc over. Time to be the main character."
- Tracked in `gamificationStore.ts`

#### Brain Scan (`brain-scan.tsx`)
- Visualization of brain activity/health
- Weekly/modal presentation

#### Driving Alert (`driving-alert.tsx`)
- Full-screen: "YOU ARE DRIVING"
- Blocks phone use, auto-dismisses 60s after driving stops
- Emergency Call button

---

### 3.10 Driving Detection & Safety

**Files:** `src/stores/drivingStore.ts`, `src/native/Motion.ts`, `app/(modals)/driving-alert.tsx`

**What it does:** Uses native motion sensors (CoreMotion on iOS, ActivityRecognition on Android) to detect when the user is driving. Triggers a full-screen blocking modal.

**Implementation:**
- `drivingStore.ts` manages session state: `isDriving`, `drivingStartedAt`, `phonePickedWhileDriving`, `drivingSessions[]`
- `Motion.ts` bridges to native accelerometer/gyroscope APIs
- When driving detected: `setDriving(true)` → navigation to `driving-alert.tsx`
- `phonePickedWhileDriving` tracked for accountability
- Sessions logged with start/end times and phone attempt count
- Toggle in settings: `drivingDetectionEnabled`

---

### 3.11 Authentication System

**Files:** `src/stores/authStore.ts`, `src/components/auth/AuthScreen.tsx`, `src/services/auth/oauth.ts`, `app/(auth)/`

**What it does:** Three authentication methods with OAuth flows. Session persisted via Zustand + SecureStore.

**Methods:**
1. **Email/Password:** Local account creation, validation (8 char min, email format)
2. **Google OAuth:** `expo-auth-session` + `expo-web-browser` redirect flow. Platform-specific client IDs (iOS, Android, Web).
3. **Apple Sign In:** `expo-apple-authentication` native module. Requests full name + email scopes.

**Auth Flow:**
1. User lands on `welcome.tsx` (if not authenticated)
2. Routes: Welcome → Sign In / Sign Up → Religion Picker → Setup (limits/religion/persona) → Dashboard
3. `authStore.ts` persists `user` and `isAuthenticated` via Zustand persist middleware
4. Root layout guards navigation: `if (!isAuthenticated) return <Redirect href="/(auth)/welcome" />`
5. `syncCurrentUser()` fetches latest user data from backend
6. Admins detected via `user.role === 'admin'` or matching `EXPO_PUBLIC_ADMIN_EMAIL`

**Guided Auth Screen (`AuthScreen.tsx`):**
- Animated hero card with rotating guidance tips (3 steps)
- Pulse animation on background orb
- Password strength indicator (character type + length)
- Glassmorphism UI cards

---

### 3.12 Subscription Tiers & Region-Aware Pricing

**Files:** `src/stores/subscriptionStore.ts`, `src/services/pricing.ts`, `app/screens/subscription.tsx`

**What it does:** 5-tier subscription model with region-specific pricing that auto-detects the user's country via locale, timezone, or currency fallback, then applies PPP (Purchasing Power Parity) multipliers.

**Tiers:**
| Tier | Price (USD) | Key Features |
|---|---|---|
| Free | $0 | Screen time view, 3 tasks/day, 1 roast/day |
| Healed | $4.99/mo | Full blocking, unlimited tasks, AI planner, all personas |
| Ascended | $9.99/mo | Everything + AI coach, Life Trailer, App Wrapped, streak shields |
| Family | $14.99/mo | 5 accounts, parent dashboard, child mode |
| Lifetime | $79.99 | Everything forever |

**Feature Access Check:**
```typescript
checkFeatureAccess('ai_coach') // returns true only for Ascended+, Healed+, etc.
```

**Region-Aware Pricing Engine (`pricing.ts`):**
- **Detection chain:** User override → Locale region code → Timezone → Currency code → Default (USD)
- **Timezone-to-region mapping:** 90+ timezone entries (e.g., `Africa/Cairo` → `EG`)
- **30+ currencies** with proper formatting (symbol, decimals, charm rounding)
- **PPP multipliers:** US=1.0, Egypt=0.35, India=0.35, Nigeria=0.3, etc.
- **Charm rounding:** Each currency gets appropriate endings (.99 for USD, .00 for JPY)

---

### 3.13 Notifications & Scheduled Roasts

**Files:** `src/services/roastNotificationService.ts`, `src/services/prayerReminderService.ts`, `src/data/notificationRoasts.ts`, `src/stores/notificationStore.ts`

**What it does:** Two notification pipelines — roast/motivation notifications throughout the day, and prayer reminders with escalation.

**Roast Notifications (`roastNotificationService.ts`):**
- Schedules 6-8 roasts per day during waking hours (9:00–21:00)
- Randomly picks from localized roast bank (`notificationRoasts.ts`)
- Tokens filled: `{name}`, `{minutes}`, `{app}`, `{tasks}`
- Content differs per tone (gentle, brutal, motivational)
- Android channel: "Roasts & Motivation" with vibration pattern
- `fireRoastNow()` for immediate triggers
- `fireUsageRoast()` for real-time overage alerts
- Deduplication: `lastUsageRoastKey` prevents repeated identical roasts

**Prayer Reminders (`prayerReminderService.ts`):**
- 3 reminders per prayer: at start, +15 min, +30 min
- Cancels reminders for already-marked prayers
- `refreshAfterPrayerLogged()` rebuilds schedule when a prayer is logged
- `evaluatePrayerBlock()` determines if hard-block should activate

**Notification Toggles (`notificationStore.ts`):**
- 9 toggles: Master, Morning Briefing, Task Reminder, Midday Check-in, Screen Time Warning, Daily Roast, Sleep Reminder, Prayer Times, Driving Alert

---

### 3.14 Analytics & History

**Files:** `app/screens/analytics.tsx`, `app/screens/roast-history.tsx`, `app/screens/app-wrapped.tsx`, `src/components/charts/index.tsx`

**Analytics Screen:**
- Victory Native charts for brain score history (line chart)
- Screen time breakdown (bar chart)
- Prayer completion over time
- Focus session history
- Cost card: "Time is money" — calculates value of wasted time based on hourly rate

**Roast History:**
- Chronological log of all generated roasts
- Each card shows: persona, trigger, text, offline status, timestamp
- `RoastCard.tsx` component for consistent rendering

**App Wrapped:**
- Year-in-review style recap (similar to Spotify Wrapped)
- Total stats: screen time saved, tasks completed, prayers prayed, streak highlights, brain score journey

---

### 3.15 Multi-Language & RTL Support

**Files:** `src/i18n/en.json`, `src/i18n/ar.json`, `src/i18n/index.ts`

**What it does:** Full bilingual support (English + Arabic) with right-to-left layout.

**Implementation:**
- `i18next` + `react-i18next` for translation management
- Language switching via `useSettingsStore.setLanguage()`
- Arabic translation file (`ar.json`) contains complete Egyptian Arabic localization
- RTL support throughout: `writingDirection: 'rtl'`, `textAlign: 'right'`, `flexDirection: 'row-reverse'`
- Arabic specific typography families: `arabicUI` (Cairo) and `arabicQuran` (Amiri)
- AI prompts switch to Arabic/Egyptian dialect when language is Arabic
- Date formatting uses `ar-EG` locale for Arabic dates

---

### 3.16 Design System

**File:** `src/constants/theme.ts`

**What it does:** A complete design token system — "AURA" — that defines every visual property used in the app.

**Tokens:**

| Category | Key Values |
|---|---|
| **Colors** | BACKGROUND (#F2E6DA cream), SURFACE (white), PRIMARY (teal #4b686e), DANGER (#B85C5C), SUCCESS (#5A8F7B), WARNING (#C2914E) |
| **Typography** | 4 families (Playfair Display, Space Grotesk, Inter, Space Mono), 10 sizes (xs→4xl), 4 weights, 4 line heights |
| **Spacing** | xs(4) → 4xl(64), screenTop(60) |
| **Radius** | sm(6) → full(9999), xl(24) as hero default |
| **Gradients** | brand, brandDark, surface, success, danger, score (3-color), canvas, hero, glow |
| **Glass** | fill, fillStrong, border variants for glassmorphism |
| **Shadow** | sm, md, lg, glow — all using warm brown (#3C2814) shadow color |
| **Animation** | spring, timing, entrances (450ms), stagger (70ms), pressScale (0.96) |
| **Layout** | hairline(1), maxContentWidth(520), tabBarClearance(84) |
| **LetterSpacing** | tight(-0.4), normal(0), wide(1.5) |

**Component Library (`src/components/ui/`):**
- `Button.tsx`: 4 variants (primary/secondary/ghost/danger), spring scale press animation, haptic feedback, gradient support
- `Card.tsx`: Glassmorphism with optional gradient sheen, press animation, dense variant
- `CircularProgress.tsx`: SVG ring with gradient stroke option, rounded caps
- `ProgressBar.tsx`: Full radius, animated width transitions, gradient fill
- `FloatingTabBar.tsx`: Custom tab bar with rounded floating design
- `AuroraBackground.tsx`: Animated canvas gradient with drifting blurred orbs
- `SafeScreen.tsx`: SafeArea wrapper with web max-width constraint
- `SkeletonLoader.tsx`: Shimmer loading placeholder

---

### 3.17 Admin Dashboard

**Files:** `src/stores/adminStore.ts`, `admin-dashboard/` (separate web app), backend `AdminOverview` endpoint

**What it does:** Administrative interface for monitoring app-wide metrics.

**Metrics tracked:**
- Total users, active subscriptions, free users
- Total screen time minutes across all users
- Blocked attempts count
- Average brain score
- Focus minutes logged
- Traffic metrics per app (name, minutes, overage, blocks)

**Admin Detection:**
- `authStore.isAdmin()` checks: `user.role === 'admin'` || `user.email === EXPO_PUBLIC_ADMIN_EMAIL`

---

### 3.18 Backend Switching

**Files:** `src/services/backend/index.ts`, `interface.ts`, `mongo.service.ts`, `supabase.service.ts`

**What it does:** A clean abstraction layer that lets the app switch between MongoDB/Express and Supabase by changing one environment variable.

**Interface (`IBackendService`):**
Defines 30+ methods across all domains: User, Task, ScreenTime, AppLimit, FocusSession, RoastLog, Prayer, Quran, Streak, BrainScore, Accountability, Subscription, Notifications, Admin.

**MongoDB Implementation (`mongo.service.ts`):**
- REST calls to `EXPO_PUBLIC_MONGO_API_URL` (default: `localhost:3001/api`)
- Bearer token auth via `setAuthToken()`
- Standard REST CRUD patterns

**Supabase Implementation (`supabase.service.ts`):**
- Direct PostgreSQL REST API calls to `EXPO_PUBLIC_SUPABASE_URL`
- Row-Level Security (RLS) via auth tokens
- snake_case conversion helper (`toSnakeCase()`)
- RPC functions for complex operations (join_circle, leave_circle)
- Edge Function for brain score calculation

**Switching:**
```bash
EXPO_PUBLIC_BACKEND=mongo    # MongoDB/Express
EXPO_PUBLIC_BACKEND=supabase  # Supabase
```

---

## 4. Data Flow Diagrams

### 4.1 Brain Score Calculation Flow

```
User Activity Events
    ├── ScreenTimeStore.totalMinutesToday changes
    ├── TaskStore.tasks status changes
    ├── FocusStore.totalFocusMinutesToday changes
    └── ReligionStore.prayerLogs changes
                    │
                    ▼
    Dashboard useEffect (line 129-146)
                    │
                    ▼
    brainScoreStore.calculateScore({
        screenTime, tasks, focus, prayers, sleep
    })
                    │
                    ▼
    Weighted Formula (Screen 30%, Tasks 25%,
    Focus 20%, Prayer 15%, Sleep 10%)
                    │
                    ▼
    BrainScore: 0-100
    ├── Upsert today's entry in scores[]
    ├── Update currentScore + breakdown
    └── Sync to backend via syncScores()
```

### 4.2 App Block → Roast Flow

```
60-second interval (_layout.tsx line 131-197)
    │
    ▼
screenTimeStore.getOverageApps()
    │
    ├── No overage → exit
    └── Overage found →
            │
            ▼
    fireUsageRoast() → immediate push notification
            │
            ▼
    generateRoast(persona, 'app_limit', context)
    ├── Claude API call
    ├── Store in roastStore
    │
    ▼
    router.push('/(modals)/app-blocked')
    ├── Display roast text
    ├── Show 4 unlock options
    └── User chooses path
```

### 4.3 Prayer Block Flow

```
30-second interval (_layout.tsx line 102-115)
    │
    ▼
evaluatePrayerBlock(times, logs, 30)
    │
    ├── All prayed → exit
    └── Window closing (≤30 min) →
            │
            ▼
    router.push('/(modals)/prayer-block')
    ├── Show prayer name + countdown
    ├── User marks prayed
    ├── XP +15, streak++
    ├── Cancel remaining reminders
    └── router.back()
```

### 4.4 Notification Scheduling Flow

```
On mount + language change:
    │
    ├── scheduleDailyRoasts()
    │   ├── Pick 6-8 hours from ROAST_HOURS[9..21]
    │   ├── Randomly select from roast bank
    │   ├── Fill tokens {name}, {minutes}, {app}, {tasks}
    │   └── Schedule via expo-notifications
    │
    └── schedulePrayerReminders()
        ├── For each of 5 prayers:
        │   ├── Skip if already logged today
        │   ├── Schedule at start, +15 min, +30 min
        │   └── Cancel prior batch first
        └── Re-run on prayer log change
```

---

## 5. Project File Map

```
app/
├── _layout.tsx              Root layout (fonts, scheduling, auth guard)
├── +html.tsx                Web HTML shell
├── +not-found.tsx           404 page
├── (auth)/
│   ├── _layout.tsx          Auth stack layout
│   ├── welcome.tsx          Welcome/landing
│   ├── sign-in.tsx          Sign in wrapper
│   ├── sign-up.tsx          Sign up wrapper
│   ├── quiz.tsx             Onboarding questionnaire
│   ├── religion-picker.tsx  Religion preference
│   └── setup/
│       ├── limits.tsx       Screen time limit setup
│       ├── religion.tsx     Islamic setup
│       └── persona.tsx      Roast persona selection
├── (tabs)/
│   ├── _layout.tsx          Tab navigation (FloatingTabBar)
│   ├── index.tsx            Dashboard (brain score, briefings, stats)
│   ├── tasks.tsx            Task management + AI planner
│   ├── focus.tsx            Focus timer sessions
│   ├── religion.tsx         Islamic practices (conditional tab)
│   └── profile.tsx          User profile + settings
├── (modals)/
│   ├── roast.tsx            AI roast typewriter display
│   ├── app-blocked.tsx      App limit enforcement
│   ├── prayer-block.tsx     Prayer time enforcement
│   ├── driving-alert.tsx    Driving safety alert
│   ├── intervention.tsx     5-person intervention script
│   ├── slot-machine.tsx     Doom scroll slot machine
│   ├── ghost.tsx            Ghost of Productivity Past
│   ├── life-trailer.tsx     Monthly recap trailer
│   ├── breakup-letter.tsx   Goal abandonment letter
│   ├── villain-arc.tsx      3-day villain mode
│   └── brain-scan.tsx       Brain visualization
└── screens/
    ├── _layout.tsx          Stack screens layout
    ├── analytics.tsx        Charts & history
    ├── subscription.tsx     Paywall & plans
    ├── settings.tsx         Full settings
    ├── leaderboard.tsx      Global rankings
    ├── challenges.tsx       Community challenges
    ├── accountability.tsx   Accountability circles
    ├── wall-of-shame.tsx    Inverse leaderboard
    ├── roast-history.tsx    Past roasts log
    └── app-wrapped.tsx      Year-in-review

src/
├── components/
│   ├── ui/
│   │   ├── AuroraBackground.tsx   Animated gradient canvas
│   │   ├── Button.tsx            4-variant button with spring
│   │   ├── Card.tsx              Glassmorphism card
│   │   ├── CircularProgress.tsx  SVG progress ring
│   │   ├── EmptyState.tsx        Empty placeholder
│   │   ├── FloatingTabBar.tsx    Custom tab bar
│   │   ├── HeroPanel.tsx         Dashboard hero
│   │   ├── ProgressBar.tsx       Animated bar
│   │   ├── SafeScreen.tsx        Safe area wrapper
│   │   └── SkeletonLoader.tsx    Shimmer loading
│   ├── domain/
│   │   ├── AppLimitCard.tsx      Limit status card
│   │   ├── AvatarCharacter.tsx   Evolving avatar
│   │   ├── BrainScoreOrb.tsx     Score sphere
│   │   ├── BrainScoreRing.tsx    Score ring
│   │   ├── DhikrCounter.tsx      Dhikr tap counter
│   │   ├── FocusTimer.tsx        Timer display
│   │   ├── PrayerRow.tsx         Prayer status
│   │   ├── QuranProgressRing.tsx Quran progress
│   │   ├── RoastCard.tsx         Roast history
│   │   ├── ScoreShowcase.tsx     Dashboard score hero
│   │   ├── SlotMachine.tsx       Slot reels
│   │   └── TaskRow.tsx           Task entry
│   ├── auth/AuthScreen.tsx       Auth UI (shared)
│   └── charts/index.tsx          Chart components
├── constants/theme.ts            Design system tokens
├── stores/                       Zustand store (16 files)
├── services/
│   ├── aiService.ts              Claude API integration
│   ├── brainScoreCalculator.ts   Score calculation engine
│   ├── prayerTimes.ts            Islamic prayer times
│   ├── prayerReminderService.ts  Prayer notification scheduling
│   ├── pricing.ts                Region-aware pricing engine
│   ├── roastNotificationService.ts Roast notifications
│   ├── auth/oauth.ts             OAuth flows
│   └── backend/                  Backend abstraction (3 files)
├── data/                         Static content (5 files)
├── i18n/                         Translations (3 files)
├── lib/persistence.ts            Zustand persist middleware
└── native/                       Native module bridges (2 files)
```

---

> **Generated for presentation purposes** — BrainRot Healer v1.0.0  
> _A product that turns phone addiction recovery into a game, a therapy session, and a spiritual practice — all in one app._
