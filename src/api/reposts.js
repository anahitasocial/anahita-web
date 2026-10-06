import axios from 'axios';

// Whether what a person or a group reposts is also shown among the posts on
// its profile. Off until they say otherwise: reposts have a list of their
// own.
const setOnProfile = (namespace, actor, show) => {
  return axios.patch(`/${namespace}/${actor.id}/reposts-on-profile`, {
    showRepostsOnProfile: Boolean(show),
  });
};

export default {
  setOnProfile,
};
