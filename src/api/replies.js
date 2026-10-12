import axios from 'axios';
import utils from '../utils';

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
//
// `card` says which link in it to show a card for (`linkPreviewUrl`), or,
// for an edit, that its card was taken off (`linkPreviewRemove`). What the
// card says is the server's.
const add = (parent, { body, language, card = {} }) => {
  return axios.post(`/notes/${parent.id}/replies`, { body, language, ...card });
};

const edit = (reply, { body, card = {} }) => {
  return axios.patch(`/notes/${reply.id}`, { body, ...card });
};

const remove = (reply) => {
  return axios.delete(`/notes/${reply.id}`);
};

// Hides a reply from its thread for everybody, or shows it again.
const setHidden = (reply, hidden) => {
  return axios.patch(`/notes/${reply.id}/hidden`, { hidden });
};

// Who may reply to a post: "anyone", "nobody", or groups joined by commas.
// Set on the post itself, so under its own kind's address.
const setAccess = (medium, replyAccess) => {
  const namespace = utils.node.getNamespace(medium);
  return axios.patch(`/${namespace}/${medium.id}/reply-access`, { replyAccess });
};

export default {
  add,
  edit,
  remove,
  setAccess,
  setHidden,
  thread,
};
