import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';
import frTranslations from './locales/fr.json';
import guTranslations from './locales/gu.json';

i18n
  .use(LanguageDetector) // auto-detect the user language
  .use(initReactI18next) // pass i18n to react-i18next
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      es: {
        translation: esTranslations,
      },
      fr: {
        translation: frTranslations,
      },
      gu: {
        translation: guTranslations,
      },
    },
    fallbackLng: 'en', // use English if detection fails
    interpolation: {
      escapeValue: false, // not needed for React
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n; 