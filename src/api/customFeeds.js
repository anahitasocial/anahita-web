import axios from 'axios';

// Custom feeds: feeds a person builds, names and keeps among the tabs of
// their home page.
//
// A feed is read a page at a time by what came before, with a cursor the
// server hands back. The store's lists are kept by how far down they are, so
// `items` remembers each list's cursor here and reports a page to the store
// in the terms it knows.

const add = (feed) => {
  return axios.post('/feeds/', feed);
};

const read = (id) => {
  return axios.get(`/feeds/${id}`);
};

const edit = (feed) => {
  const { id, ...fields } = feed;
  return axios.patch(`/feeds/${id}`, fields);
};

const remove = (feed) => {
  return axios.delete(`/feeds/${feed.id}`);
};

// A feed of the viewer's own, showing what this one shows.
const copy = (feed) => {
  return axios.post(`/feeds/${feed.id}/copy`);
};

// The feeds the viewer made.
const mine = () => {
  return axios.get('/feeds/mine');
};

// The feeds the viewer keeps on their home page, in order.
const pinned = () => {
  return axios.get('/feeds/pinned');
};

// Replaces the feeds on the home page with these, in this order.
const setPins = (ids) => {
  return axios.put('/feeds/pins', { ids });
};

const setPinned = (feed, isPinned) => {
  const path = `/feeds/${feed.id}/pin`;
  return isPinned ? axios.put(path) : axios.delete(path);
};

const cursors = {};

// A page of a feed, or of one not saved yet (`definition`), which has only
// its first. `start` is how many the list holds already: 0 begins again.
const browse = ({
  feed = null,
  definition = null,
  start = 0,
  limit = 20,
}) => {
  const key = feed ? `feed-${feed.id}` : 'preview';

  if (start === 0) {
    delete cursors[key];
  }

  const request = feed ?
    axios.get(`/feeds/${feed.id}/items`, { params: { cursor: cursors[key], limit } }) :
    axios.post('/feeds/preview', { definition });

  return request.then((result) => {
    const { data } = result;
    const page = data.pagination || {};
    const count = (data.data || []).length;
    // Only a saved feed has a second page.
    const hasMore = Boolean(feed) && Boolean(page.hasMore);

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

export default {
  add,
  read,
  edit,
  remove,
  copy,
  mine,
  pinned,
  setPins,
  setPinned,
  browse,
};
