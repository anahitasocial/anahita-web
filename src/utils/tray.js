// The row of faces on the home page: the people and groups the viewer
// follows who have posted lately.
//
// The server says who posted and when. Whether the viewer has looked is
// kept HERE, in the browser, and nowhere else: nothing about looking is
// sent to the server, so nobody, the poster included, can find out who
// looked at what. The price is that "seen" does not follow somebody from
// their phone to their laptop.
//
// Plain functions, with the storage passed in, so they can be tested.

const KEY = 'anahita.tray.seen';

// How far back the tray looks, in hours.
const HOURS = 24;

// Kept per person, so two people on one browser do not share it.
const keyFor = (viewer) => {
  return `${KEY}.${viewer && viewer.id ? viewer.id : 0}`;
};

const defaultStorage = () => {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch (error) {
    return null;
  }
};

// When the viewer last looked at each actor, by actor id, as milliseconds.
// Empty when there is nothing, or the browser will not say.
const readSeen = (viewer, storage = defaultStorage()) => {
  try {
    const raw = storage && storage.getItem(keyFor(viewer));
    const seen = raw ? JSON.parse(raw) : {};
    return seen && typeof seen === 'object' && !Array.isArray(seen) ? seen : {};
  } catch (error) {
    return {};
  }
};

const timeOf = (value) => {
  const time = value ? new Date(value).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
};

// Whether an actor has posted since the viewer last looked.
const isNew = (entry, seen) => {
  const actorId = entry && entry.actor && entry.actor.id;
  if (!actorId) {
    return false;
  }
  return timeOf(entry.latestPostAt) > (seen[actorId] || 0);
};

// Those with something new first, each group as the server ordered it: most
// recent first.
const order = (entries, seen) => {
  const fresh = entries.filter((entry) => {
    return isNew(entry, seen);
  });
  const looked = entries.filter((entry) => {
    return !isNew(entry, seen);
  });
  return [...fresh, ...looked];
};

// Remembers that the viewer has looked at an actor's posts up to `latest`.
// Entries older than the tray can show are dropped, so the record does not
// grow for ever. Returns what is now remembered.
const markSeen = (viewer, actorId, latest, storage = defaultStorage(), now = Date.now()) => {
  const horizon = now - (HOURS * 2 * 60 * 60 * 1000);
  const seen = {};

  Object.entries(readSeen(viewer, storage)).forEach(([id, time]) => {
    if (typeof time === 'number' && time >= horizon) {
      seen[id] = time;
    }
  });

  seen[actorId] = Math.max(seen[actorId] || 0, timeOf(latest));

  try {
    if (storage) {
      storage.setItem(keyFor(viewer), JSON.stringify(seen));
    }
  } catch (error) {
    // A browser that will not keep it shows the ring again next time.
  }

  return seen;
};

// The posts to step through for one actor, from a page of their profile's
// feed: their own posts inside the window, oldest first. Not what they
// reposted, and not the post pinned to their profile from long ago.
const postsInWindow = (items, now = Date.now()) => {
  const since = now - (HOURS * 60 * 60 * 1000);
  return items.filter((item) => {
    const isRepost = item.type && item.type.includes('repost');
    return !isRepost && !item.rootId && timeOf(item.createdAt) >= since;
  }).sort((a, b) => {
    return timeOf(a.createdAt) - timeOf(b.createdAt);
  });
};

export default {
  HOURS,
  isNew,
  markSeen,
  order,
  postsInWindow,
  readSeen,
};
