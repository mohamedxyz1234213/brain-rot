/**
 * Automated roast / motivation notifications.
 * Tone: Egyptian dialect, short, punchy, alternating funny + motivating.
 * Variables: {name}, {minutes}, {app}, {tasks}
 */

export interface RoastNotif {
  title: string;
  body: string;
  tone: 'funny' | 'motivating' | 'guilt' | 'wakeup' | 'mock';
}

export const arabicRoastNotifications: RoastNotif[] = [
  // === Funny / sarcastic ===
  { title: 'مش كفاية موبايل بقى؟', body: 'بقالك {minutes} دقيقة ما رفعتش عينيك. ادي عنيك راحة شوية.', tone: 'funny' },
  { title: 'عاجبك حالك كده؟', body: 'وانت قاعد على {app} وابن خالتك مخلص كل حاجة. تفتكر مين فيكوا اللي بيكسب؟', tone: 'guilt' },
  { title: 'يعم شوفلك حاجة!', body: 'قوم اعمل أي مهمة بدل ضياع الوقت ده. أي حاجة بس متبصش في {app} تاني.', tone: 'motivating' },
  { title: 'إنذار خطر 🚨', body: 'الموبايل بيلصق في إيدك. لو سبت {app} دقيقة ربنا هيرضى عنك.', tone: 'funny' },
  { title: 'بقالك ساعة!', body: '{minutes} دقيقة سكرول وانت لسه فاكر نفسك مشغول. شغل إيه يا قلبي؟', tone: 'mock' },
  { title: 'تيك توك بيشكرك', body: 'بفضلك حقق أرقام النهارده. مبروك عليك العمولة... مفيش عمولة.', tone: 'mock' },
  { title: 'ابن خالتك خلص اللي عليه', body: 'وانت لسه على نفس الريل. خد نفس وقوم.', tone: 'guilt' },
  { title: 'اقفل الموبايل!', body: 'بجد اقفله. حالًا. مش بكرة. مش بعد الريل ده. دلوقتي.', tone: 'wakeup' },
  { title: 'الإنستجرام مش هيوديك الجنة', body: 'قوم صلي ركعتين بدل سكرول. هتحس بفرق.', tone: 'motivating' },
  { title: 'بطل سكرول!', body: 'البطارية في 15% والدماغ في 5%. اقفل التليفون.', tone: 'funny' },
  { title: 'إيه ده يا عم؟', body: '{minutes} دقيقة! ده وقت تخلص فيه شغل أسبوع.', tone: 'mock' },
  { title: 'الدنيا بتمشي', body: 'انت بس اللي قاعد في مكانك. {minutes} دقيقة ضايعة. متضيعش أكتر.', tone: 'motivating' },
  { title: 'تليفونك بيستنزفك', body: 'حرفيًا. كل دقيقة على {app} بياخد من عمرك. اقفله.', tone: 'wakeup' },
  { title: 'ماما بتقولك سلام', body: 'وانت مش راد لأنك في {app}. كلمها بقى.', tone: 'guilt' },
  { title: 'البيت محتاج تنضيف', body: 'الشغل محتاجك. الصلاة جايه. وانت في ريلز. تمام تمام.', tone: 'mock' },
  { title: 'فاكر هدفك؟', body: 'هو فاكرك. بس {app} بياخدك بعيد عنه. ارجع.', tone: 'motivating' },
  { title: 'البطل دلوقتي', body: 'يقوم يقفل الموبايل ويعمل حاجة. البطل = انت. ابقى بطل.', tone: 'motivating' },
  { title: 'ولا حاجة', body: '{minutes} دقيقة وعملت ولا حاجة. عادي بس انت أحسن من كده.', tone: 'wakeup' },
  { title: 'استنى استنى', body: 'انت لسه فاتح {app}؟ بعد كل اللي اتفقنا عليه؟', tone: 'funny' },
  { title: 'فضحتنا قدام الجيران', body: 'الجيران شافوك من الشباك بتسكرول. حسبي الله.', tone: 'funny' },
  { title: 'أبوك بيدعيلك', body: 'وانت بتدعي لـ {app}. الميزان مش متعادل.', tone: 'guilt' },
  { title: 'الوقت بيمشي', body: 'الساعة كذا والمهام كلها زي ما هي. قوم بقى.', tone: 'motivating' },
  { title: 'مهمة واحدة بس', body: 'مش لازم كله. مهمة واحدة دلوقتي. ابدأ.', tone: 'motivating' },
  { title: 'بنعالجك يا قلبي', body: 'بس انت لازم تساعدنا. اقفل التليفون ومتفتحوش لحد ما تخلص حاجة.', tone: 'motivating' },
  { title: 'ساعة كاملة', body: 'فاضل {minutes} دقيقة على الميعاد وانت لسه في {app}. عيب.', tone: 'mock' },
  { title: 'تيك توك مش صاحبك', body: 'صحابك بيكلموك. هما اللي بيهموا. {app} ما يهموش.', tone: 'wakeup' },
  { title: 'عرفت ليه تعبان؟', body: 'مش لأنك بتشتغل. لأنك قاعد على الموبايل {minutes} دقيقة من غير ما تاخد بالك.', tone: 'wakeup' },
  { title: 'ناس بتنام', body: 'انت لسه فاتح {app}. الساعة كام يا حبيبي؟', tone: 'guilt' },
  { title: 'قرآن أحسن', body: 'لو فتحت المصحف بدل {app} كان قلبك ارتاح. جرب.', tone: 'motivating' },
  { title: 'صلاة الفجر فاتت', body: 'وانت كنت مستيقظ. على {app}. ربنا يهديك.', tone: 'guilt' },
  { title: 'الإيد بقت بتوجع', body: 'من كتر السكرول. خد لها راحة. ولا انت ناوي تطلع متحف؟', tone: 'funny' },
  { title: 'عقلك بيشحت', body: 'بيقول كفاية. وانت بتقوله ريل واحد كمان. ظالم.', tone: 'mock' },
  { title: 'هتروح فين؟', body: 'لو فضلت كده 10 سنين على {app}، فين هتلاقي نفسك؟', tone: 'wakeup' },
  { title: 'بس كده؟', body: '{minutes} دقيقة وحسبتها إنجاز؟ ده ضياع يا {name}.', tone: 'mock' },
  { title: 'العيلة فاكراك', body: 'لو سلمت عليهم بدل {app} كان شكلك بقى أحسن.', tone: 'guilt' },
  { title: 'الموتيفيشن', body: 'مش بتيجي من ريلز. بتيجي لما تعمل حاجة. قوم اعمل.', tone: 'motivating' },
  { title: 'حلمك بيستناك', body: 'وانت في {app}. الحلم تعبان أوي. ارحمه.', tone: 'motivating' },
  { title: 'انت غالي', body: 'وقتك أغلى من {app}. اوعى تنسى.', tone: 'motivating' },
  { title: 'اتحدى نفسك', body: ' 30 دقيقة من غير ما تفتح {app}. ابدأ من دلوقتي.', tone: 'motivating' },
  { title: 'متخدعش نفسك', body: '"خمس دقايق وبس" كذبة بقالك سنين بتقولها. اقفله.', tone: 'wakeup' },
  { title: 'الناس بتنجح', body: 'وانت بتفتح {app}. الفرق دقيقة. اختار صح.', tone: 'wakeup' },
  { title: 'ابدأ بأي حاجة', body: 'دقيقة شغل خير من ساعة سكرول. ابدأ بحاجة صغيرة.', tone: 'motivating' },
  { title: 'كل ثانية', body: 'بتمر ومش بترجع. {minutes} دقيقة راحوا. متضيعش الباقي.', tone: 'wakeup' },
  { title: 'اعمل لنفسك حاجة', body: 'حتى لو حاجة صغيرة. اشرب ماية، اتمشي، صلي. أي حاجة غير {app}.', tone: 'motivating' },
  { title: 'يبقى انت مين؟', body: 'لما تتسأل خلال 5 سنين كنت بتعمل إيه، هتقول "فاتح {app}"؟', tone: 'wakeup' },
  { title: 'الدماغ بتعفن', body: 'حرفيًا. علميًا. {minutes} دقيقة سكرول كل يوم بتاكل الدماغ. اقفل.', tone: 'wakeup' },
  { title: 'مش بتذاكر؟', body: 'الامتحان قرب وانت لسه على {app}. هتندم.', tone: 'guilt' },
  { title: 'كفاية بقى!', body: 'صدق نفسك مرة. اقفل التليفون. اعمل اللي عليك.', tone: 'wakeup' },
  { title: 'إيه أخبار التمرين؟', body: 'مرضيتش تروح الجيم. بس فضلت ساعة على {app}. منطق غريب.', tone: 'mock' },
  { title: 'بعد الريل ده', body: 'هتقول دي آخر مرة. زي كل مرة. اقفل دلوقتي بقى.', tone: 'funny' },
  { title: 'ربنا بيشوفك', body: 'وعارف بتعمل إيه. الوقت أمانة. متضيعهاش على {app}.', tone: 'wakeup' },
  { title: 'بكرة هتقول معلش', body: 'دلوقتي قول كفاية. الفرق كبير.', tone: 'motivating' },
  { title: 'مش بشتغل وحدي', body: 'انت اللي بتشتغل. أنا بفكرك بس. قوم خلص حاجة.', tone: 'motivating' },
  { title: 'كم مهمة فاضلة؟', body: 'عندك {tasks} مهام. ولا واحدة خلصت. ابدأ بأسهلها.', tone: 'motivating' },
  { title: 'احترم نفسك', body: 'انت أحسن من إنك تفضل ساعتين على {app}. قوم.', tone: 'motivating' },
];

export const englishRoastNotifications: RoastNotif[] = [
  { title: 'Hey, eyes up', body: "You've been scrolling for {minutes} minutes. The world is still out there.", tone: 'wakeup' },
  { title: 'Your cousin finished', body: "And you're still on {app}. Who's winning here?", tone: 'guilt' },
  { title: 'Do literally anything', body: 'Walk. Stretch. Pray. Write one line. Anything but {app}.', tone: 'motivating' },
  { title: 'Phone down 📵', body: "Right now. Not after this reel. Now.", tone: 'wakeup' },
  { title: 'Reality check', body: "{minutes} mins on {app} today. Your future self is filing a complaint.", tone: 'mock' },
  { title: 'TikTok says thanks', body: "You boosted their metrics. They will not boost yours.", tone: 'mock' },
  { title: 'Your goals just texted', body: 'They asked when you\'re coming back. Reply.', tone: 'motivating' },
  { title: 'Bro.', body: "{minutes} minutes. You okay?", tone: 'funny' },
  { title: 'Future you is watching', body: "And they are NOT impressed.", tone: 'guilt' },
  { title: 'One task. One.', body: "Pick the easiest one. Start. That's the whole job right now.", tone: 'motivating' },
  { title: 'You\'re tired because…', body: "you've been on {app} for {minutes} mins. Not because you worked.", tone: 'wakeup' },
  { title: 'The algorithm knows you', body: "Better than you know yourself. That's a problem.", tone: 'wakeup' },
  { title: 'Lock the phone', body: "Face down. Across the room. {minutes} minutes is enough.", tone: 'wakeup' },
  { title: 'Just 25 mins', body: "Start a focus session. We block everything. You just work.", tone: 'motivating' },
  { title: 'You said \"5 mins\"', body: "It's been {minutes}. You lie to yourself well.", tone: 'mock' },
  { title: 'بنعالجك', body: "But we can't do it for you. Close {app} and tap something useful.", tone: 'motivating' },
  { title: 'Touch grass', body: "Literally. Outside. Right now. {minutes} mins of pixels was plenty.", tone: 'funny' },
  { title: 'Discipline = freedom', body: 'Scroll = chains. Pick one.', tone: 'wakeup' },
  { title: 'You\'re better than this', body: "Not a roast. A reminder. Now act like it.", tone: 'motivating' },
  { title: 'Your brain is begging', body: "for silence. Stop feeding it {app}.", tone: 'wakeup' },
  { title: 'Stop scrolling', body: 'Seriously. Like, right now. Yes you. Put it down.', tone: 'wakeup' },
  { title: 'Nothing on {app} matters', body: "tomorrow. Your tasks do. Pick one.", tone: 'motivating' },
  { title: 'Plot twist', body: "you're the villain of your own day. Change the script.", tone: 'mock' },
  { title: '{tasks} tasks waiting', body: "Zero of them will do themselves. Tap one.", tone: 'motivating' },
  { title: 'Hour check', body: "Where did the last {minutes} mins go? You know where.", tone: 'wakeup' },
];

export function pickRandomNotif(lang: 'en' | 'ar'): RoastNotif {
  const bank = lang === 'ar' ? arabicRoastNotifications : englishRoastNotifications;
  return bank[Math.floor(Math.random() * bank.length)];
}

export function fillTokens(text: string, ctx: { name?: string; minutes?: number; app?: string; tasks?: number }): string {
  return text
    .replace(/\{name\}/g, ctx.name ?? 'يا قلبي')
    .replace(/\{minutes\}/g, String(ctx.minutes ?? 30))
    .replace(/\{app\}/g, ctx.app ?? 'تيك توك')
    .replace(/\{tasks\}/g, String(ctx.tasks ?? 3));
}
