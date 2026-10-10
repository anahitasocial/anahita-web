import axios from 'axios';

// Removing a follower from an actor, for whoever looks after it.
//
// The file is named for what it used to hold as well: listing people to add
// and adding them. That went with invitations. Nobody is added to a group
// from the web app; they are invited (api/socialgraph.js) and choose.
const deleteItem = (params) => {
  const { follower, actor } = params;
  return axios.delete(`/socialgraph/${actor.id}/followers/${follower.id}`);
};

export default {
  deleteItem,
};
