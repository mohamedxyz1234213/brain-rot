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

const API_URL = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY
  ? 'https://api.anthropic.com/v1/messages'
  : null;

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
export async function generateDayPlan(
  tasks: { title: string; priority: string; estimatedMinutes: number }[],
  preferences: { energyLevel: 'morning' | 'afternoon' | 'evening'; workHours: number }
): Promise<{ schedule: { time: string; task: string; duration: number }[] } | null> {
  if (!API_URL || !process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY) {
    return null;
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
Tasks: ${JSON.stringify(tasks)}
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
        return { schedule: JSON.parse(jsonMatch[0]) };
      }
    }
  } catch (error) {
    console.warn('AI day plan generation failed:', error);
  }

  return null;
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
