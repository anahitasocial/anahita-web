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

// The lists of the Hashtags page (the user, 2026-10-17). Each answers a
// page, as every list does; trending says over what span of time
// (`window`) and how many people posted with each (`people`); the others
// how many posts anybody may see carry each (`uses`).
const trending = ({ limit = 20 } = {}) => {
  return axios.get('/hashtags/_browse/trending', { params: { limit } });
};

const following = ({ q = '', start = 0, limit = 20 } = {}) => {
  return axios.get('/hashtags/_browse/following', { params: { q, start, limit } });
};

const all = ({
  q = '',
  sort = 'name',
  start = 0,
  limit = 20,
} = {}) => {
  return axios.get('/hashtags/_browse/all', {
    params: {
      q,
      sort,
      start,
      limit,
    },
  });
};

export default {
  browse,
  read,
  trending,
  following,
  all,
  suggest,
  suggestFor,
};
