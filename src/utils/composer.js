// What a post written in the composer becomes, from what is in it: the one
// rule of the short box (containers/media/Composer/Short.jsx).
//
// Pictures make a photo post and a video a video post, whatever is written
// with them; words alone make a note. A post may hold pictures or a video,
// not both.

const kindOf = ({ hasPhotos = false, hasVideo = false } = {}) => {
  if (hasPhotos) {
    return 'photo';
  }
  if (hasVideo) {
    return 'video';
  }
  return 'note';
};

// Whether there is something to post: pictures that are all stored, a
// video, or words where the profile takes notes.
const canPost = ({
  text = '',
  takesNotes = true,
  photosReady = false,
  hasVideo = false,
} = {}) => {
  return photosReady || hasVideo || (Boolean(text.trim()) && takesNotes);
};

export default {
  kindOf,
  canPost,
};
