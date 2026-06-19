/**
 * Achievement Badges (40+)
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'tasks' | 'focus' | 'screen_time' | 'prayer' | 'social' | 'streak' | 'special';
  xpReward: number;
  condition: string; // human-readable condition
}

export const achievements: Achievement[] = [
  // Tasks
  { id: 'first_blood', name: 'First Blood', description: 'Complete your first task', emoji: 'water-outline', category: 'tasks', xpReward: 50, condition: 'Complete 1 task' },
  { id: 'frog_slayer', name: 'Frog Slayer', description: 'Complete your Eat the Frog task', emoji: 'bug-outline', category: 'tasks', xpReward: 75, condition: 'Complete Eat the Frog task' },
  { id: 'task_machine', name: 'Task Machine', description: 'Complete 10 tasks in one day', emoji: 'settings-outline', category: 'tasks', xpReward: 100, condition: 'Complete 10 tasks in a day' },
  { id: 'centurion', name: 'Centurion', description: 'Complete 100 total tasks', emoji: 'business-outline', category: 'tasks', xpReward: 200, condition: 'Complete 100 tasks total' },
  { id: 'two_minute_warrior', name: '2-Minute Warrior', description: 'Complete 5 tasks using the 2-minute rule', emoji: 'flash-outline', category: 'tasks', xpReward: 75, condition: 'Complete 5 quick tasks' },

  // Focus
  { id: 'deep_diver', name: 'Deep Diver', description: 'Complete a 90-min deep work session', emoji: 'water-outline', category: 'focus', xpReward: 100, condition: 'Complete a deep work session' },
  { id: 'flow_state', name: 'Flow State', description: 'Complete 5 focus sessions without distractions', emoji: 'pulse-outline', category: 'focus', xpReward: 150, condition: '5 distraction-free sessions' },
  { id: 'pomodoro_pro', name: 'Pomodoro Pro', description: 'Complete 25 pomodoro sessions', emoji: 'timer-outline', category: 'focus', xpReward: 100, condition: '25 pomodoro sessions' },
  { id: 'focus_marathon', name: 'Focus Marathon', description: 'Accumulate 10 hours of focus time', emoji: 'walk-outline', category: 'focus', xpReward: 200, condition: '10 hours total focus' },
  { id: 'early_bird', name: 'Early Bird', description: 'Start a focus session before 7 AM', emoji: 'sunny-outline', category: 'focus', xpReward: 50, condition: 'Focus before 7 AM' },

  // Screen Time
  { id: 'digital_detox', name: 'Digital Detox', description: 'Stay under limit for 7 consecutive days', emoji: 'leaf-outline', category: 'screen_time', xpReward: 200, condition: '7 days under limit' },
  { id: 'cold_turkey', name: 'Cold Turkey', description: 'Zero social media usage for 24 hours', emoji: 'snow-outline', category: 'screen_time', xpReward: 150, condition: 'No social media for 24h' },
  { id: 'willpower_wall', name: 'Willpower Wall', description: 'Resist 10 blocked app attempts in one day', emoji: 'shield-outline', category: 'screen_time', xpReward: 75, condition: 'Resist 10 temptations' },
  { id: 'scroll_breaker', name: 'Scroll Breaker', description: 'Reduce screen time by 50% from your first week', emoji: 'trending-down-outline', category: 'screen_time', xpReward: 200, condition: '50% screen time reduction' },
  { id: 'app_free_evening', name: 'App-Free Evening', description: 'No social media after 8 PM', emoji: 'moon-outline', category: 'screen_time', xpReward: 50, condition: 'No socials after 8 PM' },

  // Prayer
  { id: 'prayer_perfect', name: 'Prayer Perfect', description: 'Pray all 5 prayers on time for a day', emoji: 'moon-outline', category: 'prayer', xpReward: 100, condition: 'All 5 prayers on time' },
  { id: 'fajr_warrior', name: 'Fajr Warrior', description: 'Pray Fajr on time for 7 consecutive days', emoji: 'sunny-outline', category: 'prayer', xpReward: 150, condition: '7 days Fajr on time' },
  { id: 'prayer_streak_30', name: 'Prayer Streak 30', description: 'All 5 prayers for 30 consecutive days', emoji: 'sparkles-outline', category: 'prayer', xpReward: 500, condition: '30-day perfect prayer' },
  { id: 'quran_companion', name: 'Quran Companion', description: 'Read Quran for 7 consecutive days', emoji: 'book-outline', category: 'prayer', xpReward: 100, condition: '7-day Quran streak' },
  { id: 'dhikr_devotee', name: 'Dhikr Devotee', description: 'Complete morning and evening adhkar for 7 days', emoji: 'repeat-outline', category: 'prayer', xpReward: 100, condition: '7-day adhkar streak' },
  { id: 'khatm_complete', name: 'Khatm Complete', description: 'Complete reading the entire Quran', emoji: 'trophy-outline', category: 'prayer', xpReward: 1000, condition: 'Complete Quran khatm' },

  // Social / Accountability
  { id: 'circle_founder', name: 'Circle Founder', description: 'Create an accountability circle', emoji: 'people-outline', category: 'social', xpReward: 50, condition: 'Create a circle' },
  { id: 'top_of_class', name: 'Top of Class', description: 'Rank #1 in your circle for a week', emoji: 'medal-outline', category: 'social', xpReward: 150, condition: '#1 in circle for a week' },
  { id: 'challenge_accepted', name: 'Challenge Accepted', description: 'Join and complete a public challenge', emoji: 'locate-outline', category: 'social', xpReward: 100, condition: 'Complete a challenge' },
  { id: 'mentor', name: 'Mentor', description: 'Help 3 circle members improve their scores', emoji: 'school-outline', category: 'social', xpReward: 100, condition: 'Help 3 members improve' },
  { id: 'accountability_king', name: 'Accountability King', description: 'Be in the top 10 global leaderboard', emoji: 'trophy-outline', category: 'social', xpReward: 300, condition: 'Top 10 globally' },

  // Streaks
  { id: 'streak_starter', name: 'Streak Starter', description: 'Achieve a 3-day streak in anything', emoji: 'flame-outline', category: 'streak', xpReward: 25, condition: '3-day streak' },
  { id: 'week_warrior', name: 'Week Warrior', description: 'Maintain any streak for 7 days', emoji: 'calendar-outline', category: 'streak', xpReward: 75, condition: '7-day streak' },
  { id: 'monthly_master', name: 'Monthly Master', description: 'Maintain any streak for 30 days', emoji: 'calendar-number-outline', category: 'streak', xpReward: 200, condition: '30-day streak' },
  { id: 'streak_survivor', name: 'Streak Survivor', description: 'Use a streak shield to save a streak', emoji: 'shield-outline', category: 'streak', xpReward: 25, condition: 'Use streak shield' },
  { id: 'multi_streak', name: 'Multi-Streaker', description: 'Maintain 3 different streaks simultaneously', emoji: 'flame-outline', category: 'streak', xpReward: 150, condition: '3 simultaneous streaks' },

  // Special
  { id: 'villain_arc_survived', name: 'Villain Arc Survived', description: 'Complete and survive Villain Arc Mode', emoji: 'flame-outline', category: 'special', xpReward: 100, condition: 'Survive Villain Arc' },
  { id: 'intervention_survivor', name: 'Intervention Survivor', description: 'Recover from Intervention Mode', emoji: 'fitness-outline', category: 'special', xpReward: 150, condition: 'Recover from intervention' },
  { id: 'night_owl_reformed', name: 'Night Owl Reformed', description: 'Go from 2AM+ usage to sleeping before midnight for a week', emoji: 'moon-outline', category: 'special', xpReward: 200, condition: 'Fix sleep schedule' },
  { id: 'promise_keeper', name: 'Promise Keeper', description: 'Keep 5 voice promises', emoji: 'hand-left-outline', category: 'special', xpReward: 100, condition: 'Keep 5 voice promises' },
  { id: 'brain_surgeon', name: 'Brain Surgeon', description: 'Achieve Brain Score of 90+', emoji: 'hardware-chip-outline', category: 'special', xpReward: 300, condition: 'Brain Score 90+' },
  { id: 'ascended_one', name: 'The Ascended One', description: 'Reach Ascended level (25000+ XP)', emoji: 'sparkles-outline', category: 'special', xpReward: 500, condition: 'Reach Ascended level' },
  { id: 'driving_safe', name: 'Safe Driver', description: 'Never touch phone while driving for 30 days', emoji: 'car-outline', category: 'special', xpReward: 150, condition: '30 days safe driving' },
  { id: 'og_member', name: 'OG Member', description: 'Join during beta / lifetime purchase', emoji: 'star-outline', category: 'special', xpReward: 100, condition: 'Beta or lifetime member' },
  { id: 'share_warrior', name: 'Share Warrior', description: 'Share 10 roast cards', emoji: 'share-outline', category: 'special', xpReward: 50, condition: 'Share 10 roast cards' },
  { id: 'comeback_kid', name: 'Comeback Kid', description: 'Go from score <30 to score >70 in one week', emoji: 'refresh-outline', category: 'special', xpReward: 250, condition: 'Major score improvement' },
];
