import axios from 'axios';

function browse(params) {
  return axios.get('/notifications/?', {
    params,
  });
}

function edit(item) {
  return axios.patch(`/notifications/${item.id}`);
}

// Mark all read.
function editAll() {
  return axios.patch('/notifications/read-all');
}

// What the viewer is told about, and turning a kind of thing on or off.
function settings() {
  return axios.get('/notifications/settings');
}

function editSettings(topic, on) {
  return axios.patch('/notifications/settings', { topic, on });
}

function deleteItem(item) {
  return axios.delete(`/notifications/${item.id}`);
}

function count() {
  return axios.get('/notifications/unread-count');
}

export default {
  browse,
  edit,
  editAll,
  settings,
  editSettings,
  deleteItem,
  count,
};
