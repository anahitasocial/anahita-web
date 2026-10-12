// Downloading what a post holds: a photo, a video.
//
// Whoever posted it says whether it may be downloaded. The server answers
// for each post and each viewer (`authorized.download`), and this only
// draws what it said.

const PHOTO = 'node.medium.photo-service.photo.v1';
const VIDEO = 'node.medium.video-service.video.v1';

const isPhoto = (node) => {
  return Boolean(node) && node.type === PHOTO;
};

const isVideo = (node) => {
  return Boolean(node) && node.type === VIDEO;
};

// Whether a post is of a kind with a file to download.
const holdsAFile = (node) => {
  return isPhoto(node) || isVideo(node);
};

// Whether a composer makes posts that hold one.
const isForNamespace = (namespace) => {
  return namespace === 'photos' || namespace === 'videos';
};

// Whether the viewer may download from this post.
const canDownload = (node) => {
  return holdsAFile(node) && Boolean(node.authorized && node.authorized.download);
};

// What there is to download from a post: each image of a photo post, by
// its place, or a video's one file, at its largest size.
const partsOf = (node) => {
  if (isVideo(node)) {
    return [{ key: 'video', query: '' }];
  }
  if (!isPhoto(node)) {
    return [];
  }
  const files = Array.isArray(node.files) ? node.files : [];
  if (files.length <= 1) {
    return [{ key: 'photo-0', query: '' }];
  }
  return files.map((file, index) => {
    const position = Number.isInteger(file.position) ? file.position : index;
    return { key: `photo-${position}`, query: `?file=${position}`, number: index + 1 };
  });
};

// The address a part is downloaded from: the API's, which asks who is
// asking and sends the browser on to the file, to be saved.
const urlOf = (node, part, base = process.env.REACT_APP_API_BASE_URL || '') => {
  const namespace = isVideo(node) ? 'videos' : 'photos';
  return `${String(base).replace(/\/+$/, '')}/${namespace}/${node.id}/download${(part && part.query) || ''}`;
};

// Whether a post says if it may be downloaded: only one that holds a file,
// and only where the server sent the switch.
const hasSwitch = (node) => {
  return holdsAFile(node) && typeof node.allowDownload === 'boolean';
};

// Starts a download: the browser is sent to the address, which answers
// with a file to save and so leaves the page where it is.
const start = (url) => {
  window.location.assign(url);
};

export default {
  isPhoto,
  isVideo,
  holdsAFile,
  isForNamespace,
  canDownload,
  partsOf,
  urlOf,
  hasSwitch,
  start,
};
