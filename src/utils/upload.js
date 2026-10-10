// Why an image the server refused was refused, as the key of its wording.
//
// The image services answer with a word for the reason. A file too big for
// the gateway is stopped before it reaches them and comes back as a bare
// 413, which means the same thing.

const KEYS = {
  file_too_large: 'media:image.tooLarge',
  file_unsupported: 'media:image.unsupported',
  file_unreadable: 'media:image.unreadable',
};

const refusalKey = (failure) => {
  const response = (failure && failure.response) || {};
  const reason = response.data && response.data.error;

  if (KEYS[reason]) {
    return KEYS[reason];
  }

  if (response.status === 413) {
    return KEYS.file_too_large;
  }

  if (response.status === 415) {
    return KEYS.file_unsupported;
  }

  return 'media:image.failed';
};

export default {
  refusalKey,
};
