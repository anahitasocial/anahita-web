import { useEffect, useState } from 'react';

import threadNotes from '../../../utils/threadNotes';
import useLinkPreview from './useLinkPreview';

// What one note of a thread after the first holds, and how it changes
// (ThreadNote.jsx draws it). The notes are the composer's, or the reply
// form's: each change goes to `onChange`, a state setter for all of them,
// as a function from the notes as they are to the notes as they are to be
// (utils/threadNotes.changeOne).
//
//   note        the note (utils/threadNotes)
//   onChange    the notes' setter
//   uploader    whom its photos are uploaded for, the writer; none, no
//               photos
//   photosMax   how many photos it may have
//   checkVideo  what is wrong with a file chosen, in words, '' for nothing
const useThreadNote = ({
  note,
  onChange,
  uploader,
  photosMax,
  checkVideo,
}) => {
  // The photos just picked, for the editor to take as if dropped.
  const [incoming, setIncoming] = useState(null);
  // Why the file just chosen cannot be posted, in words.
  const [videoProblem, setVideoProblem] = useState('');
  const { words, photos, video } = note;
  const change = (changeNote) => {
    onChange(threadNotes.changeOne(note.key, changeNote));
  };

  // A card for the link in it, as the first note has, where it has no
  // photos to show; which link goes with the note when it is posted.
  const card = useLinkPreview(words, photos.length === 0);
  useEffect(() => {
    if ((note.linkPreviewUrl || '') !== card.url) {
      change((current) => { return { ...current, linkPreviewUrl: card.url }; });
    }
  }, [card.url]);

  return {
    card,
    incoming,
    videoProblem,
    canPhotos: Boolean(uploader) && photosMax > 0 && !video,
    // A GIF, a video or a sound in place of photos (roadmap row 143).
    offersVideo: !video && photos.length === 0 && !incoming,
    setWords: (value) => {
      change((current) => { return { ...current, words: value }; });
    },
    // The photo editor's change, from its photos as they are to theirs as
    // they are to be.
    changePhotos: (update) => {
      change((current) => { return { ...current, photos: update(current.photos) }; });
    },
    addPhotos: (files) => {
      setIncoming({ files });
    },
    takeIncoming: () => {
      setIncoming(null);
    },
    takeVideo: (chosen) => {
      const problem = checkVideo ? checkVideo(chosen) : '';
      setVideoProblem(problem);
      if (!problem) {
        change((current) => { return { ...current, video: chosen }; });
      }
    },
    removeVideo: () => {
      change((current) => { return { ...current, video: null }; });
    },
    // The note taken out of the thread.
    remove: () => {
      onChange((notes) => {
        return notes.filter((each) => { return each.key !== note.key; });
      });
    },
  };
};

export default useThreadNote;
