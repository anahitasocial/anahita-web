// How somebody likes "Most relevant" ordered, kept in their browser.
//
// Two choices, each off as it comes:
//   - followedFirst: people and groups they follow, and what is on them,
//     before everything else;
//   - recentFirst: the newest first among results that match alike.
//
// Per person, under a key with their id, like recent searches, and read
// and written inside try/catch: where storage is refused, search orders as
// it comes.

const PREFIX = 'search.choices.';

const NONE = { followedFirst: false, recentFirst: false };

const browserStorage = () => {
  try {
    return window.localStorage;
  } catch (e) {
    return null;
  }
};

const read = (viewerId, storage = browserStorage()) => {
  if (!viewerId || !storage) {
    return NONE;
  }
  try {
    const kept = JSON.parse(storage.getItem(`${PREFIX}${viewerId}`)) || {};
    return {
      followedFirst: kept.followedFirst === true,
      recentFirst: kept.recentFirst === true,
    };
  } catch (e) {
    return NONE;
  }
};

const write = (viewerId, choices, storage = browserStorage()) => {
  const clean = {
    followedFirst: Boolean(choices.followedFirst),
    recentFirst: Boolean(choices.recentFirst),
  };
  if (viewerId && storage) {
    try {
      storage.setItem(`${PREFIX}${viewerId}`, JSON.stringify(clean));
    } catch (e) {
      // Not remembered; chosen for this visit only.
    }
  }
  return clean;
};

// What is sent with a search: only what is chosen.
const paramsOf = (choices) => {
  const params = {};
  if (choices.followedFirst) {
    params.followed_first = true;
  }
  if (choices.recentFirst) {
    params.recent_first = true;
  }
  return params;
};

export default {
  NONE,
  read,
  write,
  paramsOf,
};
