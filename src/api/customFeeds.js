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

const cursors = {};

// A page of a feed. `start` is how many the list holds already: 0 begins
// again.
const browse = ({ feed, start = 0, limit = 20 }) => {
  const key = `feed-${feed.id}`;

  if (start === 0) {
    delete cursors[key];
  }

  return axios.get(`/feeds/${feed.id}/items`, {
    params: { cursor: cursors[key], limit },
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
  return axios.get(`/feeds/${feed.id}/items`, { params: { limit } });
};

export default {
  add,
  read,
  edit,
  remove,
  copy,
  mine,
  discover,
  pinned,
  setPins,
  setPinned,
  browse,
  peek,
  onChange,
};
