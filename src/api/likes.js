import axios from 'axios';

// Likes on a post or a reply. A reply is a note, so both are liked by id.
const browse = (params) => {
  return axios.get(`/likes/${params.node.id}/`);
};

const add = (node) => {
  return axios.post(`/likes/${node.id}/`);
};

const deleteItem = (node) => {
  return axios.delete(`/likes/${node.id}/`);
};

export default {
  browse,
  add,
  deleteItem,
};
