import axios from 'axios';
import downloads from '../utils/downloads';

// Whether whoever can see a photo or a video may download it.

// On one post.
const setAllowed = (node, allow) => {
  const namespace = downloads.isVideo(node) ? 'videos' : 'photos';
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
