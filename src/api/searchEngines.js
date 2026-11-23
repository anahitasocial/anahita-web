import axios from 'axios';

// Whether search engines may index a profile and its posts
// (anahita-services roadmap row 174). Off for a person who signs up, on for
// everybody before and for a new group, event or channel.
const edit = (namespace, actor, searchEngines) => {
  return axios.patch(`/${namespace}/${actor.id}/search-engines`, {
    searchEngines: Boolean(searchEngines),
  });
};

export default {
  edit,
};
