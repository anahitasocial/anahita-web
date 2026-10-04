// Page-view analytics, off unless an installation turns it on.
//
// The app used to call Google Analytics through `react-ga`, a library for
// Universal Analytics, which Google shut down in 2023, so it reported
// nothing. It is replaced by a choice of analytics an installation can host
// itself. With REACT_APP_ANALYTICS unset, no script is loaded and nothing
// leaves the browser.
//
//   REACT_APP_ANALYTICS          plausible | umami | matomo
//   REACT_APP_ANALYTICS_URL      where that service is, e.g. https://stats.example.org
//   REACT_APP_ANALYTICS_SITE_ID  the site as that service knows it: the domain
//                                for Plausible, the website id for Umami, the
//                                numeric site id for Matomo

const PROVIDERS = ['plausible', 'umami', 'matomo'];

// readConfig returns the analytics settings, or null when analytics is off
// or half-configured. Half-configured is treated as off, and said so once in
// the console: a script tag pointing at "undefined" is worse than none.
const readConfig = (env = process.env) => {
  const provider = (env.REACT_APP_ANALYTICS || '').trim().toLowerCase();
  if (!provider) {
    return null;
  }

  const url = (env.REACT_APP_ANALYTICS_URL || '').trim().replace(/\/+$/, '');
  const siteId = (env.REACT_APP_ANALYTICS_SITE_ID || '').trim();

  if (!PROVIDERS.includes(provider) || !/^https?:\/\//.test(url) || !siteId) {
    // eslint-disable-next-line no-console
    console.warn(
      `Analytics is off: REACT_APP_ANALYTICS must be one of ${PROVIDERS.join(', ')}, ` +
      'with REACT_APP_ANALYTICS_URL and REACT_APP_ANALYTICS_SITE_ID set.',
    );
    return null;
  }

  return { provider, url, siteId };
};

const addScript = (doc, src, attributes = {}) => {
  const script = doc.createElement('script');
  script.async = true;
  script.defer = true;
  script.src = src;
  Object.keys(attributes).forEach((name) => {
    script.setAttribute(name, attributes[name]);
  });
  doc.head.appendChild(script);
  return script;
};

// start loads the configured service's script. It returns a function that
// records a page view, for the router to call on each navigation.
//
// Plausible and Umami watch the browser's history themselves, so a single
// script covers every navigation and the returned function does nothing.
// Matomo has to be told.
const start = (env = process.env, win = window) => {
  const config = readConfig(env);
  if (!config) {
    return () => {};
  }

  const { provider, url, siteId } = config;
  const doc = win.document;

  if (provider === 'plausible') {
    addScript(doc, `${url}/js/script.js`, { 'data-domain': siteId });
    return () => {};
  }

  if (provider === 'umami') {
    addScript(doc, `${url}/script.js`, { 'data-website-id': siteId });
    return () => {};
  }

  // Matomo. Its queue has to exist before the script loads.
  /* eslint-disable no-underscore-dangle, no-param-reassign */
  win._paq = win._paq || [];
  win._paq.push(['setTrackerUrl', `${url}/matomo.php`]);
  win._paq.push(['setSiteId', siteId]);
  win._paq.push(['enableLinkTracking']);
  /* eslint-enable no-underscore-dangle, no-param-reassign */
  addScript(doc, `${url}/matomo.js`);

  return (path) => {
    // eslint-disable-next-line no-underscore-dangle
    win._paq.push(['setCustomUrl', path]);
    // eslint-disable-next-line no-underscore-dangle
    win._paq.push(['trackPageView']);
  };
};

export default {
  PROVIDERS,
  readConfig,
  start,
};
