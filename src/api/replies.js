import axios from 'axios';

// Replies. A reply is a note that answers a post or another reply, so it is
// read, changed and removed at /notes/:id like any note. The post answered
// can be of any kind, a photo included: the addresses are under /notes/
// because of what a reply is, not what it answers.

// Everything said under a post, oldest first, with whether the viewer may
// add to it.
const thread = (root) => {
  return axios.get(`/notes/${root.id}/thread`);
};

// Answers a post or a reply.
const add = (parent, { body, language }) => {
  return axios.post(`/notes/${parent.id}/replies`, { body, language });
};

const edit = (reply, { body }) => {
  return axios.patch(`/notes/${reply.id}`, { body });
};

const remove = (reply) => {
  return axios.delete(`/notes/${reply.id}`);
};

// Hides a reply from its thread for everybody, or shows it again.
const setHidden = (reply, hidden) => {
  return axios.patch(`/notes/${reply.id}/hidden`, { hidden });
};

export default {
  add,
  edit,
  remove,
  setHidden,
  thread,
};
