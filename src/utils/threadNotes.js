import photoFiles from './photoFiles';

// The notes of a thread written in one go, after the first (roadmap rows
// 101 and 143): each its words and its pictures, as the photo editor holds
// them. A note with pictures is posted as a photo post in the thread.

// Each has a key of its own, so that its pictures, sent while others are
// added or taken out, are told to the right note.
let made = 0;
const make = (words = '') => {
  made += 1;
  return {
    key: `note-${made}`, words, photos: [], linkPreviewUrl: '',
  };
};

// The notes with `key` changed by `change`, from a note to the note as it
// is to be: what a state setter is given.
const changeOne = (key, change) => {
  return (notes) => {
    return notes.map((note) => { return note.key === key ? change(note) : note; });
  };
};

// Whether it says anything: words, or pictures.
const hasSomething = (note) => {
  return Boolean(note.words.trim()) || note.photos.length > 0;
};

// Whether it can be sent: no pictures, or all of them stored.
const isReady = (note) => {
  return note.photos.length === 0 || photoFiles.canSubmit(note.photos);
};

// One note as the server takes it, a part of `parts`.
const toPart = (note, language) => {
  return {
    content: note.words.trim(),
    language,
    ...(note.photos.length > 0 ? { uploads: photoFiles.toRequest(note.photos) } : {}),
    // The card for its link, as the composer found it; none with photos.
    ...(note.photos.length === 0 && note.linkPreviewUrl ?
      { linkPreviewUrl: note.linkPreviewUrl } : {}),
  };
};

export default {
  make,
  changeOne,
  hasSomething,
  isReady,
  toPart,
};
