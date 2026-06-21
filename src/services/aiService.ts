/**
 * AI Service - Claude API integration for roast generation and AI features
 */

import { roastPersonas } from '../data/roastPersonas';
import { roastTemplates } from '../data/roastTemplates';

interface RoastContext {
  userName: string;
  screenTimeToday: number;
  screenTimeLimit: number;
  tasksCompleted: number;
  tasksTotal: number;
  topWastedApp: string;
  topWastedMinutes: number;
  blockedAttempts: number;
  streakDays: number;
}

interface RoastResult {
  text: string;
  persona: string;
  isOffline: boolean;
}

// NOTE: EXPO_PUBLIC_* env vars are bundled into the client JS. Shipping a real
// Anthropic key here would expose it to anyone who downloads the app. In
// production, route requests through a backend proxy that holds the secret.
// This file falls back to deterministic offline content when no key is set.
const API_URL = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY
  ? 'https://api.anthropic.com/v1/messages'
  : null;

// Cap the number of tasks and characters we ever send to the model. Keeps the
// prompt cheap and prevents accidental prompt-injection scale.
const MAX_TASKS_IN_PROMPT = 25;
const MAX_TITLE_CHARS = 120;

function trimTaskList<T extends { title: string }>(tasks: T[]): T[] {
  return tasks.slice(0, MAX_TASKS_IN_PROMPT).map((t) => ({
    ...t,
    title: typeof t.title === 'string' ? t.title.slice(0, MAX_TITLE_CHARS) : '',
  }));
}

/**
 * Generate a roast using Claude API, with offline fallback
 */
export async function generateRoast(
  personaId: string,
  trigger: string,
  context: RoastContext
): Promise<RoastResult> {
  const persona = roastPersonas.find((p) => p.id === personaId) || roastPersonas[0];

  // Try API first
  if (API_URL && process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 200,
          system: persona.systemPrompt,
          messages: [
            {
              role: 'user',
              content: buildRoastPrompt(trigger, context),
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.content?.[0]?.text || '';
        if (text) {
          return { text, persona: persona.name, isOffline: false };
        }
      }
    } catch (error) {
      console.warn('AI roast generation failed, using offline template:', error);
    }
  }

  // Offline fallback - use bundled templates
  return {
    text: getOfflineRoast(personaId, trigger, context),
    persona: persona.name,
    isOffline: true,
  };
}

function buildRoastPrompt(trigger: string, context: RoastContext): string {
  return `Generate a roast for ${context.userName}. 
Trigger: ${trigger}
Context:
- Screen time today: ${context.screenTimeToday} minutes (limit: ${context.screenTimeLimit} min)
- Tasks: ${context.tasksCompleted}/${context.tasksTotal} completed
- Top wasted app: ${context.topWastedApp} (${context.topWastedMinutes} min)
- Blocked app attempts today: ${context.blockedAttempts}
- Current streak: ${context.streakDays} days

Be creative, specific, and brutal. Reference the actual data. Keep it under 2 sentences.`;
}

function getOfflineRoast(personaId: string, trigger: string, context: RoastContext): string {
  // Get templates for the persona or use a random persona's templates
  const personaTemplates = roastTemplates[personaId] || 
    roastTemplates[Object.keys(roastTemplates)[Math.floor(Math.random() * Object.keys(roastTemplates).length)]];
  
  const template = personaTemplates[Math.floor(Math.random() * personaTemplates.length)];

  // Substitute variables
  return template
    .replace(/{name}/g, context.userName)
    .replace(/{app}/g, context.topWastedApp)
    .replace(/{count}/g, String(context.blockedAttempts))
    .replace(/{minutes}/g, String(context.topWastedMinutes))
    .replace(/{dollars}/g, String(Math.round(context.topWastedMinutes * 0.5)));
}

/**
 * Generate AI Day Plan
 */
export interface DayPlanBlock {
  time: string;
  task: string;
  duration: number;
}

export async function generateDayPlan(
  tasks: { title: string; priority: string; estimatedMinutes: number }[],
  preferences: { energyLevel: 'morning' | 'afternoon' | 'evening'; workHours: number }
): Promise<{ schedule: DayPlanBlock[]; isOffline: boolean }> {
  if (!API_URL || !process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY) {
    return { schedule: buildOfflineSchedule(tasks, preferences), isOffline: true };
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `Create a time-blocked daily schedule for these tasks. 
Tasks: ${JSON.stringify(trimTaskList(tasks))}
Preferences: Peak energy = ${preferences.energyLevel}, Work hours = ${preferences.workHours}

Return ONLY a JSON array like: [{"time": "09:00", "task": "Task name", "duration": 30}]
Put high priority/hardest tasks during peak energy. Include breaks.`,
          },
        ],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const text = data.content?.[0]?.text || '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return { schedule: JSON.parse(jsonMatch[0]) as DayPlanBlock[], isOffline: false };
      }
    }
  } catch (error) {
    console.warn('AI day plan generation failed, using offline planner:', error);
  }

  return { schedule: buildOfflineSchedule(tasks, preferences), isOffline: true };
}

const PRIORITY_RANK: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

function buildOfflineSchedule(
  tasks: { title: string; priority: string; estimatedMinutes: number }[],
  preferences: { energyLevel: 'morning' | 'afternoon' | 'evening'; workHours: number }
): DayPlanBlock[] {
  if (tasks.length === 0) return [];

  // Highest-priority work goes into the peak-energy window first.
  const ordered = [...tasks].sort(
    (a, b) => (PRIORITY_RANK[a.priority] ?? 2) - (PRIORITY_RANK[b.priority] ?? 2)
  );

  const startHour = preferences.energyLevel === 'morning' ? 8 : preferences.energyLevel === 'afternoon' ? 12 : 17;
  let cursor = startHour * 60; // minutes since midnight
  const fmt = (mins: number) => {
    const h = Math.floor((mins % (24 * 60)) / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const schedule: DayPlanBlock[] = [];
  ordered.forEach((t, i) => {
    const duration = t.estimatedMinutes && t.estimatedMinutes > 0 ? t.estimatedMinutes : 30;
    schedule.push({ time: fmt(cursor), task: t.title, duration });
    cursor += duration;
    // Short break after each block except the last.
    if (i < ordered.length - 1) {
      schedule.push({ time: fmt(cursor), task: 'Break', duration: 10 });
      cursor += 10;
    }
  });
  return schedule;
}

/**
 * Suggest the single next task to focus on right now, based on priority,
 * estimated time, and the current time of day. Returns null if no tasks.
 */
export interface NextTaskSuggestion {
  taskId: string;
  title: string;
  reason: string;
  estimatedMinutes: number;
  priority: string;
  isOffline: boolean;
}

export async function suggestNextTask(
  tasks: { id: string; title: string; priority: string; estimatedMinutes?: number; isEatTheFrog?: boolean; postponeCount?: number }[],
  context: { currentHour: number; energyLevel?: 'morning' | 'afternoon' | 'evening'; lang?: 'en' | 'ar' }
): Promise<NextTaskSuggestion | null> {
  if (!tasks.length) return null;

  // Always have a deterministic fallback pick (in case API fails)
  const ranked = [...tasks].sort((a, b) => {
    if (a.isEatTheFrog && !b.isEatTheFrog) return -1;
    if (!a.isEatTheFrog && b.isEatTheFrog) return 1;
    const p = (PRIORITY_RANK[a.priority] ?? 2) - (PRIORITY_RANK[b.priority] ?? 2);
    if (p !== 0) return p;
    return (b.postponeCount ?? 0) - (a.postponeCount ?? 0);
  });
  const pick = ranked[0];
  const offlineReason = context.lang === 'ar'
    ? pick.isEatTheFrog
      ? 'هذه المهمة هي الضفدع — ابدأ بها قبل ما تتمد.'
      : pick.priority === 'critical' || pick.priority === 'high'
        ? 'أولوية عالية. خلصها قبل ما تتراكم عليك حاجات تانية.'
        : 'مهمة سريعة دلوقتي تكسبك زخم لباقي اليوم.'
    : pick.isEatTheFrog
      ? "This is your Eat-the-Frog task — knock it out before anything else."
      : pick.priority === 'critical' || pick.priority === 'high'
        ? 'Highest leverage in your list right now. Tackle it while energy is fresh.'
        : 'A short win to build momentum into the rest of the day.';

  const fallback: NextTaskSuggestion = {
    taskId: pick.id,
    title: pick.title,
    reason: offlineReason,
    estimatedMinutes: pick.estimatedMinutes ?? 30,
    priority: pick.priority,
    isOffline: true,
  };

  if (!API_URL || !process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY) return fallback;

  try {
    const langInstr = context.lang === 'ar'
      ? 'Respond in Arabic (Egyptian dialect, motivating, 1 sentence).'
      : 'Respond in English, 1 motivating sentence.';
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 220,
        messages: [
          {
            role: 'user',
            content: `You are a focused productivity coach. Given the pending tasks and current hour, pick the ONE task to do next and explain why in one sentence. ${langInstr}

Current hour (0-23): ${context.currentHour}
Pending tasks: ${JSON.stringify(trimTaskList(tasks).map((t) => ({ id: t.id, title: t.title, priority: t.priority, mins: t.estimatedMinutes ?? 30, frog: !!t.isEatTheFrog, postpones: t.postponeCount ?? 0 })))}

Return ONLY JSON in the form: {"taskId":"...","reason":"..."}`,
          },
        ],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const text: string = data.content?.[0]?.text || '';
      const m = text.match(/\{[\s\S]*\}/);
      if (m) {
        const parsed = JSON.parse(m[0]);
        const chosen = tasks.find((t) => t.id === parsed.taskId) ?? pick;
        return {
          taskId: chosen.id,
          title: chosen.title,
          reason: parsed.reason ?? offlineReason,
          estimatedMinutes: chosen.estimatedMinutes ?? 30,
          priority: chosen.priority,
          isOffline: false,
        };
      }
    }
  } catch (error) {
    console.warn('AI suggestNextTask failed:', error);
  }

  return fallback;
}

/**
 * Generate Morning Briefing
 */
export async function generateMorningBriefing(
  userName: string,
  yesterdayData: {
    screenTime: number;
    tasksCompleted: number;
    tasksTotal: number;
    brainScore: number;
    streakDays: number;
  }
): Promise<string> {
  const defaultBriefing = `Previously on ${userName}'s Life... Yesterday you scored ${yesterdayData.brainScore}/100. ${yesterdayData.tasksCompleted}/${yesterdayData.tasksTotal} tasks done. Today is a new episode. Make it count.`;

  if (!API_URL || !process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY) {
    return defaultBriefing;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 150,
        messages: [
          {
            role: 'user',
            content: `Generate a morning briefing for ${userName} in the style of "Previously on..." TV show recap.
Yesterday: Screen time ${yesterdayData.screenTime}min, Tasks ${yesterdayData.tasksCompleted}/${yesterdayData.tasksTotal}, Brain Score ${yesterdayData.brainScore}, Streak ${yesterdayData.streakDays} days.
Keep it 2-3 sentences. Motivating but real. End with "Today is a new episode."`,
          },
        ],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.content?.[0]?.text || defaultBriefing;
    }
  } catch {
    // silent fall through
  }

  return defaultBriefing;
}
