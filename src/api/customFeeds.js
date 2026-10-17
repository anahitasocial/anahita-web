import axios from 'axios';

// Custom feeds: feeds a person builds, names and keeps among the tabs of
// their home page.
//
// A feed is read a page at a time by what came before, with a cursor the
// server hands back. The store's lists are kept by how far down they are, so
// `items` remembers each list's cursor here and reports a page to the store
// in the terms it knows.

// Whoever shows the viewer's feeds (the menu, the tabs of the home page) asks
// to be told when one is made, changed, deleted or moved, and reads them
// again. `onChange` returns the way to stop being told.
const listeners = new Set();

const onChange = (listener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

const changed = (result) => {
  listeners.forEach((listener) => {
    listener();
  });

  return result;
};

// A feed is put on its maker's home page when it is made.
const add = (feed) => {
  return axios.post('/feeds/', feed).then(changed);
};

const read = (id) => {
  return axios.get(`/feeds/${id}`);
};

const edit = (feed) => {
  const { id, ...fields } = feed;
  return axios.patch(`/feeds/${id}`, fields).then(changed);
};

const remove = (feed) => {
  return axios.delete(`/feeds/${feed.id}`).then(changed);
};

// A feed of the viewer's own, showing what this one shows.
// `name` is what to call it, to tell it from the one it was copied from.
const copy = (feed, name) => {
  return axios.post(`/feeds/${feed.id}/copy`, { name }).then(changed);
};

// The feeds the viewer made.
const mine = () => {
  return axios.get('/feeds/mine');
};

// The feeds the viewer keeps on their home page, in order.
// Feeds people have shared, newest first, each as the viewer may see it.
const discover = ({ start = 0, limit = 20 } = {}) => {
  return axios.get('/feeds/discover', { params: { start, limit } });
};

const pinned = () => {
  return axios.get('/feeds/pinned');
};

// Replaces the feeds on the home page with these, in this order.
const setPins = (ids) => {
  return axios.put('/feeds/pins', { ids }).then(changed);
};

const setPinned = (feed, isPinned) => {
  const path = `/feeds/${feed.id}/pin`;
  return (isPinned ? axios.put(path) : axios.delete(path)).then(changed);
};

// Follows something that is not a profile, a hashtag or a place: a feed of
// that one thing, the viewer's own and seen by them alone, put on their
// home page. A feed of exactly this they already have is put there as it
// is, and no second one is made. Answers with the feed.
const follow = ({ name, icon, definition }, fingerprint) => {
  const wanted = fingerprint(definition);

  return mine().then((result) => {
    const have = (result.data.data || []).find((feed) => {
      return fingerprint(feed.definition) === wanted;
    });
    if (have) {
      return have;
    }
    return add({
      name,
      icon,
      access: 'myself',
      definition,
    }).then((added) => {
      return added.data;
    });
  }).then((feed) => {
    return setPinned(feed, true).then(() => {
      return feed;
    });
  });
};

const cursors = {};

// Where the reader is, for a feed of what is near them (its area is live):
// asked of the browser, a reading up to five minutes old will do, and sent
// with the page, kept nowhere. Nothing for any other feed, or when the
// browser does not say, which the server answers with location_needed.
const whereIAm = (feed) => {
  const filters = (feed.definition && feed.definition.filters) || {};
  if (!filters.near || !filters.near.live || !navigator.geolocation) {
    return Promise.resolve({});
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition((position) => {
      resolve({
        near_latitude: Math.round(position.coords.latitude * 1000) / 1000,
        near_longitude: Math.round(position.coords.longitude * 1000) / 1000,
      });
    }, () => {
      resolve({});
    }, { maximumAge: 5 * 60 * 1000, timeout: 15000 });
  });
};

// A page of a feed. `start` is how many the list holds already: 0 begins
// again.
const browse = ({ feed, start = 0, limit = 20 }) => {
  const key = `feed-${feed.id}`;

  if (start === 0) {
    delete cursors[key];
  }

  return whereIAm(feed).then((near) => {
    return axios.get(`/feeds/${feed.id}/items`, {
      params: { cursor: cursors[key], limit, ...near },
    });
  }).then((result) => {
    const { data } = result;
    const page = data.pagination || {};
    const count = (data.data || []).length;
    const hasMore = Boolean(page.hasMore);

    cursors[key] = page.nextCursor || '';
    data.pagination = {
      limit: page.limit || limit,
      offset: start,
      // No feed is counted. One past what is held says there is more.
      total: start + count + (hasMore ? 1 : 0),
    };

    return result;
  });
};

// The head of a feed, asked for again while it is open, to see what was
// posted since. It leaves alone the place the feed has been read to.
const peek = ({ feed, limit = 20 }) => {
  return whereIAm(feed).then((near) => {
    return axios.get(`/feeds/${feed.id}/items`, { params: { limit, ...near } });
  });
};

export default {
  add,
  read,
  edit,
  remove,
  copy,
  mine,
  discover,
  follow,
  pinned,
  setPins,
  setPinned,
  browse,
  peek,
  onChange,
};
