import axios from 'axios';

const browse = (params) => {
  const { sort, keywordFilter, ...restParams } = params;
  const endpoints = {
    trending: 'hashtags/_browse/trending',
    popular: 'hashtags/_browse/ordered_by_degree',
  };

  const url = endpoints[sort] || 'hashtags/';
  return axios.get(url, {
    params: {
      q: keywordFilter,
      ...restParams,
    },
  });
};

const read = (id) => {
  return axios.get(`/hashtags/${id}`);
};

// Hashtags in use that begin with what was typed after a #, for somebody
// writing (roadmap row 78).
const suggest = (q, { limit = 8 } = {}) => {
  return axios.get('/hashtags/_suggest', { params: { q, limit } });
};

// Hashtags in use that are words of a text, leaving out those it has.
const suggestFor = ({ title = '', body = '', limit = 8 }) => {
  return axios.post('/hashtags/_suggest', { title, body, limit });
};

export default {
  browse,
  read,
  suggest,
  suggestFor,
};
