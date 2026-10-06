import axios from 'axios';
import utils from '../utils';

// Quote posts: a note that carries another post under its own words.
//
// A quote is a note, made where notes are made, on the profile of whoever
// writes it. Sent as JSON so the id of the quoted post goes as a number.
const add = (viewer, {
  body,
  quoteId,
  access,
  language,
}) => {
  return axios.post(`/notes/${viewer.id}/`, {
    body,
    quoteId,
    access,
    language,
    composed: true,
  });
};

// Takes the quoted post out of a note that quotes it. For the author of the
// quoted post. It cannot be undone.
const detach = (note) => {
  return axios.delete(`/notes/${note.id}/quote`);
};

// Who may quote one post: "anyone", "followers" or "nobody".
const setPolicy = (medium, quotePolicy) => {
  const namespace = utils.node.getNamespace(medium);
  return axios.patch(`/${namespace}/${medium.id}/quote-policy`, { quotePolicy });
};

// Who may quote a person's posts, for the posts that do not say.
const setPersonPolicy = (person, quotePolicy) => {
  return axios.patch(`/people/${person.id}/quote-policy`, { quotePolicy });
};

// The notes that quote a post, newest first, as the viewer may see them.
const list = (post) => {
  return axios.get(`/notes/${post.id}/quotes`);
};

export default {
  add,
  detach,
  list,
  setPersonPolicy,
  setPolicy,
};
