import axios from 'axios';

function browse(params) {
  const {
    filter,
    actor,
    start,
    limit,
    q,
    // 'asc' for whoever followed longest ago first. Latest first without.
    dir,
  } = params;

  return axios.get(`/socialgraph/${actor.id}/${filter}/`, {
    params: {
      start,
      limit,
      q,
      dir,
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

// Inviting the viewer's followers to follow a group, and what waits.
function invite({ actor, personIds }) {
  return axios.post(`/socialgraph/${actor.id}/invites`, { personIds });
}

function invites({ actor, start = 0, limit = 20 }) {
  return axios.get(`/socialgraph/${actor.id}/invites/`, {
    params: { start, limit },
  });
}

function withdrawInvite({ actor, person }) {
  return axios.delete(`/socialgraph/${actor.id}/invites/${person.id}`);
}

// The viewer answering their own invitation to an actor.
function acceptInvite({ actor }) {
  return axios.post(`/socialgraph/${actor.id}/invites/accept`);
}

function declineInvite({ actor }) {
  return axios.post(`/socialgraph/${actor.id}/invites/decline`);
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
  invite,
  invites,
  withdrawInvite,
  acceptInvite,
  declineInvite,
  block,
  unblock,
};
