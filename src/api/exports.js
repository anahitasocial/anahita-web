import axios from 'axios';

// A person's copy of their own data, from the installation's export
// service. The service is optional: where there is none, asking fails and
// the settings card says the download is not available.

// The viewer's exports, the latest first, with when they may next ask.
const browse = () => {
  return axios.get('/exports');
};

// One, with the address its archive is fetched from while it is ready.
// That address is good for a few minutes and made afresh each time.
const read = (id) => {
  return axios.get(`/exports/${id}`);
};

// Asks for one. Refused with step_up_required until the viewer has just
// proved who they are.
const add = () => {
  return axios.post('/exports');
};

// Gives one up while it is being made, or deletes its archive.
const remove = (id) => {
  return axios.delete(`/exports/${id}`);
};

export default {
  browse,
  read,
  add,
  remove,
};
