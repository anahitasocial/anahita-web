import axios from 'axios';

function browse(params) {
  const {
    filter,
    actor,
    start,
    limit,
    q,
  } = params;

  return axios.get(`/socialgraph/${actor.id}/${filter}/`, {
    params: {
      start,
      limit,
      q,
    },
  });
}

function follow({ actor, viewer }) {
  return axios.post(`/socialgraph/${actor.id}/followers/${viewer.id}`);
}

function unfollow({ actor, viewer }) {
  return axios.delete(`/socialgraph/${actor.id}/followers/${viewer.id}`);
}

// Asking to follow a profile the viewer may not see, and taking it back.
function requestFollow({ actor, viewer }) {
  return axios.post(`/socialgraph/${actor.id}/follow-requests/${viewer.id}`);
}

function withdrawFollowRequest({ actor, viewer }) {
  return axios.delete(`/socialgraph/${actor.id}/follow-requests/${viewer.id}`);
}

function block({ actor, viewer }) {
  return axios.post(`/socialgraph/${actor.id}/blocks/${viewer.id}`);
}

function unblock({ actor, viewer }) {
  return axios.delete(`socialgraph/${actor.id}/blocks/${viewer.id}`);
}

export default {
  browse,
  follow,
  unfollow,
  requestFollow,
  withdrawFollowRequest,
  block,
  unblock,
};
