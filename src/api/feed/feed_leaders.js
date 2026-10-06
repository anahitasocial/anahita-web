import axios from 'axios';

function browse(params) {
  return axios.get('/feeds/leaders/', { params });
}

// The people and groups the viewer follows who have posted in the last so
// many hours, most recent first. Who posted and when: nothing about who has
// looked, which is kept on the device.
function active(hours) {
  return axios.get('/feeds/leaders/active', { params: { hours } });
}

export default {
  active,
  browse,
};
