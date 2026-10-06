import axios from 'axios';

// Whether what a person or a group reposts is shown among the posts on its
// profile. The server keeps the opposite, "hide", so that a profile that has
// never been asked shows them.
const setOnProfile = (namespace, actor, show) => {
  return axios.patch(`/${namespace}/${actor.id}/reposts-on-profile`, {
    hideRepostsOnProfile: !show,
  });
};

export default {
  setOnProfile,
};
