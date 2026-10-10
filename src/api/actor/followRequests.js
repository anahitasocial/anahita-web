import axios from 'axios';

const browse = (actor) => {
  return axios.get(`/socialgraph/${actor.id}/follow-requests/`);
};

// Accepts a request to follow. Called `add` because the store treats the
// answer as one: a follower added.
//
// PATCH, which is what the server accepts with. This sent POST, which is how
// a request is MADE, so pressing Accept asked the server to file a request
// on the asker's behalf and nothing was ever accepted.
const add = (params) => {
  const { actor, followRequest } = params;
  return axios.patch(`/socialgraph/${actor.id}/follow-requests/${followRequest.id}`);
};

const deleteItem = (params) => {
  const { actor, followRequest } = params;
  return axios.delete(`/socialgraph/${actor.id}/follow-requests/${followRequest.id}`);
};

export default {
  browse,
  add,
  deleteItem,
};
