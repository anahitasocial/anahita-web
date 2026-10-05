// The language a post is written in.
//
// A post carries one language tag, chosen by its author: "en", "fr",
// "fa". A screen reader pronounces the post by it, and other fediverse
// servers file the post under it. The server checks the tag and never
// guesses one; see anahita-services, package language.
//
// The composer starts on a sensible language so that most people never
// touch the choice, and this is where "sensible" is decided.

const UNDETERMINED = 'und';

const STORAGE_KEY = 'composer.language';

// What the menu offers, most widely written first, then alphabetical by
// code. Not every language there is: a tag outside this list is still
// valid on the server and is shown, by its code, on a post that has it.
const CODES = [
  'en', 'es', 'fr', 'de', 'pt', 'ar', 'fa', 'hi', 'zh', 'ja', 'ru',
  'bg', 'bn', 'ca', 'cs', 'cy', 'da', 'el', 'et', 'eu', 'fi', 'ga', 'gl',
  'gu', 'he', 'hr', 'hu', 'hy', 'id', 'is', 'it', 'ka', 'ko', 'ku', 'lt',
  'lv', 'ml', 'mr', 'ms', 'nl', 'no', 'pa', 'pl', 'ps', 'ro', 'sk', 'sl',
  'sq', 'sr', 'sv', 'sw', 'ta', 'te', 'th', 'tl', 'tr', 'uk', 'ur', 'vi',
];

// "fr-CA" -> "fr". The menu offers languages, not regions: the region a
// browser reports says where the computer was bought as often as how its
// owner writes.
const primaryOf = (tag) => {
  return `${tag || ''}`.split(/[-_]/)[0].toLowerCase();
};

const isOffered = (code) => {
  return CODES.includes(code);
};

// The name of a language, in the language the app is being read in:
// "French" in English, "français" in French. From the browser, which
// knows them all; a browser that does not gets the code.
const nameOf = (code, uiLanguage = 'en') => {
  if (!code || code === UNDETERMINED) {
    return '';
  }

  try {
    const names = new Intl.DisplayNames([uiLanguage], { type: 'language' });
    const name = names.of(code);
    return name && name !== code ? name : code.toUpperCase();
  } catch (e) {
    return code.toUpperCase();
  }
};

// What the browser says its owner reads, as one of the offered codes,
// or '' when it says nothing usable.
const browserLanguage = () => {
  const candidates = [
    ...((typeof navigator !== 'undefined' && navigator.languages) || []),
    typeof navigator !== 'undefined' ? navigator.language : '',
  ];

  const found = candidates.map(primaryOf).find(isOffered);
  return found || '';
};

const read = () => {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
};

// The language this person last posted in, in this browser. Per person:
// a shared browser must not hand one person's language to the next.
const remembered = (viewer) => {
  return read()[viewer.id] || '';
};

const remember = (viewer, code) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...read(),
      [viewer.id]: code,
    }));
  } catch (e) {
    // Not remembered. The next post starts from the profile again.
  }
};

// Where the composer starts, in order:
//
//   1. the language this person last posted in, here: somebody who
//      switched to French for a post is probably still writing French;
//   2. the posting language on their profile, which follows them to
//      every device;
//   3. what the browser says they read;
//   4. English, so there is always an answer.
const defaultFor = (viewer) => {
  return remembered(viewer) ||
    primaryOf(viewer.language) ||
    browserLanguage() ||
    'en';
};

// The codes to list in a menu: the offered ones, plus the current value
// if it is one the menu does not offer, so a post or profile that has it
// can show where it stands.
const optionsWith = (current) => {
  if (!current || current === UNDETERMINED || isOffered(current)) {
    return CODES;
  }
  return [current, ...CODES];
};

export default {
  UNDETERMINED,
  CODES,
  primaryOf,
  nameOf,
  browserLanguage,
  remembered,
  remember,
  defaultFor,
  optionsWith,
};
