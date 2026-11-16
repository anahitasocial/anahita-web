import axios from 'axios';

// Who may see a profile's followers and whom it follows (roadmap row 151):
// an access level, or '' for whoever may see the profile.
const edit = (namespace, actor, graphAccess) => {
  return axios.patch(`/${namespace}/${actor.id}/graph-access`, {
    graphAccess: graphAccess || '',
  });
};

export default {
  edit,
};
