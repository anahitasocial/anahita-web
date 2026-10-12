import axios from 'axios';

// Video posts. A video is too big to be sent to the API: the file goes
// straight to storage, in parts, at addresses asked for here, and the post
// is made by the server once the video has been prepared. See the
// services' docs/videos.md.

// A client for storage: no cookies and none of the API's own handling of
// what is sent and received, which a signed address would refuse.
const storage = axios.create({ withCredentials: false });

// Begins an upload on a profile. `post` is what the post will say (name,
// body, access, language, replyAccess, quotePolicy); the file is only
// described.
const start = (owner, post, file) => {
  return axios.post(`/videos/${owner.id}/uploads`, {
    ...post,
    size: file.size,
    contentType: file.type,
  });
};

// The addresses some of its parts are sent to.
const parts = (upload, numbers) => {
  return axios.post(`/videos/uploads/${upload.id}/parts`, { numbers });
};

// Sends one part to its address. `onProgress` is told how many of its
// bytes have gone.
const sendPart = (url, blob, { onProgress, signal } = {}) => {
  return storage.put(url, blob, {
    signal,
    // Bytes, and nothing said of what they are: the server decides that.
    headers: { 'Content-Type': 'application/octet-stream' },
    onUploadProgress: (event) => {
      if (onProgress) {
        onProgress(event.loaded || 0);
      }
    },
  });
};

// Everything sent: the server makes one file of it and prepares the video.
const complete = (upload) => {
  return axios.post(`/videos/uploads/${upload.id}/complete`);
};

// How an upload is getting on.
const read = (id) => {
  return axios.get(`/videos/uploads/${id}`);
};

// What the viewer has in hand: being sent, being prepared, or failed in
// the last day.
const browse = () => {
  return axios.get('/videos/uploads');
};

// Gives an upload up, or puts a failed one out of sight.
const cancel = (upload) => {
  return axios.delete(`/videos/uploads/${upload.id}`);
};

export default {
  start,
  parts,
  sendPart,
  complete,
  read,
  browse,
  cancel,
};
