// Sharing a link outside the site: to a messaging app, an email, or another
// network.
//
// Nothing here talks to the server, and nothing is counted: no number of
// shares, and no record of who shared what. The links to other networks are
// plain addresses that open their own compose pages. No script of theirs is
// loaded.

const SERVER_KEY = 'share.mastodonServer';
const TEXT_LENGTH = 100;

// The address of a page of this site, in full, with nothing added to it.
const linkOf = (path, origin = window.location.origin) => {
  return `${origin}${path}`;
};

// The start of a text, on one line, for the message a link is sent with.
const excerpt = (text = '') => {
  const line = String(text).replace(/\s+/g, ' ').trim();

  return line.length > TEXT_LENGTH ? `${line.slice(0, TEXT_LENGTH - 1).trimEnd()}…` : line;
};

// What is sent with the link: its title, or the start of its text.
const messageOf = ({ title = '', text = '' }) => {
  return (title || '').trim() || excerpt(text);
};

// A Mastodon server as somebody types it, as its bare host name, or '' when
// it is not one: "https://Mastodon.social/" is "mastodon.social".
const serverOf = (value = '') => {
  const host = value.trim().toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '');

  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(host) ? host : '';
};

const emailURL = (what) => {
  const subject = encodeURIComponent(messageOf(what));
  const body = encodeURIComponent(what.url);

  return `mailto:?subject=${subject}&body=${body}`;
};

const withMessage = (what) => {
  const message = messageOf(what);

  return encodeURIComponent(message ? `${message} ${what.url}` : what.url);
};

const blueskyURL = (what) => {
  return `https://bsky.app/intent/compose?text=${withMessage(what)}`;
};

// '' until a server is known.
const mastodonURL = (what, server) => {
  const host = serverOf(server);

  return host ? `https://${host}/share?text=${withMessage(what)}` : '';
};

// Whether a link is worth sending beyond people who are here already: what
// it leads to is public, on a site visitors can read. Otherwise the link is
// offered to copy and nothing more, since whoever follows it from outside
// would be asked to sign in.
const isOpen = (access, readAccess = 'public') => {
  return access === 'public' && readAccess !== 'registered';
};

// The Mastodon server the person used last, kept in their browser.
const rememberedServer = () => {
  try {
    return serverOf(window.localStorage.getItem(SERVER_KEY) || '');
  } catch (e) {
    return '';
  }
};

const rememberServer = (server) => {
  try {
    window.localStorage.setItem(SERVER_KEY, serverOf(server));
  } catch (e) {
    // Not kept, and asked for again next time.
  }
};

// The one share dialog there is, and how anything on a page opens it: a
// button, an item in a menu that is about to close. Whoever draws the
// dialog listens.
let listener = null;

const open = (what) => {
  if (listener) {
    listener(what);
  }
};

const listen = (handler) => {
  listener = handler;

  return () => {
    if (listener === handler) {
      listener = null;
    }
  };
};

export default {
  linkOf,
  excerpt,
  messageOf,
  serverOf,
  emailURL,
  blueskyURL,
  mastodonURL,
  isOpen,
  rememberedServer,
  rememberServer,
  open,
  listen,
};
