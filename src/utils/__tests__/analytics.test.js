/* eslint-env jest */
/* eslint-disable no-underscore-dangle */
import analytics from '../analytics';

const fakeWindow = () => {
  const scripts = [];
  return {
    scripts,
    document: {
      createElement: () => {
        const attributes = {};
        return {
          attributes,
          setAttribute: (name, value) => { attributes[name] = value; },
        };
      },
      head: { appendChild: (script) => { scripts.push(script); } },
    },
  };
};

describe('analytics', () => {
  let warn;

  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
  });

  it('loads nothing when it is not configured', () => {
    const win = fakeWindow();
    const pageview = analytics.start({}, win);

    pageview('/people/ana');

    expect(win.scripts).toHaveLength(0);
    expect(win._paq).toBeUndefined();
    expect(warn).not.toHaveBeenCalled();
  });

  it.each([
    ['an unknown provider', { REACT_APP_ANALYTICS: 'ga', REACT_APP_ANALYTICS_URL: 'https://s.example.org', REACT_APP_ANALYTICS_SITE_ID: 'x' }],
    ['no URL', { REACT_APP_ANALYTICS: 'plausible', REACT_APP_ANALYTICS_SITE_ID: 'example.org' }],
    ['a URL with no scheme', { REACT_APP_ANALYTICS: 'plausible', REACT_APP_ANALYTICS_URL: 'stats.example.org', REACT_APP_ANALYTICS_SITE_ID: 'example.org' }],
    ['no site id', { REACT_APP_ANALYTICS: 'matomo', REACT_APP_ANALYTICS_URL: 'https://stats.example.org' }],
  ])('stays off, and says so, with %s', (name, env) => {
    const win = fakeWindow();
    analytics.start(env, win);

    expect(win.scripts).toHaveLength(0);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('loads the Plausible script for the configured domain', () => {
    const win = fakeWindow();
    analytics.start({
      REACT_APP_ANALYTICS: 'Plausible',
      REACT_APP_ANALYTICS_URL: 'https://stats.example.org/',
      REACT_APP_ANALYTICS_SITE_ID: 'example.org',
    }, win);

    expect(win.scripts).toHaveLength(1);
    expect(win.scripts[0].src).toBe('https://stats.example.org/js/script.js');
    expect(win.scripts[0].attributes['data-domain']).toBe('example.org');
  });

  it('loads the Umami script for the configured website', () => {
    const win = fakeWindow();
    analytics.start({
      REACT_APP_ANALYTICS: 'umami',
      REACT_APP_ANALYTICS_URL: 'https://stats.example.org',
      REACT_APP_ANALYTICS_SITE_ID: 'b59e9c65',
    }, win);

    expect(win.scripts[0].src).toBe('https://stats.example.org/script.js');
    expect(win.scripts[0].attributes['data-website-id']).toBe('b59e9c65');
  });

  it('sets Matomo up and reports each page view', () => {
    const win = fakeWindow();
    const pageview = analytics.start({
      REACT_APP_ANALYTICS: 'matomo',
      REACT_APP_ANALYTICS_URL: 'https://stats.example.org',
      REACT_APP_ANALYTICS_SITE_ID: '3',
    }, win);

    expect(win.scripts[0].src).toBe('https://stats.example.org/matomo.js');
    expect(win._paq).toEqual(expect.arrayContaining([
      ['setTrackerUrl', 'https://stats.example.org/matomo.php'],
      ['setSiteId', '3'],
    ]));

    pageview('/notes/12-hello');

    expect(win._paq.slice(-2)).toEqual([
      ['setCustomUrl', '/notes/12-hello'],
      ['trackPageView'],
    ]);
  });
});
