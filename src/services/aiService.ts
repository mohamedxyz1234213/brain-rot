/**
 * AI Service - Claude API integration for roast generation and AI features
 */

import { roastPersonas } from '../data/roastPersonas';

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
 * Generate a roast using Claude API
 */
export async function generateRoast(
  personaId: string,
  trigger: string,
  context: RoastContext,
  lang?: 'en' | 'ar'
): Promise<RoastResult> {
  if (!API_URL || !process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY) {
    throw new Error('Claude API key is not configured. Set EXPO_PUBLIC_ANTHROPIC_API_KEY.');
  }

  const persona = roastPersonas.find((p) => p.id === personaId) || roastPersonas[0];

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
          content: buildRoastPrompt(trigger, context, lang),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API request failed: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '';
  if (!text) {
    throw new Error('Claude API returned empty response');
  }

  return { text, persona: persona.name, isOffline: false };
}

function buildRoastPrompt(trigger: string, context: RoastContext, lang?: 'en' | 'ar'): string {
  if (lang === 'ar') {
    return `ولِّد روشتة (هيصة) لـ ${context.userName}.
السبب: ${trigger}
المعلومات:
- وقت الشاشة النهارده: ${context.screenTimeToday} دقيقة (الحد: ${context.screenTimeLimit} د)
- المهام: ${context.tasksCompleted}/${context.tasksTotal} تمت
- أكتر تطبيق مضيعة للوقت: ${context.topWastedApp} (${context.topWastedMinutes} د)
- محاولات الدخول الممنوع النهارده: ${context.blockedAttempts}
- مدة الاستمرار: ${context.streakDays} يوم

كن مبدع، محدد، وقاسي. استخدم المعلومات الحقيقية. خليها في جملتين بالعامية المصرية.`;
  }
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
    throw new Error('Claude API key is not configured. Set EXPO_PUBLIC_ANTHROPIC_API_KEY.');
  }

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

  if (!response.ok) {
    throw new Error(`Claude API request failed: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '';
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Claude API returned unexpected response format');
  }

  return { schedule: JSON.parse(jsonMatch[0]) as DayPlanBlock[], isOffline: false };
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

  if (!API_URL || !process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY) {
    throw new Error('Claude API key is not configured. Set EXPO_PUBLIC_ANTHROPIC_API_KEY.');
  }

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

  if (!response.ok) {
    throw new Error(`Claude API request failed: ${response.status}`);
  }

  const data = await response.json();
  const text: string = data.content?.[0]?.text || '';
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) {
    throw new Error('Claude API returned unexpected response format');
  }

  const parsed = JSON.parse(m[0]);
  const pick = tasks.find((t) => t.id === parsed.taskId) ?? tasks[0];
  if (!pick) return null;

  return {
    taskId: pick.id,
    title: pick.title,
    reason: parsed.reason ?? '',
    estimatedMinutes: pick.estimatedMinutes ?? 30,
    priority: pick.priority,
    isOffline: false,
  };
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
  },
  lang?: 'en' | 'ar'
): Promise<string> {
  if (!API_URL || !process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY) {
    throw new Error('Claude API key is not configured. Set EXPO_PUBLIC_ANTHROPIC_API_KEY.');
  }

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
          content: lang === 'ar'
            ? `ولِّد بريفينغ الصباح لـ ${userName} على طريقة "في الحلقة الماضية..." من المسلسلات.
النهارده: وقت الشاشة ${yesterdayData.screenTime}د، المهام ${yesterdayData.tasksCompleted}/${yesterdayData.tasksTotal}، نسبة الدماغ ${yesterdayData.brainScore}، الاستمرار ${yesterdayData.streakDays} يوم.
خليها ٢-٣ جمل. تحفيزية بس واقعية. خلصها بـ "النهارده حلقة جديدة."`
            : `Generate a morning briefing for ${userName} in the style of "Previously on..." TV show recap.
Yesterday: Screen time ${yesterdayData.screenTime}min, Tasks ${yesterdayData.tasksCompleted}/${yesterdayData.tasksTotal}, Brain Score ${yesterdayData.brainScore}, Streak ${yesterdayData.streakDays} days.
Keep it 2-3 sentences. Motivating but real. End with "Today is a new episode."`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}
