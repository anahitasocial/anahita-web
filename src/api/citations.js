import axios from 'axios';

// The posts that cite a post, of any kind, newest first, a page of them:
// the articles and topics that show it within their text.
const citedBy = (post, { start = 0, limit = 20 } = {}) => {
  return axios.get(`/notes/${post.id}/cited_by`, { params: { start, limit } });
};

export default {
  citedBy,
};
