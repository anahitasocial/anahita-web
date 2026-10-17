/* eslint-env jest */
import i18n from '..';
import choose from '../choose';
import frenchSpacing from '../frenchSpacing';
import enCA from '../en-CA';
import enUS from '../en-US';
import frFR from '../fr-FR';
import frCA from '../fr-CA';
import deDE from '../de-DE';
import es419 from '../es-419';
import ptBR from '../pt-BR';

const RESOURCES = {
  'en-CA': enCA,
  'en-US': enUS,
  'fr-FR': frFR,
  'fr-CA': frCA,
  'de-DE': deDE,
  'es-419': es419,
  'pt-BR': ptBR,
};

const { NARROW_NO_BREAK } = frenchSpacing;

// Every key path in a set of namespaces: "events:event.state.cancelled".
const keysOf = (namespaces) => {
  const keys = [];
  const walk = (value, path) => {
    if (value && typeof value === 'object') {
      Object.entries(value).forEach(([key, inner]) => {
        walk(inner, path ? `${path}.${key}` : key);
      });
    } else {
      keys.push(path);
    }
  };
  Object.entries(namespaces).forEach(([namespace, strings]) => {
    walk(strings, `${namespace}:`);
  });
  return keys.map((key) => { return key.replace(':.', ':'); });
};

describe('choosing the language', () => {
  it.each([
    [['en-US'], 'en-US'],
    [['en-CA'], 'en-CA'],
    [['en-GB'], 'en-CA'],
    [['en-AU'], 'en-CA'],
    [['en'], 'en-CA'],
    [['fr-CA'], 'fr-CA'],
    [['fr-FR'], 'fr-FR'],
    [['fr-BE'], 'fr-FR'],
    [['fr-CH'], 'fr-FR'],
    [['fr'], 'fr-FR'],
    [['en_us'], 'en-US'],
    [['de-DE'], 'de-DE'],
    [['de-AT'], 'de-DE'],
    [['de-CH'], 'de-DE'],
    [['de'], 'de-DE'],
    [['es-MX'], 'es-419'],
    [['es-ES'], 'es-419'],
    [['es'], 'es-419'],
    [['pt-BR'], 'pt-BR'],
    [['pt-PT'], 'pt-BR'],
    [['pt'], 'pt-BR'],
  ])('shows %j as %s', (browser, shown) => {
    expect(choose.choose(browser, undefined)).toBe(shown);
  });

  it('takes the first of the reader\'s languages it has', () => {
    expect(choose.choose(['ja-JP', 'fr-CA', 'en-US'], undefined)).toBe('fr-CA');
  });

  it('shows the site\'s default when it has none of them', () => {
    expect(choose.choose(['ja-JP'], undefined)).toBe('en-CA');
    expect(choose.choose(['ja-JP'], 'fr-FR')).toBe('fr-FR');
    expect(choose.choose([], 'en-US')).toBe('en-US');
  });

  it('treats a default that is not one of its languages as unset', () => {
    expect(choose.choose(['ja-JP'], 'ja-JP')).toBe('en-CA');
    expect(choose.choose(['ja-JP'], 'en-GB')).toBe('en-CA');
  });
});

describe('the space before ?, ! and ; in French', () => {
  it('is a narrow no-break space in French from France', () => {
    expect(frenchSpacing.space('Annuler cet événement ?', 'fr-FR'))
      .toBe(`Annuler cet événement${NARROW_NO_BREAK}?`);
    expect(frenchSpacing.space('Merci ! Voilà ; fini', 'fr-FR'))
      .toBe(`Merci${NARROW_NO_BREAK}! Voilà${NARROW_NO_BREAK}; fini`);
  });

  it('is taken out in Quebec French', () => {
    expect(frenchSpacing.space('Annuler cet événement ?', 'fr-CA')).toBe('Annuler cet événement?');
    expect(frenchSpacing.space(`Merci${NARROW_NO_BREAK}!`, 'fr-CA')).toBe('Merci!');
  });

  it('leaves English, and a colon, as they are', () => {
    expect(frenchSpacing.space('Really ?', 'en-CA')).toBe('Really ?');
    expect(frenchSpacing.space('Lieu : Paris', 'fr-CA')).toBe('Lieu : Paris');
  });

  it('is made in a list as well', () => {
    expect(frenchSpacing.space(['Vrai ?', { inner: 'Oui !' }], 'fr-CA')).toEqual(['Vrai?', { inner: 'Oui!' }]);
  });

  it('is made as a string is looked up', () => {
    const text = i18n.t('events:event.cancel.title', { lng: 'fr-FR' });
    expect(text).toContain(`${NARROW_NO_BREAK}?`);
    expect(i18n.t('events:event.cancel.title', { lng: 'fr-CA' })).not.toMatch(/\s\?/);
  });
});

describe('every language', () => {
  it('is given its strings', () => {
    expect(Object.keys(RESOURCES).sort()).toEqual([...choose.LANGUAGES].sort());
  });

  // A base falls behind when a string is added to the app and not to it:
  // its readers are then shown English. Or ahead, when a key is renamed in
  // one and not the other.
  it.each(choose.BASES.filter((base) => { return base !== choose.BASE; }))(
    '%s has every string the base has, and no other',
    (base) => {
      const theBase = new Set(keysOf(RESOURCES[choose.BASE]));
      const theirs = new Set(keysOf(RESOURCES[base]));
      expect({
        missing: [...theBase].filter((key) => { return !theirs.has(key); }),
        extra: [...theirs].filter((key) => { return !theBase.has(key); }),
      }).toEqual({ missing: [], extra: [] });
    },
  );
});

describe('the layers', () => {
  it.each([
    ['en-US', enUS, enCA],
    ['fr-CA', frCA, frFR],
  ])('%s has only keys its base has', (name, layer, base) => {
    const known = new Set(keysOf(base));
    expect(keysOf(layer).filter((key) => { return !known.has(key); })).toEqual([]);
  });

  it('reads a layer\'s own strings, and the rest from its base', () => {
    expect(i18n.t('events:event.state.cancelled', { lng: 'en-US' })).toBe('This event was canceled.');
    expect(i18n.t('events:event.state.cancelled', { lng: 'en-CA' })).toBe('This event was cancelled.');
    expect(i18n.t('events:event.cancel.keep', { lng: 'en-US' }))
      .toBe(i18n.t('events:event.cancel.keep', { lng: 'en-CA' }));
    expect(i18n.t('events:event.cancel.keep', { lng: 'fr-CA' }))
      .toBe(i18n.t('events:event.cancel.keep', { lng: 'fr-FR' }));
  });

  it('says email in French from France and courriel in Quebec French', () => {
    expect(i18n.t('people:settings.email', { lng: 'fr-FR' })).toBe('Email');
    expect(i18n.t('people:settings.email', { lng: 'fr-CA' })).toBe('Courriel');
    expect(i18n.t('invites:alerts.sent', { lng: 'fr-CA', email: 'ana@example.org' })).toContain('ana@example.org');
  });

  it('says hashtag in French from France and mot-clic in Quebec French', () => {
    expect(i18n.t('onboarding:interests.follow', { lng: 'fr-FR', count: 2 })).toBe('Suivre 2 hashtags');
    expect(i18n.t('onboarding:interests.follow', { lng: 'fr-CA', count: 2 })).toBe('Suivre 2 mots-clics');
  });
});
