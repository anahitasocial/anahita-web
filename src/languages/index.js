import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/en-ca';
import 'moment/locale/fr';
import 'moment/locale/fr-ca';
import 'moment/locale/de';
import 'moment/locale/es';
import 'moment/locale/pt-br';
import enCA from './en-CA';
import enUS from './en-US';
import frFR from './fr-FR';
import frCA from './fr-CA';
import deDE from './de-DE';
import es419 from './es-419';
import ptBR from './pt-BR';
import choose from './choose';
import frenchSpacing from './frenchSpacing';

const DEBUG = process.env.NODE_ENV !== 'production';

const setting = process.env.REACT_APP_LANGUAGE;
if (DEBUG && setting && !choose.LANGUAGES.includes(setting)) {
  console.warn(`REACT_APP_LANGUAGE=${setting} is not one of ${choose.LANGUAGES.join(', ')}; using ${choose.BASE}.`);
}

const browserLanguages = typeof navigator === 'undefined' ? [] :
  (navigator.languages && navigator.languages.length && navigator.languages) ||
  [navigator.language];

// moment names its locales in lower case, calls American English "en", and
// has one Spanish, "es".
const momentLocale = (language) => {
  if (language === 'en-US') {
    return 'en';
  }
  return language === 'es-419' ? 'es' : language.toLowerCase();
};

// Everything outside i18next that writes in the language shown: the page's
// own lang, for screen readers and the browser's spelling, and moment's
// dates. Intl is given i18n.language where it is called.
const follow = (language) => {
  moment.locale(momentLocale(language));
  if (typeof document !== 'undefined') {
    document.documentElement.lang = language;
  }
};

i18n.on('languageChanged', follow);

i18n
  .use(initReactI18next)
  .use(frenchSpacing.postProcessor)
  .init({
    // A base has every string; a layer, only those that differ from its
    // base, which fallbackLng reads for the rest. See ./choose.js.
    resources: {
      'en-CA': enCA,
      'en-US': enUS,
      'fr-FR': frFR,
      'fr-CA': frCA,
      'de-DE': deDE,
      'es-419': es419,
      'pt-BR': ptBR,
    },
    supportedLngs: choose.LANGUAGES,
    lng: choose.choose(browserLanguages, setting),
    fallbackLng: choose.FALLBACK,
    postProcess: ['frenchSpacing'],
    interpolation: {
      escapeValue: false,
    },
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
