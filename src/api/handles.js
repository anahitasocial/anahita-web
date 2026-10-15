import axios from 'axios';

// Which profile an alias is, of any kind: { kind, id, alias }, where kind is
// "people", "groups" or "events". A profile's address is its alias,
// /@ana, whatever kind it is; this says which page to draw for it.
const read = (alias) => {
  return axios.get(`/actors/${alias}`);
};

export default {
  read,
};
