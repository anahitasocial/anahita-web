import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import en from './en-GB';
import fr from './fr-FR';

const DEBUG = process.env.NODE_ENV !== 'production';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en,
      fr,
    },
    interpolation: {
      escapeValue: false,
    },
    lng: 'en',
    fallbackLng: 'en',
    debug: DEBUG,
    // The translations are bundled, so initialise synchronously: components
    // call i18n.t while rendering, before any effect could wait for it.
    initAsync: false,
    react: {
      // No Suspense boundary wraps the app.
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
    },
  }, (err) => {
    return err && console.log('Error loading i18n translation module.', err);
  });

export default i18n;
