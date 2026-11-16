import axios from 'axios';

// The servers a person blocked for themselves (roadmap row 152).
const browse = ({ person, start = 0, limit = 20 }) => {
  return axios.get(`/socialgraph/${person.id}/blocked-servers/`, { params: { start, limit } });
};

// A domain, a handle or an address on the server: the server takes it.
const add = (person, domain) => {
  return axios.post(`/socialgraph/${person.id}/blocked-servers`, { domain });
};

const deleteItem = (person, domain) => {
  return axios.delete(`/socialgraph/${person.id}/blocked-servers/${encodeURIComponent(domain)}`);
};

export default {
  browse,
  add,
  deleteItem,
};
