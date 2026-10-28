// The site's logo: the one its operator gives the server (SITE_LOGO_URL,
// published as NodeInfo's `logoUrl`), which is also the logo of its sign-in
// pages and emails, or else the active theme's, for light and dark. So a site
// changes its logo everywhere with one setting, and no rebuild.

// Only a full web address is taken: a relative path would be read against
// the web app's own address, not the server's.
const fromServer = (nodeInfo) => {
  const url = ((nodeInfo || {}).metadata || {}).logoUrl;
  return typeof url === 'string' && /^https?:\/\/\S+$/.test(url) ? url : '';
};

// themeLogo is the theme's `logo` export: { color, white }.
const siteLogo = (nodeInfo, themeLogo, prefersDarkMode = false) => {
  const url = fromServer(nodeInfo);
  if (url) {
    return url;
  }
  const { color, white } = themeLogo || {};
  return (prefersDarkMode ? white : color) || color || '';
};

export default siteLogo;
