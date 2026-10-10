import axios from 'axios';

// The people the viewer can offer: their own followers, found by name.
//
// It read `viewer` and `offset` from what it was given, and was given
// neither, so the first letter typed into the picker threw.
const browse = (params) => {
  const {
    viewer,
    start = 0,
    limit,
    q,
  } = params;
  return axios.get(`/socialgraph/${viewer.id}/followers/`, {
    params: {
      start,
      limit,
      q,
    },
  });
};

const add = (params) => {
  const { actor, follower } = params;
  return axios.post(`/socialgraph/${actor.id}/followers/${follower.id}`);
};

const deleteItem = (params) => {
  const { follower, actor } = params;
  return axios.delete(`/socialgraph/${actor.id}/followers/${follower.id}`);
};

export default {
  browse,
  add,
  deleteItem,
};
