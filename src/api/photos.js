import axios from 'axios';
import utils from '../utils';

const { constructFormData } = utils.api;

// Stores one image for a post that has not been made yet, on the profile it
// will be posted to. Each image goes in a request of its own, so no request
// carries more than one however many the post has.
// One image, stored for a profile before the post is made. `onProgress`
// is told how far it has got, from 0 to 100.
const upload = (owner, file, onProgress = null) => {
  const data = new FormData();
  data.append('file', file);
  return axios.post(`/photos/${owner.id}/uploads`, data, onProgress ? {
    onUploadProgress: (event) => {
      if (event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  } : undefined);
};

// A new photo post. Made from uploads when it has them, sent as JSON so the
// list keeps its order and each image its description. Without them it is
// sent the way a photo always was, as a form carrying the one file.
const add = (node, owner) => {
  if (Array.isArray(node.uploads)) {
    const { file, ...post } = node;
    return axios.post(`/photos/${owner.id}/`, post);
  }
  return axios.post(`/photos/${owner.id}/`, constructFormData(node));
};

// The whole list of images a post is to have, in order. One left out is
// removed from the post.
const editFiles = (node, files) => {
  return axios.patch(`/photos/${node.id}/files`, { files });
};

export default {
  add,
  editFiles,
  upload,
};
