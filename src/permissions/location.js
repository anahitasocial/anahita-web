import meetsRoleLevel from './roleLevel';

// Whether the viewer may add a location: the installation's LOCATIONS_FROM,
// published in NodeInfo as locationsFrom, administrators unless it says
// otherwise. location-service enforces the same. Absent, as before NodeInfo
// answers, it ranks above every role and nobody is offered Add.
//
// Tying a post to a location that exists is not this: that is for whoever
// may edit the post.
const canAdd = (viewer, { locationsFrom = '' } = {}) => {
  return meetsRoleLevel(viewer, locationsFrom);
};

export default {
  canAdd,
};
