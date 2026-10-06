import axios from 'axios';

// Saved posts: the viewer's own list of posts to find again. Private to
// them. Nobody else can see it, and nobody is told that a post was saved.

// What the viewer saved, most recently saved first.
const list = ({ start = 0, limit = 20 } = {}) => {
  return axios.get('/bookmarks/', { params: { start, limit } });
};

// Saves a post, of any kind, or takes it out of what was saved.
const set = (post, saved) => {
  const path = `/bookmarks/${post.id}`;
  return saved ? axios.put(path) : axios.delete(path);
};

export default {
  list,
  set,
};
