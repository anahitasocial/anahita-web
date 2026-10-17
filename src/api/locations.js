import axios from 'axios';
import utils from '../utils';

const { constructFormData } = utils.api;

const browse = (params) => {
  const { sort, keywordFilter, ...restParams } = params;
  const endpoints = {
    trending: 'locations/_browse/trending',
    popular: 'locations/_browse/ordered_by_degree',
  };

  const url = endpoints[sort] || 'locations/';
  return axios.get(url, {
    params: {
      q: keywordFilter,
      ...restParams,
    },
  });
};

const read = (id) => {
  return axios.get(`/locations/${id}`);
};

const edit = (node) => {
  return axios.patch(`/locations/${node.id}`, constructFormData(node));
};

const add = (node) => {
  return axios.post('/locations/', constructFormData(node));
};

const deleteItem = (id) => {
  return axios.delete(`/locations/${id}`);
};

// The lists of the Locations page (the user, 2026-10-17): what is trending,
// with how many people (`people`) and over what span of time (`window`);
// the nearest to a point first; or all of them, A to Z, perhaps searched.
const trending = ({ limit = 20 } = {}) => {
  return axios.get('/locations/_browse/trending', { params: { limit } });
};

const nearby = ({
  latitude,
  longitude,
  start = 0,
  limit = 20,
}) => {
  return axios.get('/locations/', {
    params: {
      nearby_latitude: latitude,
      nearby_longitude: longitude,
      start,
      limit,
    },
  });
};

const all = ({ q = '', start = 0, limit = 20 } = {}) => {
  return axios.get('/locations/', {
    params: {
      q: q || undefined,
      sort: 'name',
      start,
      limit,
    },
  });
};

export default {
  browse,
  read,
  trending,
  nearby,
  all,
  edit,
  add,
  deleteItem,
};
