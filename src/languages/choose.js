// Which of the app's languages to show, from what the browser says its
// reader reads. Plain data in, a language out, so that it can be tested
// without a browser.
//
// English for Canada and French from France are the bases, with every
// string; American English and Quebec French are layers over them, of the
// strings that differ. Any other English is shown as Canadian, and any
// other French as French from France: their readers read those best.
// German, from anywhere, is German from Germany.

const BASE = 'en-CA';

const LANGUAGES = ['en-CA', 'en-US', 'fr-FR', 'fr-CA', 'de-DE'];

// The languages with every string. The rest are layers over one of them.
const BASES = ['en-CA', 'fr-FR', 'de-DE'];

// What each language falls back to, for a string it does not have.
const FALLBACK = {
  'en-US': ['en-CA'],
  'fr-CA': ['fr-FR', 'en-CA'],
  'fr-FR': ['en-CA'],
  'de-DE': ['en-CA'],
  default: [BASE],
};

// One tag from the browser, matched to one of ours, or '' for none.
const match = (tag) => {
  const [primary = '', region = ''] = String(tag || '').toLowerCase().split(/[-_]/);
  if (primary === 'en') {
    return region === 'us' ? 'en-US' : 'en-CA';
  }
  if (primary === 'fr') {
    return region === 'ca' ? 'fr-CA' : 'fr-FR';
  }
  if (primary === 'de') {
    return 'de-DE';
  }
  return '';
};

// The operator's default: REACT_APP_LANGUAGE when it is one of ours.
const siteDefault = (setting) => {
  return LANGUAGES.includes(setting) ? setting : BASE;
};

// The first of the reader's languages that we have, in their order, so that
// somebody whose browser prefers German and then French sees French. With
// none of ours among them, the site's default.
const choose = (browserLanguages, setting) => {
  const found = (browserLanguages || []).map(match).find(Boolean);
  return found || siteDefault(setting);
};

export default {
  BASE,
  LANGUAGES,
  BASES,
  FALLBACK,
  match,
  siteDefault,
  choose,
};
