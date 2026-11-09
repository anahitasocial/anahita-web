import axios from 'axios';
import downloads from '../utils/downloads';

// Whether whoever can see a photo, a video or a sound may download it.

// On one post.
const setAllowed = (node, allow) => {
  const namespace = downloads.isVideoService(node) ? 'videos' : 'photos';
  return axios.patch(`/${namespace}/${node.id}/download`, { allow: Boolean(allow) });
};

// What a person's or a group's new posts start with. `namespace` is
// 'people' or 'groups'.
const setDefault = (namespace, actor, allow) => {
  return axios.patch(`/${namespace}/${actor.id}/download-default`, { allow: Boolean(allow) });
};

export default {
  setAllowed,
  setDefault,
};
