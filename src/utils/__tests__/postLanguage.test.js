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

  // Somebody who switched to French for a post is probably still writing
  // French, whatever their profile says.
  it('prefers the language last posted in to both', () => {
    postLanguage.remember(viewer, 'de');

    withBrowser(['en-US'], () => {
      expect(postLanguage.defaultFor({ ...viewer, language: 'fa' })).toBe('de');
    });
  });

  it('keeps one person\'s language from the next person on the same browser', () => {
    postLanguage.remember(viewer, 'de');

    withBrowser(['en-US'], () => {
      expect(postLanguage.defaultFor({ id: 8 })).toBe('en');
    });
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
    expect(() => {
      postLanguage.remember(viewer, 'fr');
    }).not.toThrow();
  });
});
