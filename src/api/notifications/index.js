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
  deleteItem,
  count,
};
