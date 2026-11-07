import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import moment from 'moment';
import 'moment/dist/locale/en-ca';
import 'moment/dist/locale/fr';
import 'moment/dist/locale/fr-ca';
import 'moment/dist/locale/de';
import 'moment/dist/locale/es';
import 'moment/dist/locale/pt-br';
import enCA from './en-CA';
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
    // The base everybody falls back to is in the first script; the
    // language shown is fetched before the app is drawn (`ready`, below).
    resources: {
      'en-CA': enCA,
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

// Every language but the base, fetched when it is shown and not with the
// app (roadmap row 128): each is a script of its own, and somebody reading
// in one language never loads the other four.
const LOADERS = {
  'en-US': () => { return import('./en-US'); },
  'fr-FR': () => { return import('./fr-FR'); },
  'fr-CA': () => { return import('./fr-CA'); },
  'de-DE': () => { return import('./de-DE'); },
  'es-419': () => { return import('./es-419'); },
  'pt-BR': () => { return import('./pt-BR'); },
};
const loaded = { [choose.BASE]: true };

// A language, and what it falls back to, made ready to be shown. Resolves
// at once for one already there.
export const loadLanguage = (language) => {
  const wanted = [language, ...(choose.FALLBACK[language] || [])].filter((each) => {
    return !loaded[each] && LOADERS[each];
  });
  return Promise.all(wanted.map((each) => {
    return LOADERS[each]().then((module) => {
      Object.entries(module.default).forEach(([namespace, strings]) => {
        i18n.addResourceBundle(each, namespace, strings, true, true);
      });
      loaded[each] = true;
    });
  }));
};

// Every language: for the tests, which read them all.
export const loadAll = () => {
  return Promise.all(choose.LANGUAGES.map(loadLanguage));
};

// The language shown, ready. The app is drawn once this has resolved, so
// that nothing shows in the base first and then changes; a language that
// could not be fetched shows the base.
export const ready = loadLanguage(i18n.language).catch((err) => {
  console.log('A language could not be loaded; the base is shown.', err);
});

export default i18n;
