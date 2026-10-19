import axios from 'axios';

import utils from '../utils';

// A group's and an event's rules (roadmap row 102, part 5): at most ten,
// each a short title and a line more if it needs one. Read with the version
// they are at and the version the viewer last agreed to; set by its
// administrators, each change a new version; agreed to, each ticked.
const pathOf = (actor) => {
  return `/${utils.node.getNamespace(actor)}/${actor.id}/rules`;
};

const read = (actor) => {
  return axios.get(pathOf(actor));
};

// `items` is [{ title, body }], in order. An empty list takes them away.
const set = (actor, items) => {
  return axios.put(pathOf(actor), { items });
};

const agree = (actor, version) => {
  return axios.post(`${pathOf(actor)}/agree`, { version });
};

export default {
  read,
  set,
  agree,
};
