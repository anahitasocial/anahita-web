import axios from 'axios';

// Who reposted a post. The post is named in the address and nothing of it
// goes in the query: the whole post went there once, and a long one made
// an address the gateway refused, so the list never loaded.
const browse = ({ node, ...params }) => {
  return axios.get(`/reposts/${node.id}/`, { params });
};

const add = (node) => {
  const { id: parentId } = node;
  return axios.post(`/reposts/${parentId}/`);
};

const deleteItem = (node) => {
  const { id: parentId } = node;
  return axios.delete(`/reposts/${parentId}/`);
};

export default {
  browse,
  add,
  deleteItem,
};
