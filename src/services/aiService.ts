/**
 * AI Service - Claude API integration for roast generation and AI features
 */

import NetInfo from '@react-native-community/netinfo';
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

const PRIORITY_WEIGHT: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function trimTaskList<T extends { title: string }>(tasks: T[]): T[] {
  return tasks.slice(0, MAX_TASKS_IN_PROMPT).map((t) => ({
    ...t,
    title: typeof t.title === 'string' ? t.title.slice(0, MAX_TITLE_CHARS) : '',
  }));
}

async function canUseOnlineAI(): Promise<boolean> {
  if (!API_URL || !process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY) return false;

  try {
    const state = await NetInfo.fetch();
    return state.isConnected !== false && state.isInternetReachable !== false;
  } catch {
    return false;
  }
}

function sortTasksByFocusValue<T extends { priority: string; estimatedMinutes?: number; isEatTheFrog?: boolean; postponeCount?: number }>(tasks: T[]): T[] {
  return [...tasks].sort((a, b) => {
    const frogDelta = Number(!!b.isEatTheFrog) - Number(!!a.isEatTheFrog);
    if (frogDelta) return frogDelta;

    const priorityDelta = (PRIORITY_WEIGHT[b.priority] ?? 0) - (PRIORITY_WEIGHT[a.priority] ?? 0);
    if (priorityDelta) return priorityDelta;

    const postponeDelta = (b.postponeCount ?? 0) - (a.postponeCount ?? 0);
    if (postponeDelta) return postponeDelta;

    return (a.estimatedMinutes ?? 30) - (b.estimatedMinutes ?? 30);
  });
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
  if (!tasks.length) return { schedule: [], isOffline: false };
  const offlinePlan = () => ({ schedule: buildOfflineDayPlan(tasks, preferences), isOffline: true });
  if (!(await canUseOnlineAI())) return offlinePlan();

  try {
    const response = await fetch(API_URL!, {
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

    if (!response.ok) return offlinePlan();

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return offlinePlan();

    return { schedule: JSON.parse(jsonMatch[0]) as DayPlanBlock[], isOffline: false };
  } catch {
    return offlinePlan();
  }
}

function buildOfflineDayPlan(
  tasks: { title: string; priority: string; estimatedMinutes: number }[],
  preferences: { energyLevel: 'morning' | 'afternoon' | 'evening'; workHours: number }
): DayPlanBlock[] {
  const startByEnergy = { morning: 9, afternoon: 13, evening: 18 } as const;
  const maxMinutes = Math.max(60, preferences.workHours * 60);
  let minutesFromMidnight = startByEnergy[preferences.energyLevel] * 60;
  let usedMinutes = 0;

  return sortTasksByFocusValue(tasks).reduce<DayPlanBlock[]>((schedule, task, index) => {
    const duration = Math.min(Math.max(task.estimatedMinutes || 30, 15), 90);
    if (usedMinutes + duration > maxMinutes) return schedule;

    if (index > 0 && index % 2 === 0 && usedMinutes + 15 <= maxMinutes) {
      schedule.push({ time: formatPlanTime(minutesFromMidnight), task: 'Break', duration: 15 });
      minutesFromMidnight += 15;
      usedMinutes += 15;
    }

    schedule.push({ time: formatPlanTime(minutesFromMidnight), task: task.title, duration });
    minutesFromMidnight += duration;
    usedMinutes += duration;
    return schedule;
  }, []);
}

function formatPlanTime(minutesFromMidnight: number): string {
  const hours = Math.floor(minutesFromMidnight / 60) % 24;
  const minutes = minutesFromMidnight % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
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

  const offlineSuggestion = () => buildOfflineNextTaskSuggestion(tasks, context);
  if (!(await canUseOnlineAI())) return offlineSuggestion();

  const langInstr = context.lang === 'ar'
    ? 'Respond in Arabic (Egyptian dialect, motivating, 1 sentence).'
    : 'Respond in English, 1 motivating sentence.';

  try {
    const response = await fetch(API_URL!, {
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

    if (!response.ok) return offlineSuggestion();

    const data = await response.json();
    const text: string = data.content?.[0]?.text || '';
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return offlineSuggestion();

    const parsed = JSON.parse(m[0]);
    const pick = tasks.find((t) => t.id === parsed.taskId) ?? tasks[0];
    if (!pick) return null;

    return {
      taskId: pick.id,
      title: pick.title,
      reason: parsed.reason || buildOfflineNextTaskReason(pick, context),
      estimatedMinutes: pick.estimatedMinutes ?? 30,
      priority: pick.priority,
      isOffline: false,
    };
  } catch {
    return offlineSuggestion();
  }
}

function buildOfflineNextTaskSuggestion(
  tasks: { id: string; title: string; priority: string; estimatedMinutes?: number; isEatTheFrog?: boolean; postponeCount?: number }[],
  context: { currentHour: number; energyLevel?: 'morning' | 'afternoon' | 'evening'; lang?: 'en' | 'ar' }
): NextTaskSuggestion | null {
  const pick = sortTasksByFocusValue(tasks)[0];
  if (!pick) return null;

  return {
    taskId: pick.id,
    title: pick.title,
    reason: buildOfflineNextTaskReason(pick, context),
    estimatedMinutes: pick.estimatedMinutes ?? 30,
    priority: pick.priority,
    isOffline: true,
  };
}

function buildOfflineNextTaskReason(
  task: { priority: string; estimatedMinutes?: number; isEatTheFrog?: boolean; postponeCount?: number },
  context: { currentHour: number; energyLevel?: 'morning' | 'afternoon' | 'evening'; lang?: 'en' | 'ar' }
): string {
  const minutes = task.estimatedMinutes ?? 30;
  if (context.lang === 'ar') {
    if (task.isEatTheFrog) return `ابدأ بها لأنها مهمة الضفدع، و${minutes} دقيقة كفاية تكسر المقاومة.`;
    if ((task.postponeCount ?? 0) >= 2) return `اختيار ذكي الآن لأنها اتأجلت كفاية وتحتاج دفعة قصيرة.`;
    return `ابدأ بها الآن لأنها أولوية ${task.priority} ومناسبة لجلسة ${minutes} دقيقة.`;
  }

  if (task.isEatTheFrog) return `Start here because it is your frog task, and ${minutes} focused minutes will break the resistance.`;
  if ((task.postponeCount ?? 0) >= 2) return `Pick this now because it has been postponed enough and needs a short decisive push.`;
  return `Start here because it is a ${task.priority} priority task that fits a ${minutes}-minute focus block.`;
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
  if (!(await canUseOnlineAI())) {
    return buildOfflineMorningBriefing(userName, yesterdayData, lang);
  }

  try {
    const response = await fetch(API_URL!, {
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

    if (!response.ok) return buildOfflineMorningBriefing(userName, yesterdayData, lang);

    const data = await response.json();
    return data.content?.[0]?.text || buildOfflineMorningBriefing(userName, yesterdayData, lang);
  } catch {
    return buildOfflineMorningBriefing(userName, yesterdayData, lang);
  }
}

function buildOfflineMorningBriefing(
  userName: string,
  data: {
    screenTime: number;
    tasksCompleted: number;
    tasksTotal: number;
    brainScore: number;
    streakDays: number;
  },
  lang?: 'en' | 'ar'
): string {
  if (lang === 'ar') {
    return `صباح الخير يا ${userName}. امبارح كان عندك ${data.screenTime} دقيقة شاشة، خلصت ${data.tasksCompleted}/${data.tasksTotal} مهام، ودرجة التركيز كانت ${data.brainScore}. النهارده حلقة جديدة.`;
  }

  return `Morning, ${userName}. Previously: ${data.screenTime} minutes of screen time, ${data.tasksCompleted}/${data.tasksTotal} tasks completed, and a brain score of ${data.brainScore}. Today is a new episode.`;
}
