// The images of a photo post: what the server sends, what the composer and
// the edit dialog hold while somebody arranges them, and what is sent back.
//
// Plain functions, with nothing from React or the router, so the rules can
// be tested on their own.

// How many images a post holds when the server has not said. The server
// says in NodeInfo (metadata.photoMaxFiles) and refuses more whatever a
// client believes; this only decides when the "add" button disappears.
const DEFAULT_MAX = 4;

// The longest description of one image. The server refuses longer.
const ALT_TEXT_MAX_LENGTH = 1500;

const STATUS = {
  UPLOADING: 'uploading',
  READY: 'ready',
  FAILED: 'failed',
};

const maxFiles = (nodeInfo) => {
  const max = nodeInfo && nodeInfo.metadata && Number(nodeInfo.metadata.photoMaxFiles);
  return max > 0 ? max : DEFAULT_MAX;
};

// The images of a post as the server sent them, first to last. A post read
// from a service that does not send the list has none here, and is drawn
// from its portrait as a photo always was.
const filesOf = (medium) => {
  return medium && Array.isArray(medium.files) ? medium.files : [];
};

const countOf = (medium) => {
  return filesOf(medium).length;
};

const hasSeveral = (medium) => {
  return countOf(medium) > 1;
};

const absolute = (path) => {
  if (!path) {
    return '';
  }
  return path.substring(0, 4) === 'http' ? path : new URL(path, process.env.REACT_APP_API_BASE_URL).href;
};

// The address of one image at one size, or '' when that size is not there.
const urlOf = (file, size = 'medium') => {
  const image = file && file.urls && file.urls[size];
  return absolute(image && image.url);
};

// What an image is described as to somebody who cannot see it: its own
// description, or failing that the post's title, which is what a photo had
// before images could be described.
const altOf = (medium, index = 0) => {
  const file = filesOf(medium)[index];
  return (file && file.altText) || (medium && medium.name) || '';
};

// The post as if the image at this index were its only one. Everything
// that draws a photo reads portraitUrls, so handing it this draws any image
// of the post without teaching each of them about the list.
const asSingle = (medium, index = 0) => {
  const file = filesOf(medium)[index];
  if (!file || !file.urls) {
    return medium;
  }
  return { ...medium, portraitUrls: file.urls };
};

// Where a step from this image lands. Stops at the ends: a post's images
// are a short row, not a loop.
const step = (index, delta, count) => {
  if (count <= 0) {
    return 0;
  }
  return Math.min(Math.max(index + delta, 0), count - 1);
};

let nextKey = 0;

// One image somebody has just picked, before it is uploaded.
const picked = (file, previewUrl) => {
  nextKey += 1;
  return {
    key: `picked-${nextKey}`,
    status: STATUS.UPLOADING,
    name: file ? file.name : '',
    previewUrl,
    altText: '',
  };
};

// The images a post already has, as the editor holds them.
const fromMedium = (medium) => {
  return filesOf(medium).map((file) => {
    return {
      key: `file-${file.id}`,
      status: STATUS.READY,
      id: file.id,
      previewUrl: urlOf(file, 'small') || urlOf(file, 'medium'),
      altText: file.altText || '',
    };
  });
};

const update = (items, key, changes) => {
  return items.map((item) => {
    return item.key === key ? { ...item, ...changes } : item;
  });
};

const remove = (items, key) => {
  return items.filter((item) => {
    return item.key !== key;
  });
};

// Moves one image one place earlier (-1) or later (+1). At an end it stays.
const move = (items, key, delta) => {
  const from = items.findIndex((item) => {
    return item.key === key;
  });
  const to = from + delta;
  if (from < 0 || to < 0 || to >= items.length) {
    return items;
  }
  const moved = [...items];
  moved.splice(to, 0, moved.splice(from, 1)[0]);
  return moved;
};

// How many more can be added.
const room = (items, max = DEFAULT_MAX) => {
  return Math.max(max - items.length, 0);
};

const isUploading = (items) => {
  return items.some((item) => {
    return item.status === STATUS.UPLOADING;
  });
};

// Whether the list can be sent: at least one image, and every one of them
// stored. One still uploading, or one that failed and was not removed,
// holds it back, so a post is never made with fewer images than it shows.
const canSubmit = (items) => {
  return items.length > 0 && items.every((item) => {
    return item.status === STATUS.READY;
  });
};

// The list as the server takes it: each image named by the upload it came
// from or, for one the post already has, by its id. The whole list, in
// order; an image left out of it is removed from the post.
const toRequest = (items) => {
  return items.map((item) => {
    const named = item.uploadId ? { uploadId: item.uploadId } : { id: item.id };
    return { ...named, altText: (item.altText || '').trim() };
  });
};

// Whether the editor holds something other than what the post has: a
// different order, a different set, or a changed description.
const isChanged = (items, medium) => {
  const now = JSON.stringify(toRequest(items));
  const before = JSON.stringify(toRequest(fromMedium(medium)));
  return now !== before;
};

export default {
  ALT_TEXT_MAX_LENGTH,
  DEFAULT_MAX,
  STATUS,
  altOf,
  asSingle,
  canSubmit,
  countOf,
  filesOf,
  fromMedium,
  hasSeveral,
  isChanged,
  isUploading,
  maxFiles,
  move,
  picked,
  remove,
  room,
  step,
  toRequest,
  update,
  urlOf,
};
