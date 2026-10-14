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

// The languages written from right to left.
const RIGHT_TO_LEFT = ['ar', 'ckb', 'dv', 'fa', 'he', 'ps', 'sd', 'ug', 'ur', 'yi'];

// The direction to type a post in, from the language chosen for it: right
// to left for Persian, Arabic, Hebrew and the others, so that an empty box
// starts at the right. Otherwise `auto`, which takes the direction from the
// first letter typed, as before.
const directionOf = (code) => {
  return RIGHT_TO_LEFT.includes(primaryOf(code)) ? 'rtl' : 'auto';
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

// The composer used to remember the language somebody last posted in, in
// this browser, and start there. One post sent in the wrong language then
// made every post after it start in that language, each confirming it. It
// is no longer kept; what an older version stored is cleared.
const clearOld = () => {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // Nothing to clear, or nowhere to clear it from.
  }
};

// Where the composer starts, in order:
//
//   1. the posting language on their profile, which follows them to every
//      device;
//   2. what their browser, and so their computer, says they read;
//   3. English, so there is always an answer.
//
// A different language for one post is chosen on that post, and the next
// starts here again.
const defaultFor = (viewer) => {
  clearOld();
  return primaryOf(viewer && viewer.language) ||
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
  directionOf,
  nameOf,
  browserLanguage,
  defaultFor,
  optionsWith,
};
