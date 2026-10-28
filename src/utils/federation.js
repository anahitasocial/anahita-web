// People and posts from other servers: of the fediverse, and Bluesky.

// Whether a node came from another server. A person from one has a type of
// their own; a post from one is an ordinary note with the address it has
// where it was written.
const isRemote = (node) => {
  if (!node) {
    return false;
  }
  if (node.uri) {
    return true;
  }
  return typeof node.type === 'string' &&
    (node.type.includes('.activitypub-service.') || node.type.includes('.atproto-service.'));
};

// Whether a node came from a server of the fediverse, as against Bluesky.
// Hiding a reply from there hides it here only: the fediverse has no
// agreed way of asking other servers to hide one.
const fromFediverse = (node) => {
  if (!node) {
    return false;
  }
  if (typeof node.uri === 'string' && node.uri.startsWith('https://')) {
    return true;
  }
  return typeof node.type === 'string' && node.type.includes('.activitypub-service.');
};

// Where something from another server can be read where it was written,
// or '' when there is no such page. On the fediverse the address a thing
// has between servers is also its page. On Bluesky it is not: the address
// names an account and a record, and the page is on the site people read
// Bluesky on.
const BLUESKY = 'https://bsky.app';
const AT_URI = /^at:\/\/(did:[a-z]+:[a-zA-Z0-9._:%-]+)(?:\/app\.bsky\.feed\.post\/([A-Za-z0-9._:~-]+))?$/;

const pageOf = (node) => {
  const uri = node && typeof node.uri === 'string' ? node.uri : '';

  if (uri.startsWith('https://')) {
    return uri;
  }

  const at = AT_URI.exec(uri);
  if (!at) {
    return '';
  }
  return at[2] ? `${BLUESKY}/profile/${at[1]}/post/${at[2]}` : `${BLUESKY}/profile/${at[1]}`;
};

// The server a node came from: "mastodon.example". For a person it is in
// their handle; for a post it is said outright.
const domainOf = (node) => {
  if (!node) {
    return '';
  }
  if (node.originDomain) {
    return node.originDomain;
  }
  const alias = typeof node.alias === 'string' ? node.alias : '';
  const at = alias.lastIndexOf('@');
  return at > 0 ? alias.slice(at + 1) : '';
};

// What somebody is called across servers, as it is written: @alice@mastodon.example.
const handleOf = (node) => {
  return node && node.alias ? `@${node.alias}` : '';
};

// A handle here as it is written on the fediverse, whole: @garden@example.org.
// The domain is the web app's own, which is what handles here follow.
const siteHandle = (alias) => {
  if (!alias) {
    return '';
  }
  const domain = window.location.hostname.replace(/^www\./, '');
  return `@${alias}@${domain}`;
};

// The handle in a WebFinger answer's subject, acct:ana@example.org, as it
// is written: @ana@example.org. '' for anything else.
const handleOfSubject = (subject) => {
  const match = /^acct:([^@\s]+@[^@\s]+)$/.exec(subject || '');
  return match ? `@${match[1]}` : '';
};

// How somebody's handle is written under their name. Somebody here is
// @ana; somebody elsewhere is @alice@mastodon.example, whole, since the
// server is the half of it that says who they are. `slug` is what makes a
// username here safe to show.
const displayHandle = (node, slug) => {
  if (!node || !node.alias) {
    return '';
  }
  if (isRemote(node)) {
    return handleOf(node);
  }
  return `@${slug ? slug(node.alias.toLowerCase()) : node.alias.toLowerCase()}`;
};

// Whether what was typed is a handle on another server, or the address of
// a profile on one: what a lookup can be asked about. A plain word or a
// name without a server is not, and is left to the ordinary search.
//
// Which network it is on is told by how it is written. On the fediverse a
// handle has its server after a second @ (@alice@mastodon.example). On
// Bluesky a handle is a name of its own (alice.bsky.social), and an
// account also has a name that never changes (did:plc:…).
const HANDLE = /^@?[\w-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i;
const BLUESKY_HANDLE = /^@?(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
const BLUESKY_DID = /^did:(?:plc:[a-z2-7]{24}|web:[a-zA-Z0-9.%-]+)$/;

const ACTIVITYPUB = 'activitypub';
const ATPROTO = 'atproto';

// Which network a lookup is asked of, or '' when what was typed is not
// something to look up.
const lookupKind = (text) => {
  const query = typeof text === 'string' ? text.trim() : '';
  if (query === '' || query.length > 300) {
    return '';
  }
  if (HANDLE.test(query)) {
    return ACTIVITYPUB;
  }
  // An address on the site people read Bluesky on is somebody's profile
  // there, or nothing that can be looked up: that site is not a server of
  // the fediverse.
  if (query.startsWith(`${BLUESKY}/`)) {
    return /^https:\/\/bsky\.app\/profile\/[^\s/]+/.test(query) ? ATPROTO : '';
  }
  if (/^https:\/\/[^\s/]+\/\S+$/i.test(query)) {
    return ACTIVITYPUB;
  }
  if (BLUESKY_DID.test(query) || BLUESKY_HANDLE.test(query)) {
    return ATPROTO;
  }
  return '';
};

const isLookup = (text) => {
  return lookupKind(text) !== '';
};

// Whether what was typed is unmistakably somebody on another network, so
// that searching for it may ask their server at once rather than offer a
// button: `@alice@mastodon.social`, a Bluesky DID, a Bluesky handle written
// with its `@` or on bsky.social, or the address of a profile
// (`https://pixelfed.social/dansup`), which is what Pixelfed and others show
// people (the user, 2026-10-19). A bare name with dots in it (`seeds.org`)
// may be a word somebody is searching for, and keeps the button.
const isClearHandle = (text) => {
  const query = typeof text === 'string' ? text.trim() : '';
  const kind = lookupKind(query);
  if (kind === ACTIVITYPUB) {
    return HANDLE.test(query) || /^https:\/\//i.test(query);
  }
  if (kind === ATPROTO) {
    return BLUESKY_DID.test(query) || /^https:\/\//i.test(query) ||
      (BLUESKY_HANDLE.test(query) && (query.startsWith('@') || /\.bsky\.social$/i.test(query)));
  }
  return false;
};

// The reasons a lookup can fail that may be different a moment later, and
// so are offered Try again: the server did not answer, too many were asked,
// or something unknown. The rest are answers, and are only said.
const RETRYABLE = ['lookup_failed', 'too_many_lookups', 'failed', 'site_unreachable'];

const isRetryable = (reason) => {
  return RETRYABLE.includes(reason);
};

// Whether an error says the installation has no fediverse service at all,
// which is not a failure: there is simply nothing to show.
const isAbsent = (error) => {
  const status = error && error.response && error.response.status;

  return !status || status === 404 || status >= 501;
};

// The reason a request was refused, as the server names it.
const reasonOf = (error) => {
  return (error && error.response && error.response.data && error.response.data.error) || '';
};

export default {
  isRetryable,
  isRemote,
  fromFediverse,
  domainOf,
  handleOf,
  displayHandle,
  siteHandle,
  handleOfSubject,
  pageOf,
  lookupKind,
  isLookup,
  isClearHandle,
  ACTIVITYPUB,
  ATPROTO,
  isAbsent,
  reasonOf,
};
