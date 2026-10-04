import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English
import enCommon from './locales/en/common.json';
import enDashboard from './locales/en/dashboard.json';
import enAi from './locales/en/ai.json';

// Hindi
import hiCommon from './locales/hi/common.json';
import hiDashboard from './locales/hi/dashboard.json';
import hiAi from './locales/hi/ai.json';

// Gujarati
import guCommon from './locales/gu/common.json';
import guDashboard from './locales/gu/dashboard.json';
import guAi from './locales/gu/ai.json';

const resources = {
  en: {
    common: enCommon,
    dashboard: enDashboard,
    ai: enAi,
  },
  hi: {
    common: hiCommon,
    dashboard: hiDashboard,
    ai: hiAi,
  },
  gu: {
    common: guCommon,
    dashboard: guDashboard,
    ai: guAi,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n;
