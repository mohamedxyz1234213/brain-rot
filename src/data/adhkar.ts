/**
 * Adhkar (Morning & Evening Remembrances)
 * Preloaded for offline use in the Dhikr Counter feature.
 */

export interface Dhikr {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  count: number;
  category: 'morning' | 'evening' | 'after_prayer' | 'general';
  source: string;
}

export const adhkar: Dhikr[] = [
  {
    id: 'ayat_kursi',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ',
    transliteration: "Allahu la ilaha illa Huwal-Hayyul-Qayyum, la ta'khudhuhu sinatun wa la nawm",
    translation: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep.',
    count: 1,
    category: 'morning',
    source: 'Al-Baqarah 2:255',
  },
  {
    id: 'subhanallah_33',
    arabic: 'سُبْحَانَ اللَّهِ',
    transliteration: 'SubhanAllah',
    translation: 'Glory be to Allah',
    count: 33,
    category: 'after_prayer',
    source: 'Sahih Muslim',
  },
  {
    id: 'alhamdulillah_33',
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    translation: 'All praise is due to Allah',
    count: 33,
    category: 'after_prayer',
    source: 'Sahih Muslim',
  },
  {
    id: 'allahuakbar_33',
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
    count: 33,
    category: 'after_prayer',
    source: 'Sahih Muslim',
  },
  {
    id: 'morning_sayyid',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ',
    transliteration: "Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana 'abduk",
    translation: 'O Allah, You are my Lord, none has the right to be worshipped except You, You created me and I am Your servant',
    count: 1,
    category: 'morning',
    source: 'Sahih Al-Bukhari',
  },
  {
    id: 'evening_protection',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    transliteration: "A'udhu bikalimatillahit-tammati min sharri ma khalaq",
    translation: 'I seek refuge in the perfect words of Allah from the evil of what He has created',
    count: 3,
    category: 'evening',
    source: 'Sahih Muslim',
  },
  {
    id: 'istighfar',
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    transliteration: 'Astaghfirullah',
    translation: 'I seek forgiveness from Allah',
    count: 100,
    category: 'general',
    source: 'Sahih Muslim',
  },
  {
    id: 'la_ilaha_illallah',
    arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    transliteration: 'La ilaha illallahu wahdahu la sharika lah',
    translation: 'None has the right to be worshipped except Allah, alone, without partner',
    count: 100,
    category: 'morning',
    source: 'Sahih Al-Bukhari & Muslim',
  },
  {
    id: 'salawat',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ',
    transliteration: "Allahumma salli 'ala Muhammad wa 'ala ali Muhammad",
    translation: 'O Allah, send blessings upon Muhammad and the family of Muhammad',
    count: 10,
    category: 'morning',
    source: 'Sahih Al-Bukhari',
  },
  {
    id: 'hawqala',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transliteration: 'La hawla wa la quwwata illa billah',
    translation: 'There is no power and no strength except with Allah',
    count: 10,
    category: 'general',
    source: 'Sahih Al-Bukhari & Muslim',
  },
  {
    id: 'subhanallah_wabihamdihi',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'SubhanAllahi wa biHamdihi',
    translation: 'Glory be to Allah and praise be to Him',
    count: 100,
    category: 'general',
    source: 'Sahih Al-Bukhari & Muslim',
  },
  {
    id: 'subhanallah_aladheem',
    arabic: 'سُبْحَانَ اللَّهِ الْعَظِيمِ',
    transliteration: 'SubhanAllahi al-Adheem',
    translation: 'Glory be to Allah the Most Great',
    count: 100,
    category: 'general',
    source: 'Sahih Al-Bukhari',
  },
  {
    id: 'subhanallah_wabihamdihi_aladheem',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
    transliteration: "SubhanAllahi wa biHamdihi, SubhanAllahi al-Adheem",
    translation: 'Glory be to Allah and praise be to Him; Glory be to Allah the Most Great',
    count: 10,
    category: 'general',
    source: 'Sahih Al-Bukhari & Muslim',
  },
  {
    id: 'salawat_ibrahimiyya',
    arabic: 'اللَّهُمَّ صَلِّ وَبَارِكْ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ',
    transliteration: "Allahumma salli wa barik 'ala sayyidina Muhammadin wa 'ala ali sayyidina Muhammad",
    translation: 'O Allah, send prayers and blessings upon our master Muhammad and upon the family of our master Muhammad',
    count: 10,
    category: 'general',
    source: 'Sahih Al-Bukhari',
  },
  {
    id: 'alhamdulillah_rabbil_alameen',
    arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    transliteration: "Alhamdulillahi Rabbil-'Alameen",
    translation: 'All praise is due to Allah, Lord of all the worlds',
    count: 33,
    category: 'general',
    source: "Al-Fatihah 1:2",
  },
  {
    id: 'allahuakbar_kabeera',
    arabic: 'اللَّهُ أَكْبَرُ كَبِيرًا وَالْحَمْدُ لِلَّهِ كَثِيرًا',
    transliteration: "Allahu Akbaru kabira, walhamdu lillahi kathira",
    translation: 'Allah is the Greatest, and all praise is due to Allah in abundance',
    count: 1,
    category: 'general',
    source: 'Sahih Muslim',
  },
];
