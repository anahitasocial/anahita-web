import axios from 'axios';

// Bringing one's lists in from a file (roadmap row 124), through the
// installation's import-export service: another Anahita's download, or a
// CSV of Mastodon's or Misskey's.

// The viewer's latest imports, newest first.
const browse = () => {
  return axios.get('/imports');
};

// One, with how far it has got.
const read = (id) => {
  return axios.get(`/imports/${id}`);
};

// Reads a file and keeps what is in it, waiting to be started. `kind` says
// what a CSV with no header is: follow, block, mute or save.
const add = (file, kind = '') => {
  const form = new FormData();
  form.append('file', file);
  if (kind) {
    form.append('kind', kind);
  }
  return axios.post('/imports', form);
};

// Sets it going with the kinds chosen.
const start = (id, kinds) => {
  return axios.post(`/imports/${id}/start`, { kinds });
};

// What could not be done, as a CSV, to save.
const failed = (id) => {
  return axios.get(`/imports/${id}/failed`, { responseType: 'blob' });
};

// Gives it up: what it has not done is not done.
const deleteItem = (id) => {
  return axios.delete(`/imports/${id}`);
};

export default {
  browse,
  read,
  add,
  start,
  failed,
  deleteItem,
};
