import axios from 'axios';
import utils from '../utils';

// Replies. A reply answers a post or another reply, and can itself be any
// kind of post: a note, a photo post (a reply with pictures), or a video
// post (a reply with a GIF or a video, sent as a video is: see
// media/Composer/Video/useVideoUpload, with a `parentId`). Its words are
// changed at /notes/:id whatever its kind, and its thread is read there; it
// is removed under its own kind's address, which takes its files with it.

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
const add = (parent, { content, language, card = {} }) => {
  return axios.post(`/notes/${parent.id}/replies`, { content, language, ...card });
};

// Answers a post or a reply with pictures, uploaded first for the person
// replying (api/photos#upload with their own profile): `uploads` as
// utils/photoFiles#toRequest makes them.
const addWithPictures = (parent, { content, language, uploads }) => {
  return axios.post(`/photos/${parent.id}/replies`, { content, language, uploads });
};

const edit = (reply, { content, card = {} }) => {
  return axios.patch(`/notes/${reply.id}`, { content, ...card });
};

const remove = (reply) => {
  const namespace = utils.node.getNamespace(reply) || 'notes';
  return axios.delete(`/${namespace}/${reply.id}`);
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
  addWithPictures,
  edit,
  remove,
  setAccess,
  setHidden,
  thread,
};
