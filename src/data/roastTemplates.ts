/**
 * Offline Roast Templates (50+)
 * Used when Claude API is unreachable. Variables: {name}, {app}, {count}, {minutes}, {dollars}
 */

export const roastTemplates: Record<string, string[]> = {
  egyptian_dad: [
    'يا {name}، ابن خالتك خلص طب وانت لسه بتتفرج على تيك توك. مبروك عليك.',
    'أنا مش زعلان، أنا محبط. {minutes} دقيقة على {app}. كنت ممكن تتعلم لغة جديدة.',
    'لو جدك شاف إنك قعدت {minutes} دقيقة على الموبايل كان اتحسر.',
    'ابن عمك بيشتغل وانت بتضيع وقتك. {count} مرة فتحت {app} النهارده.',
    'أنا ربيتك أحسن من كده. {minutes} دقيقة؟ ربنا يهديك.',
    'كل اللي عملته عشانك وانت بتضيع عمرك على {app}. حسبي الله.',
    'لو كنت حطيت المجهود ده في شغلك كنت بقيت مدير.',
    '{name}، الموبايل مش هيوديك الجنة. قوم صلي أحسن.',
  ],
  egyptian_mom: [
    'يا حبيبي أنا عيني وجعتني من العياط عليك. {minutes} دقيقة على {app}؟',
    'أنا مناش فيه عشان تبقى كده؟ ربنا يهديك يا {name}.',
    'قلبي بيتقطع وانت مش حاسس. {count} مرة حاولت تفتح {app}.',
    'يا رب يهديك يا ابني. أنا تعبت. {minutes} دقيقة ضايعة.',
    'كل الأمهات ولادها بتنجح وأنا ابني بيضيع وقته. ربنا يصبرني.',
    'أنا مش هعيش كتير يا {name}. استغل وقتك قبل ما تندم.',
    'حرام عليك. أبوك كان بيشتغل ١٢ ساعة عشانك وانت بتتفرج على ريلز.',
    'يا ريت كنت بتقرأ قرآن بدل ما بتفتح {app} {count} مرة.',
  ],
  future_self: [
    "Hey {name}, it's you at 45. I wish you'd put the phone down. Those {minutes} minutes on {app}? They compounded into years of nothing.",
    "Remember that business idea you had? You never started it. You were too busy scrolling. That's ${dollars} of wasted potential today alone.",
    "I'm writing this from a life of regret. You had so much time. You spent it on {app}. {count} times today.",
    "The relationship you wanted? It needed attention you gave to your phone. {minutes} minutes today. She noticed.",
    "I don't have many friends left. Turns out people stop calling when you never show up because you're glued to {app}.",
    "You're 45 now and you can't remember a single TikTok that mattered. But you remember every opportunity you missed.",
    "That book you wanted to write? Still unwritten. {minutes} minutes on {app} today. Another day closer to never.",
    "I wish someone had shaken me at your age. {count} app opens today? That's not living, that's hiding.",
  ],
  drill_sergeant: [
    "LISTEN UP {name}! {minutes} minutes on {app}? You've gone SOFT. My grandmother has more discipline!",
    "You call yourself disciplined? {count} attempts to open blocked apps? That's PATHETIC soldier!",
    "DROP AND GIVE ME 20! Actually, give me {minutes} minutes of ACTUAL WORK. You owe your future that much!",
    "UNACCEPTABLE! You are AWOL from your own life! {app} doesn't need you. YOUR GOALS need you!",
    "I've seen jellyfish with more spine than you! {count} times you tried to break your own rules? DISGRACEFUL!",
    "SOLDIER! You just wasted ${dollars} worth of your time on {app}. That's DERELICTION OF DUTY!",
    "While you were scrolling, WINNERS were WINNING. {minutes} minutes of pure WEAKNESS!",
    "You think {app} cares about you? It's USING you! {count} opens today. Take back control or FALL OUT!",
  ],
  sigmund_freud: [
    "Fascinating, {name}. {minutes} minutes on {app}. Your id's compulsive need for stimulation has clearly overridden your superego's capacity for self-regulation.",
    "The repetitive checking — {count} times today — suggests an oral fixation sublimated into digital consumption. You're nursing, metaphorically.",
    "Your phone has become a transitional object, {name}. {app} provides the illusion of connection while deepening your isolation. Textbook avoidance.",
    "Interesting. ${dollars} of productivity lost. Your unconscious clearly associates self-sabotage with comfort. We should explore your relationship with your mother.",
    "{count} blocked app attempts. This repetition compulsion suggests you are unconsciously seeking punishment. The pleasure principle runs your life.",
    "You scroll to avoid confronting the void, {name}. {minutes} minutes of displacement activity. What are you really running from?",
    "The ego depletion is remarkable. {app} has exploited your dopaminergic pathways so thoroughly that volition has become merely theoretical.",
    "Your superego attempted {count} interventions today. Your id won every time. The prognosis, I'm afraid, is deeply concerning.",
  ],
  david_goggins: [
    "STAY HARD {name}! While you wasted {minutes} minutes on {app}, I ran a marathon. You're SOFT!",
    "You opened that app {count} times?! That's {count} times you CHOSE comfort over growth. PATHETIC!",
    "I used to be 300 pounds and miserable. You know what I didn't do? Scroll {app} for {minutes} minutes. GET AFTER IT!",
    "WHO'S GONNA CARRY THE BOATS?! Not you, because you're too busy on {app}. ${dollars} WASTED!",
    "{name}, you're living at 40% of your potential. {minutes} minutes scrolling? That's the 40% talking. PUSH THROUGH!",
    "They don't know you. They don't know what you're capable of. But right now? {count} app opens says you're SOFT.",
    "CALLOUS YOUR MIND! Every time you resist {app}, you build mental armor. You folded {count} times today. WEAK!",
    "I ran 100 miles on broken feet. You can't stop opening {app}. We are NOT the same. STAY HARD!",
  ],
};

// Generic templates (persona-agnostic)
export const genericTemplates: string[] = [
  "Your phone called. It's embarrassed.",
  "You've opened {app} {count} times. A golden retriever has more self control.",
  "Breaking news: Local person opens {app} for the {count}th time. Experts baffled.",
  "You've scrolled the height of the Burj Khalifa today. Going up?",
  "{name}, it's me, your iPhone. I'm tired. I deserve better.",
  "You wasted {minutes} min on {app}. That's ${dollars} at your hourly rate. Gone.",
  "Your future kids asked who that zombie on the couch was. It was you.",
  "Plot twist: {app} doesn't miss you when you're gone. You're not in a relationship.",
  "You've spent {minutes} minutes avoiding your actual life. Bold strategy.",
  "Congrats! You've unlocked the 'Professional Time Waster' achievement. No one's proud.",
  "{count} attempts to open blocked apps. The definition of insanity is doing the same thing expecting different results.",
  "That ${dollars} you just burned on screen time? Could've been a nice dinner. With real humans.",
  "Your attention span is now shorter than a goldfish. The goldfish sends its condolences.",
  "You opened {app} {count} times today. At this point, just marry it.",
  "Every minute on {app} is a minute you'll never get back. {minutes} minutes today. Poof. Gone.",
];

// Islamic mode templates
export const islamicTemplates: string[] = [
  "The Prophet ﷺ stood in prayer until his feet were swollen. You can't stop scrolling.",
  "Ibn Khaldun wrote the Muqaddimah. You watched a cat fall 14 times.",
  "Time is an Amanah from Allah. You spent {minutes} minutes of it on {app}.",
  "Omar ibn Al-Khattab conquered empires. You can't conquer your urge to open {app}.",
  "The Sahabah memorized the entire Quran. You memorized TikTok dances.",
  "Every second is a gift from Allah. You regifted {minutes} minutes to {app}.",
  "Ibn Sina wrote the Canon of Medicine as a teenager. You opened {app} {count} times today.",
  "On the Day of Judgment, you'll be asked about your time. What will you say about these {minutes} minutes?",
  "Imam Al-Ghazali warned about wasting time 900 years ago. You proved him right.",
  "The Prophet ﷺ said: 'Take advantage of five before five: your youth before your old age.' You took advantage of {app} instead.",
];
