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

const tones: RoastNotif['tone'][] = ['funny', 'motivating', 'guilt', 'wakeup', 'mock'];

const egyptianArabicTitles = [
  'اقفل يا نجم البلاستيك',
  'الموبايل كسب الجولة',
  'محضر غياب للتركيز',
  'سكرول رسمي زيادة',
  'الضمير بينده عليك',
  'إيدك خدت إقامة',
  'المستقبل عامل ميوت',
  'أخبار الكرامة إيه؟',
  'تنبيه من عقلك',
  'الريلز بتسقفلك',
  'الوقت بيهرب منك',
  'كفاية دفن حي',
  'صاحبك الهدف زعلان',
  'الكسل لبس بدلة',
  'النهارده بيتسرق',
  'يا خسارة التركيز',
  'الواقع مستنيك بره',
  'مخك طالب نجدة',
  'رجع حياتك من {app}',
  'السكرول مش إنجاز',
  'فضيحة صغيرة ليك',
  'إحراج محترم',
  'مستواك مش كده',
  'الكرسي كسبك',
  'منظر مش لطيف',
  'خدها على كرامتك',
  'عيب على الوقت ده',
  'إعلان فشل مؤقت',
  'رجع هيبتك',
  'مخك بيستقيل',
  'النهارده بيتصفى',
  'سكرول بطعم الندم',
  'الطموح مخاصمك',
  'أزمة كرامة رقمية',
  'انقذ الباقي',
  'مشهد محتاج قص',
  'كفاية بهدلة',
  'انتبه لنفسك',
  'الواقع بيحاسب',
  'فاصل إحراج',
  'اقفل واثبت',
  'اليوم مش لعبة',
  'كسبوك بالسهولة دي؟',
  'غرامة سكرول',
  'رجع وشك لنفسك',
  'الهدف زهق منك',
];

const egyptianArabicBodies = [
  'يا {name}، {minutes} دقيقة على {app} و{tasks} مهام مستنياك. ده مش ترفيه، ده هروب متغلف في شاشة.',
  'انت مش بتريح دماغك، انت بتأجرها لـ {app} ببلاش. اقفل قبل ما يومك يطلع إيصال خسارة.',
  '{app} خد منك {minutes} دقيقة، ومداكش غير صداع وشوية ندم. قوم اعمل مهمة واحدة تنقذ بيها شكلك قدام نفسك.',
  'كل ريل بتقول بعده هقوم، والكرسي بقى حافظ مقاسك. قوم قبل ما مستقبلك يعملك بلوك.',
  'النهارده كان ممكن يبقى صفحة محترمة في حياتك، بس انت حولته لسجل حضور في {app}.',
  'ضميرك مش نايم، ده عامل نفسه ميت من كتر ما نده عليك. اقفل التليفون وخليه يتنفس.',
  'يا {name}، انت بتعامل {app} كأنه وظيفة بدوام كامل من غير مرتب ولا تأمين ولا كرامة.',
  'لو الندم بيتحسب بالدقيقة، انت جمعت {minutes} دقيقة قسط النهارده. ادفعهم شغل بقى.',
  'اللي انت بتعمله مش استراحة، ده تدريب يومي على إنك تبقى نسخة مؤجلة من نفسك.',
  'مخك كان ممكن ينتج فكرة، بس انت خليته يتفرج على ناس بتعمل حاجات بدل ما تعمل انت.',
  'كل ما تفتح {app} بتصوت ضد حلمك. والنتيجة النهارده مش في صالحك يا {name}.',
  'في {tasks} مهام واقفين طابور، وانت واقف طابور عند خوارزمية مش عارفة اسمك.',
  'السكرول ده عامل زي الرمل المتحرك: شكله ناعم، بس بيسحب عمرك حبة حبة.',
  'لو أبوك سأل يومك راح فين، هتقوله في جيب شركة إعلان؟ عيب عليك يا {name}.',
  'انت مش محتاج تحفيز، انت محتاج تشيل التليفون من إيدك كأنه حتة فحم مولعة.',
  'عينك بتقرأ كابشنات ملهاش لازمة، وقلبك عارف إنك سايب اللي وراك. اقفل.',
  '{minutes} دقيقة كفاية تخلي أي هدف يحس إنك خنته. صالحه بمهمة دلوقتي.',
  'الموبايل مش صاحبك؛ ده سمسار انتباه بياخد عمولته من عمرك.',
  'انت عامل لايك لحياة الناس وسايب حياتك من غير تحديث. افتح الواقع يا {name}.',
  'بعد كل ده على {app}، أخدت إيه؟ ولا حاجة. بس خسرت جزء محترم من اليوم.',
  'السرير مش مكتب، والسقف مش خطة، و{app} مش مستقبل. قوم يا بطل الورق.',
  'النهارده بيقولك الحقني، وانت بتقوله استنى لما الريل يخلص. الريل مش هيخلص.',
  'يا {name}، كفاية إنجازات وهمية: حفظت صوت ترند، ضيعت {minutes} دقيقة، وسيبت {tasks} مهام.',
  'لو التركيز بني آدم كان هيمشي من عندك ويقولك ربنا يعوضني في صاحب أحسن.',
  'انت مش بتفوت محتوى، انت بتفوت نفسك. ودي خسارة مش بتتعوض بسكرين شوت.',
  'كل دقيقة على {app} بتقول لمستقبلك: معلش مش فاضي لك. عارف قسوتها؟',
  'الكرامة الرقمية إنك تعرف تقول كفاية. قولها دلوقتي قبل ما {app} يقولها بدالك.',
  'مفيش ريل هيحل قلقك، بس إنك تخلص مهمة من {tasks} ممكن يخففه فعلًا.',
  'يا {name}، دماغك مش زبالة محتوى. نضفها بقفل الشاشة خمس دقايق.',
  'انت بتسلم يومك حتة حتة لـ {app}، وبعدين تستغرب ليه مفيش وقت. الحساب واضح.',
  'الوقت اللي راح مش راجع، بس اللي جاي لسه بيستأذنك. اقفل وخليه يدخل.',
  'لو في بطولة للهروب من المسؤولية، {app} كان هيطلب توقيعك على تيشيرت المنتخب.',
  'يا خسارة، {minutes} دقيقة كانوا ينفعوا مكالمة لأهلك أو صلاة أو شغل. اخترت ضوضاء.',
  'مش كل إشعار يستاهل رد، بس حياتك تستاهل حضور. اقفل يا {name}.',
  'تليفونك سخن من الاستخدام، ومستقبلك بردان من الإهمال. دفيه بفعل حقيقي.',
  'انت مش ناقص وقت، انت ناقص قرار. القرار دلوقتي: اقفل {app}.',
  'الريلز شافتك كتير لدرجة لو اختفيت هتبلغ عنك. اختفي عنها شوية.',
  'الكسل لما يحب يتشيك يلبس اسم استراحة. بس احنا شايفينه يا {name}.',
  'لو يومك كان حساب بنك، {app} سحب {minutes} دقيقة من غير OTP. انت اللي سمحت.',
  'مش لازم تبقى خارق. بس لازم تبطل تبقى موظف عند السكرول.',
  'يا {name}، افتح مهمة واحدة واقفل ألف عذر. البداية أوجع من الندم بس أنضف.',
  'كل مرة تقول بعد شوية، الشوية بتكبر وتاكل اليوم. النهارده لسه فيه نفس.',
  'العيب مش إنك وقعت في {app}. العيب إنك قاعد تفرش وتستقر جوه الوقعة.',
  'انت بتدور على دوبامين رخيص، وبتدفع بأغلى حاجة عندك: وقتك.',
  'الضمير مش بيزعق عشان يضايقك؛ بيزعق عشان لسه شايف فيك أمل.',
  'لو حد سرق منك {minutes} دقيقة كنت اتعصبت. انت سرقتهم من نفسك وبتضحك.',
  'قفل الشاشة مش عقاب، ده إنقاذ. انقذ نفسك من {app} قبل ما اليوم يخلص.',
  'يا {name}، انت مش فاشل، بس السلوك ده بيكتب سيرة فشل بخط واضح.',
  'الحلم مش محتاج منك خطبة. محتاج عشر دقايق من غير {app}.',
  'انت قاعد تجمع فتات انتباه، وسايب وجبة محترمة اسمها حياتك.',
  'بصراحة كده يا {name}: شكلك وانت مستسلم لـ {app} مش منظر بني آدم عنده خطة، ده منظر واحد سايب يومه يتسرق وهو بيتفرج.',
  'لو حد كان بيصورك وانت بتهرب من {tasks} مهام وبتفتح {app}، كنت هتتكسف من نفسك قبل ما تتكسف من الناس.',
  '{minutes} دقيقة وانت بتغذي شاشة مش هتفتكرك بكرة. الإهانة الحقيقية إنك عارف كده ولسه مكمل.',
  'انت مش محتاج حد يزعقلك؛ محتاج تبص على نفسك من بره وانت بتسكرول وتقول: هو أنا وصلت للمنظر ده؟',
  'يا {name}، الخوارزمية ماسكاك من ياقة قميصك وانت بتقولها كمان. دي مش حرية، دي قلة سيطرة محرجة.',
  'لو كرامتك ليها صوت كانت قالتلك: كفاية بقى، أنا تعبت من منظرنا قدام {app}.',
  'فيه ناس بتبني جسمها وشغلها وعلاقتها بربنا، وانت بتبني تاريخ مشاهدة. فرق يوجع بس لازم يتقال.',
  'انت عامل نفسك مش واخد بالك، بس الحقيقة إنك بتختار الأسهل كل مرة وبعدين تزعل إن حياتك صعبة.',
  'الكرسي شايلك، التليفون سايقك، و{tasks} مهام بيتفرجوا عليك. مين فيهم المفروض يبقى القائد يا {name}؟',
  'كل مرة تقول آخر ريل وانت عارف إنك بتكدب على نفسك. مش محتاج عقاب، محتاج شوية احترام لكلمتك.',
  'اللي يوجع إنك مش قليل الإمكانيات؛ انت بس بتتصرف كأن وقتك ببلاش ومفيش حد هيحاسبك عليه.',
  'يا {name}، لو يومك ده دخل مسابقة إنجازات، هيتطرد من الباب عشان ريحته {app}.',
  'انت سايب أحلامك واقفة على الباب، ومدخل {app} يقعد مكانها. منظر قليل الذوق مع نفسك.',
  'مش هقولك انت ضايع، بس هقولك إن اللي بيحصل دلوقتي شبه الضياع أوي ومحتاج توقف قبل ما يبقى وصف رسمي.',
  '{minutes} دقيقة من عمرك راحت في لا شيء، وده مش هزار. دي لقطة لازم تكسفك كفاية تقوم.',
  'انت بتعامل نفسك كأنك مش مستاهل نسخة أحسن. عيب يا {name}، انت مستاهل بس لازم تبطل تسلم نفسك لـ {app}.',
  'النهارده مش محتاج بطل خارق، محتاج واحد عنده شوية نخوة يقفل الشاشة ويخلص حاجة واحدة.',
  'لو ابن خالتك شاف سجل استخدامك هيقول الحمد لله على نعمة الطموح. متخليش المقارنة تكسب بالسهولة دي.',
  'المرعب مش إنك ضيعت {minutes} دقيقة؛ المرعب إنك كنت ممكن تكمل عادي لو الإشعار ده مجاش يحرجك.',
  'خدها على كرامتك: {app} عرف يكسرك أكتر من مهمة صغيرة. قوم رجع هيبتك قدام نفسك.',
  'انت مش محتاج تتجلد، بس محتاج وشك يحمر شوية من رقم {minutes} دقيقة. الاحراج ده ممكن ينقذك.',
  'كل اللي بتأجله بيكبر، وكل اللي بتسكروله بيتنسى. اختيارك الحالي مهين لذكائك يا {name}.',
  'لو التليفون كان بني آدم كان هيقول لصحابه: ده بيرجعلي كل مرة بسهولة. متخليش نفسك النكتة.',
  'الناس اللي بتتفرج عليهم عايشين يومهم، وانت بتتفرج عليهم بدل ما تعيش يومك. دي صفعة مش نصيحة.',
  'يا {name}، انت عامل {app} مدير عليك وواقفله طابور حضور. امضى استقالتك واقفل الشاشة.',
  'المشهد محرج: {tasks} مهام مستنياك، وانت بتقلب في {app} كأن فيه شهادة تقدير في الآخر.',
  'لو في حد بيقيم احترامك لوقتك، كان اداك إنذار نهائي بعد {minutes} دقيقة دول.',
  'انت مش بتقتل وقت، انت بتقتل النسخة اللي كان ممكن تبقى محترمة منك.',
  'بلاش تضحك على نفسك: دي مش راحة، دي استسلام متزوق بإضاءة شاشة.',
  'اللي يوجع إنك فاهم المشكلة كويس، بس سايب صباعك يتصرف كأنه هو صاحب القرار.',
  'يا {name}، لو طموحك شافك دلوقتي هيغيّر رقمه ويقولك متكلمنيش غير لما تحترم وقتك.',
  'انت مش محتاج محتوى جديد؛ محتاج موقف جديد من نفسك. اقفل {app} قبل ما كرامتك تزهق.',
  'كل ثانية زيادة هنا بتخلي كلمة "هبدأ بكرة" أرخص وأكذب.',
  'الموبايل مش ماسكك بحبل، بس انت ماسك الحبل وبتقول مخنوق. سيبه.',
  'لو حد سألك عملت إيه النهارده، هتقول إيه؟ "درّبت الخوارزمية على ضعفي"؟',
  '{minutes} دقيقة كفاية تخلي يوم كامل يبصلك باستغراب ويقول: هو ده آخرك؟',
  'يا {name}، انت بتدي أغلى حاجة عندك لأرخص حاجة بتشد انتباهك. الحساب ده مهين.',
  'فيه فرق بين إنك ترتاح وإنك تستخبى. اللي بيحصل دلوقتي استخباء واضح.',
  'السكرول بيطبطب عليك وهو بيسرقك. بلاش تبقى الضحية اللي بتفتح الباب للحرامي.',
  'انت سايب دماغك في زحمة {app} ومستغرب ليه مش سامع صوت نفسك.',
  'لو الإحراج ينفع كدواء، فالجرعة دي: اقفل التليفون فورًا وخلص مهمة واحدة.',
  'الهدف مش زعلان منك عشان وقعت؛ زعلان عشان قاعد على الأرض وبتتفرج على ريلز.',
  'يا {name}، المنظر مش ناقص وعظ. ناقص حركة واحدة: زرار القفل.',
  'كل ما تقول مش قادر، {app} بيضحك لأنه عارف إنك قادر بس مستسهل.',
  'انت بتلبس الهروب لبس "خمس دقايق". بس الرقم بقى {minutes} دقيقة، والكدبة اتكشفت.',
  'لو يومك كان وش، كان احمر من كتر ما انت سبته يتبهدل قدام {app}.',
  'مشكلتك مش إنك بتحب التليفون؛ مشكلتك إنك بتسيبه يهين أولوياتك وانت ساكت.',
  'يا {name}، خليك صريح: انت فتحت {app} عشان تهرب من حاجة. الحاجة لسه موجودة ومستنياك.',
  'الندم مش هييجي بصوت عالي. هييجي بالليل وانت فاكر إن اليوم ضاع لوحده. لا، انت ساعدته.',
  'كل دقيقة هنا بتعمل حفرة صغيرة في ثقتك بنفسك. اطلع قبل ما تبقى عادة.',
  'انت مش قليل، بس تصرفك ده قليل أوي على واحد عنده عقل وفرصة ويوم لسه ماخلصش.',
  'لو التركيز له أهل، كانوا بلغوا عن اختفائه بعد أول نص ساعة على {app}.',
  'يا {name}، الشاشة مش حضن. دي مصيدة مريحة. فرق كبير ومؤلم.',
  'اللي بيحصل مش كوميدي؛ الكوميدي إنك لسه فاكر آخر ريل هيبقى فعلًا آخر ريل.',
  'انت بتبيع احترامك لكلمتك كل مرة تقول هقفل ومبتقفلش. استرجعه دلوقتي.',
  'لو {tasks} مهام عندهم جروب، أكيد بيسموا الجروب "مستنيين المعجزة".',
  'الحقيقة البايخة: محدش هييجي ينقذك من {app}. لازم تقوم انت وتبطل تبقى سهل.',
  'يا {name}، اليوم بيتسحب منك وانت بتوافق بالشروط والأحكام من غير ما تقرا.',
  'انت بتخسر معركة صغيرة قدام زرار ملون، ودي حاجة لازم تضايقك كفاية تغيرها.',
  'كل إشعار بيفتح باب، بس انت اللي بتدخل وتقعد وتطلب شاي. قوم.',
  'لو مستقبلك بعتلك فويس دلوقتي، هيبدأ بـ: بجد؟ كل ده على {app}؟',
  'انت مش بتدور على تسلية، انت بتدور على تخدير. والتخدير لما يزيد بيبوظ اليوم.',
  'يا {name}، كفاية تعامل نفسك كأنك مشروع مؤجل. افتح مهمة واقفل {app}.',
  'الكرامة مش كلام كبير؛ الكرامة إنك تقفل لما تقول هقفل.',
  'منظر إنك عارف الصح وبتختار الغلط عشان أسهل، منظر محتاج يتغير النهارده.',
  'السكرول عامل فيك شغل جامد: خلاك مشغول جدًا وإنتاجك صفر. فضيحة حسابية.',
  'لو حد بص على يومك من فوق، هيلاقي {app} واخد الكرسي الأمامي وحياتك في الشنطة.',
  'يا {name}، انت مش روبوت عند الخوارزمية. اثبت ده بقفل التليفون دقيقة واحدة.',
  'مش لازم تنقذ حياتك كلها دلوقتي. انقذ الساعة دي من الهزل اللي انت فيه.',
  'كل ما تسيب {app} يكسب، بتصعب على نفسك المرة الجاية. اكسر السلسلة وهي صغيرة.',
  'الاحترام الداخلي بيتبني بوعود صغيرة. وعد نفسك تقفل دلوقتي ونفذ.',
  'انت سايب اليوم يتمرمط وبتقول عادي. لا، مش عادي، وده السبب إن الإشعار ده شديد.',
  'يا {name}، لو الموبايل بيدفعلك على القعدة دي كنا سكتنا. لكنه بياخد منك وبيضحك.',
  'فيه حاجة حزينة في إنك تدي {app} كل الحضور ده وتدي أحلامك اعتذار باهت.',
  'ده مش استخدام موبايل، ده استفتاء يومي ضد نفسك. غيّر النتيجة دلوقتي.',
  'لو ضميرك عنده بطارية، انت استهلكتها في تنبيهات داخلية تجاهلتها كلها.',
  'يا {name}، قسوة الكلام أقل من قسوة إنك تصحى بعد سنة تلاقي نفس العادة كبرت.',
  'الوقت مش بيكرهك، بس انت بتعامله كأنه عدو. صالحه بعشر دقايق شغل.',
  'كل ريل عدى قالك: هات اللي بعده. ولا واحد قالك: ابني نفسك. خد بالك.',
  'انت بتتعلم الطاعة لـ {app}: ينده تروح، يلمع تبص، يرن تنسى نفسك. كفاية تدريب.',
  'لو اليوم ده ليه محامي، هيطلب تعويض عن {minutes} دقيقة إهمال.',
  'يا {name}، الخسارة مش بس وقت. الخسارة إنك بتعوّد نفسك إن كلمتك ملهاش وزن.',
  'اقفل قبل ما رقم {minutes} يبقى عنوان اليوم كله. لسه ينفع تكتب نهاية أحسن.',
  'انت بتدي الشاشة حق الفيتو على خطتك. اسحب منها السلطة.',
  'مفيش حاجة على {app} مستاهلة إنك تبان قدام نفسك بالشكل ده.',
  'لو الملل هو الباب للتركيز، انت كل ما الباب يفتح بتجري على {app}. واجه الملل مرة.',
  'يا {name}، يومك مش ناقص محتوى، يومك ناقص عمود فقري صغير اسمه قرار.',
  'انت بتستنى مزاج ييجي، والمزاج مستنيك تقفل {app}. حد لازم يبدأ.',
  'اللي يخوف إن {app} مش بيغصبك. انت بتروحله برجليك، وده معناه إنك تقدر تمشي برضه.',
  'خد اللقطة دي في دماغك: انت، شاشة، {minutes} دقيقة، وصفر حاجة تفخر بيها. غير اللقطة.',
  'يا {name}، مش كل جلد مفيد، بس الإحراج هنا في مكانه: انت سايب نفسك تسهل زيادة.',
  'قفل التليفون دلوقتي مش انتصار عالمي، بس هزيمة {app} في الجولة دي تكفي.',
  'انت بتفتح {app} كأنه مسكن، بس المسكن اللي بياخد مستقبلك كأعراض جانبية غالي أوي.',
  'لو احترام الذات بيتقاس بالوفاء بالوعد، وعد "آخر ريل" محتاج محاكمة.',
  'يا {name}، كل ما تطول هنا بتدي دليل جديد إنك محتاج حدود. حط الحد بنفسك.',
  'الواقع مش هيستناك تخلص تغذية لا نهائية. اسمه لا نهائي عشان يدفنك لو سيبته.',
  'انت بتضيع فرصة صغيرة تبقى أحسن، وبتاخد مكانها جرعة نسيان رخيصة.',
  'خلي الإشعار ده يلسع شوية: انت أكبر من إن تطبيق يسرقك بالسهولة دي.',
  'يا {name}، لو عندك ذرة غيرة على نفسك، اقفل {app} واعمل أي حاجة تنفعك.',
  'المشكلة مش في {minutes} دقيقة بس؛ المشكلة في الرسالة اللي بتبعتهالك: أنا مش مسيطر.',
  'ارجع مسيطر. حتى لو عشر دقايق. حتى لو مهمة واحدة. المهم متفضلش بالشكل ده.',
];

const englishTitles = [
  'Phone parole denied',
  'Your focus left',
  'Scroll tax collected',
  'Reality is waiting',
  'Algorithm won again',
  'Future you flinched',
  'Attention bankruptcy',
  'Thumb on autopilot',
  'Goals filed a complaint',
  'Put it down',
];

const englishBodies = [
  '{name}, {minutes} minutes on {app} with {tasks} tasks waiting is not a break. It is avoidance wearing headphones.',
  'The algorithm just rented your brain for free. Take it back before your day becomes a receipt for nothing.',
  'You are not relaxing. You are letting {app} sandpaper your attention span one swipe at a time.',
  'Future you is not angry; future you is embarrassed by how cheaply you sold this hour.',
  '{app} took {minutes} minutes and gave you fog. One real task would give you proof you still drive your life.',
  'Your goals are not dramatic. They are just tired of watching you choose pixels over progress.',
  'You said five minutes. The lie now has a commute, a lease, and furniture.',
  'Nothing on {app} is urgent. Your life is quietly becoming urgent while you ignore it.',
  'If your attention were money, you just got robbed in daylight and thanked the thief.',
  '{tasks} tasks are waiting while you audition for the role of background character in your own life.',
  'Your thumb has more discipline than your schedule, and that is not a compliment.',
  'Close {app}. The next swipe is not content; it is another tiny vote against yourself.',
  '{minutes} minutes gone. Do one useful thing now so the whole day does not have to testify against you.',
  'You do not need motivation. You need distance between your hand and this phone.',
  'The feed will not remember you. Your unfinished life will.',
  'You keep liking other people moving forward. Try starring in your own progress for once.',
  'This is not downtime anymore. This is your ambition leaking through a cracked screen.',
  'Put the phone face down. If that feels hard, that is exactly why it matters.',
  'You are feeding a machine that gets richer when you get smaller. Bad trade.',
  'One task. Ten minutes. No performance speech. Just stop donating your day to {app}.',
];

// Lazy expansion — build the arrays on first access instead of at module
// load time, keeping startup memory and bundle decode cost low.
let _lazyArabicExpanded: RoastNotif[] | null = null;
let _lazyEnglishExpanded: RoastNotif[] | null = null;

function ensureArabicExpanded(): RoastNotif[] {
  if (!_lazyArabicExpanded) {
    const out: RoastNotif[] = [];
    for (let i = 0; i < 1800; i++) {
      out.push({
        title: egyptianArabicTitles[i % egyptianArabicTitles.length],
        body: egyptianArabicBodies[(i + Math.floor(i / egyptianArabicTitles.length)) % egyptianArabicBodies.length],
        tone: tones[i % tones.length],
      });
    }
    _lazyArabicExpanded = out;
  }
  return _lazyArabicExpanded;
}

function ensureEnglishExpanded(): RoastNotif[] {
  if (!_lazyEnglishExpanded) {
    const out: RoastNotif[] = [];
    for (let i = 0; i < 220; i++) {
      out.push({
        title: englishTitles[i % englishTitles.length],
        body: englishBodies[(i + Math.floor(i / englishTitles.length)) % englishBodies.length],
        tone: tones[i % tones.length],
      });
    }
    _lazyEnglishExpanded = out;
  }
  return _lazyEnglishExpanded;
}

export function getRoastBank(lang: 'en' | 'ar'): RoastNotif[] {
  if (lang === 'ar') {
    return [...arabicRoastNotifications, ...ensureArabicExpanded()];
  }
  return [...englishRoastNotifications, ...ensureEnglishExpanded()];
}

export function pickRandomNotif(lang: 'en' | 'ar'): RoastNotif {
  const bank = getRoastBank(lang);
  return bank[Math.floor(Math.random() * bank.length)];
}

export function fillTokens(text: string, ctx: { name?: string; minutes?: number; app?: string; tasks?: number }): string {
  const defaultName = ctx.name ?? 'يا صاحبي';
  const defaultApp = ctx.app ?? 'تيك توك';
  return text
    .replace(/\{name\}/g, defaultName)
    .replace(/\{minutes\}/g, String(ctx.minutes ?? 30))
    .replace(/\{app\}/g, defaultApp)
    .replace(/\{tasks\}/g, String(ctx.tasks ?? 3));
}
