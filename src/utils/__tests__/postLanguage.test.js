/* eslint-env jest */
import postLanguage from '../postLanguage';

const viewer = { id: 7 };

const withBrowser = (languages, run) => {
  const original = Object.getOwnPropertyDescriptor(window.navigator, 'languages');
  const originalOne = Object.getOwnPropertyDescriptor(window.navigator, 'language');
  Object.defineProperty(window.navigator, 'languages', { value: languages, configurable: true });
  Object.defineProperty(window.navigator, 'language', { value: languages[0] || '', configurable: true });

  try {
    run();
  } finally {
    if (original) {
      Object.defineProperty(window.navigator, 'languages', original);
    }
    if (originalOne) {
      Object.defineProperty(window.navigator, 'language', originalOne);
    }
  }
};

describe('post language', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts from the browser when nothing else is known', () => {
    withBrowser(['fr-CA', 'en'], () => {
      expect(postLanguage.defaultFor(viewer)).toBe('fr');
    });
  });

  it('prefers the language on the profile to the browser', () => {
    withBrowser(['en-US'], () => {
      expect(postLanguage.defaultFor({ ...viewer, language: 'fa' })).toBe('fa');
    });
  });

  // One post in another language does not make the next start in it: a
  // post sent once as Farsi made every post after it Farsi.
  it('does not follow the language of the last post, and clears what an older version kept', () => {
    window.localStorage.setItem('composer.language', JSON.stringify({ 7: 'fa' }));

    withBrowser(['en-US'], () => {
      expect(postLanguage.defaultFor(viewer)).toBe('en');
    });
    expect(window.localStorage.getItem('composer.language')).toBeNull();
  });

  it('always has an answer', () => {
    withBrowser([], () => {
      expect(postLanguage.defaultFor(viewer)).toBe('en');
    });
    // A browser set to a language the menu does not offer.
    withBrowser(['tlh'], () => {
      expect(postLanguage.defaultFor(viewer)).toBe('en');
    });
  });

  it('types right to left for the languages written that way', () => {
    expect(postLanguage.directionOf('fa')).toBe('rtl');
    expect(postLanguage.directionOf('ar-EG')).toBe('rtl');
    expect(postLanguage.directionOf('he')).toBe('rtl');
    expect(postLanguage.directionOf('en')).toBe('auto');
    expect(postLanguage.directionOf('')).toBe('auto');
    expect(postLanguage.directionOf(undefined)).toBe('auto');
  });

  it('offers languages, not regions', () => {
    expect(postLanguage.primaryOf('pt-BR')).toBe('pt');
    expect(postLanguage.primaryOf('FR_ca')).toBe('fr');
    expect(postLanguage.primaryOf(undefined)).toBe('');
  });

  it('lists a current value the menu does not otherwise offer', () => {
    expect(postLanguage.optionsWith('fr')).toEqual(postLanguage.CODES);
    expect(postLanguage.optionsWith('yue')[0]).toBe('yue');
    expect(postLanguage.optionsWith('und')).toEqual(postLanguage.CODES);
  });

  it('names a language in the language being read', () => {
    expect(postLanguage.nameOf('fr', 'en')).toBe('French');
    expect(postLanguage.nameOf('fr', 'fr')).toBe('français');
    expect(postLanguage.nameOf('und', 'en')).toBe('');
  });

  it('has no duplicate codes', () => {
    expect(new Set(postLanguage.CODES).size).toBe(postLanguage.CODES.length);
  });

  it('works when storage holds something else', () => {
    window.localStorage.setItem('composer.language', 'not json');
    withBrowser(['en'], () => {
      expect(postLanguage.defaultFor(viewer)).toBe('en');
    });
  });
});
