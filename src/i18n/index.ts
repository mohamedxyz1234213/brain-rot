import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import en from './en.json';
import ar from './ar.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: 'en',
  fallbackLng: 'en',
  compatibilityJSON: 'v4',
  interpolation: {
    escapeValue: false,
  },
});

export const RTL_LANGS = ['ar'];

export function applyLanguage(lang: 'en' | 'ar') {
  if (i18n.language !== lang) i18n.changeLanguage(lang);
  const shouldRTL = RTL_LANGS.includes(lang);
  if (I18nManager.isRTL !== shouldRTL) {
    try {
      I18nManager.allowRTL(shouldRTL);
      I18nManager.forceRTL(shouldRTL);
    } catch {}
  }
}

export default i18n;
