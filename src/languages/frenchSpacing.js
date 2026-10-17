// The space before ?, ! and ; in French, made by a rule as each string is
// shown, so that the strings themselves are written once, with an ordinary
// space, for both kinds of French.
//
// French from France puts a space there: a narrow no-break space, so that
// the mark is never carried to a line of its own. Quebec French puts none.

const BEFORE_MARK = /[ \u00A0\u202F]+([?!;])/g;

const NARROW_NO_BREAK = '\u202F';

const space = (text, language) => {
  // A list or a set of strings, asked for with returnObjects.
  if (Array.isArray(text)) {
    return text.map((each) => { return space(each, language); });
  }
  if (text && typeof text === 'object') {
    return Object.fromEntries(Object.entries(text).map(([key, each]) => {
      return [key, space(each, language)];
    }));
  }
  if (typeof text !== 'string') {
    return text;
  }
  if (language === 'fr-CA') {
    return text.replace(BEFORE_MARK, '$1');
  }
  if (language === 'fr-FR') {
    return text.replace(BEFORE_MARK, `${NARROW_NO_BREAK}$1`);
  }
  return text;
};

// As an i18next post processor, applied to every string looked up.
const postProcessor = {
  type: 'postProcessor',
  name: 'frenchSpacing',
  process: (value, key, options, translator) => {
    return space(value, (options && options.lng) || translator.language);
  },
};

export default {
  NARROW_NO_BREAK,
  space,
  postProcessor,
};
