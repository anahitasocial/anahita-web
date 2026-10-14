// What somebody searched for lately, kept in their browser.
//
// The top bar's search box offers them again. They are kept here and
// nowhere else: nothing about what somebody looked for is sent to the
// server or stored there, for the same reason the installation keeps no
// record of what people view. The cost is that they do not follow
// somebody to another device.
//
// Per person, under a key with their id, so that two people sharing a
// computer do not see each other's; and cleared when they sign out.
// Storage may be refused (a private window, a full disk): then nothing is
// remembered and searching works as it did.

const PREFIX = 'search.recent.';

// How many are kept. An eleventh pushes the oldest out.
const MAX = 10;

// The server takes a term of 2 to 100 characters.
const SHORTEST = 2;
const LONGEST = 100;

const browserStorage = () => {
  try {
    return window.localStorage;
  } catch (e) {
    return null;
  }
};

const keyOf = (viewerId) => {
  return `${PREFIX}${viewerId}`;
};

// Two searches are the same when they differ only in case or in space at
// the ends.
const sameTerm = (a, b) => {
  return `${a}`.trim().toLowerCase() === `${b}`.trim().toLowerCase();
};

const isRemembered = (term) => {
  const trimmed = typeof term === 'string' ? term.trim() : '';
  return trimmed.length >= SHORTEST && trimmed.length <= LONGEST;
};

// The searches, most recent first: [{ term, scope }].
const list = (viewerId, storage = browserStorage()) => {
  if (!viewerId || !storage) {
    return [];
  }

  try {
    const kept = JSON.parse(storage.getItem(keyOf(viewerId)));
    if (!Array.isArray(kept)) {
      return [];
    }
    return kept.filter((each) => {
      return each && isRemembered(each.term);
    }).slice(0, MAX);
  } catch (e) {
    return [];
  }
};

const write = (viewerId, searches, storage) => {
  try {
    if (searches.length === 0) {
      storage.removeItem(keyOf(viewerId));
    } else {
      storage.setItem(keyOf(viewerId), JSON.stringify(searches));
    }
  } catch (e) {
    // Not remembered. Searching is not affected.
  }
};

// Remembers a search that was run, with the tab it was run under. The
// same search again moves to the top, kept as it was last typed.
const add = (viewerId, term, scope = '', storage = browserStorage()) => {
  if (!viewerId || !storage || !isRemembered(term)) {
    return list(viewerId, storage);
  }

  const searches = [
    { term: term.trim(), scope: scope || '' },
    ...list(viewerId, storage).filter((each) => {
      return !sameTerm(each.term, term);
    }),
  ].slice(0, MAX);

  write(viewerId, searches, storage);
  return searches;
};

const remove = (viewerId, term, storage = browserStorage()) => {
  if (!viewerId || !storage) {
    return [];
  }

  const searches = list(viewerId, storage).filter((each) => {
    return !sameTerm(each.term, term);
  });

  write(viewerId, searches, storage);
  return searches;
};

const clear = (viewerId, storage = browserStorage()) => {
  if (viewerId && storage) {
    write(viewerId, [], storage);
  }
  return [];
};

export default {
  MAX,
  list,
  add,
  remove,
  clear,
  sameTerm,
};
