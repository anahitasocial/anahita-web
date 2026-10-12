// People and posts from other servers of the fediverse.

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
  return typeof node.type === 'string' && node.type.includes('.activitypub-service.');
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
const HANDLE = /^@?[\w-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i;

const isLookup = (text) => {
  const query = typeof text === 'string' ? text.trim() : '';
  if (query.length > 300) {
    return false;
  }
  if (HANDLE.test(query)) {
    return true;
  }
  return /^https:\/\/[^\s/]+\/\S+$/i.test(query);
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
  isRemote,
  domainOf,
  handleOf,
  displayHandle,
  isLookup,
  isAbsent,
  reasonOf,
};
