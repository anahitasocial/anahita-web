import {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { useSelector } from 'react-redux';
import useMediaQuery from '@mui/material/useMediaQuery';

import useLinkPreview from '../media/Composer/useLinkPreview';
import useTextareaHashtags from '../media/Composer/useHashtagSuggestions';
import useThreadSplit from '../media/Composer/useThreadSplit';
import useOnFediverse, { useOnBluesky } from '../media/Composer/useOnFediverse';
import { problemOf } from '../media/Composer/Video/useVideoUpload';
import linkPreviews from '../../utils/linkPreviews';
import offers from '../../utils/offers';
import photoFiles from '../../utils/photoFiles';
import threadNotes from '../../utils/threadNotes';
import threadSplit from '../../utils/threadSplit';
import videos from '../../utils/videos';
import warnings from '../../utils/warnings';

// What goes with a reply's words when it is sent, the third argument to
// onSubmit: its pictures, { uploads }; or its GIF or video, { video }; or,
// for a thread written in one go, { thread }, the notes after the first,
// with the first's pictures and the first note as the others are, for a
// thread with a file in it, cut where its files are (threadNotes.cut). Its
// content warning, { warning }, as utils/warnings has it, with any of them.
const attachedOf = ({
  text, threadParts, photoItems, photosReady, video, card, warning,
}) => {
  let attached = {};
  // A thread's first note may have pictures as well (roadmap row 143).
  if (threadParts.length > 0) {
    attached = {
      thread: threadParts,
      ...(photosReady ? { uploads: photoFiles.toRequest(photoItems) } : {}),
      firstNote: {
        words: text,
        photos: photosReady ? photoItems : [],
        video,
        linkPreviewUrl: !photosReady && !video ? card.url : '',
      },
    };
  } else if (photosReady) {
    attached = { uploads: photoFiles.toRequest(photoItems) };
  } else if (video) {
    attached = { video };
  }
  if (warnings.has(warning)) {
    attached = { ...attached, warning };
  }
  return attached;
};

// What to do about the card of the first link in a reply, the second
// argument to onSubmit.
const cardOf = (card) => {
  return {
    ...(card.url ? { linkPreviewUrl: card.url } : {}),
    ...(card.isRemoved ? { linkPreviewRemove: true } : {}),
  };
};

// What the box a reply is written in holds while it is written, and the
// rules for sending it. ReplyForm draws what this gives; the props are
// ReplyForm's own (see there).
//
// Sending is the caller's: it returns a promise, and the form empties
// itself only when that succeeds, so a reply that could not be posted is
// still there to send again.
const useReplyForm = ({
  onSubmit,
  initial = '',
  linkPreview = null,
  autoFocus = false,
  attachments = false,
  compact = false,
  onDraft = null,
}) => {
  const [body, setBody] = useState(initial);
  const [isSending, setIsSending] = useState(false);
  const [isAddingPhotos, setIsAddingPhotos] = useState(false);
  const [photoItems, setPhotoItems] = useState([]);
  // The photos just picked, for the editor to take as if dropped.
  const [incoming, setIncoming] = useState(null);
  // A thread written in one go, under a new reply: the notes after the
  // first (roadmap row 101).
  const [moreParts, setMoreParts] = useState([]);
  const [video, setVideo] = useState(null);
  const [videoProblem, setVideoProblem] = useState('');
  // Its content warning (anahita-services row 122), for a new reply.
  const [warning, setWarning] = useState(warnings.NONE);
  const viewer = useSelector((state) => { return state.session.viewer; });
  const nodeInfo = useSelector((state) => { return state.app.nodeInfo; });

  const text = body.trim();
  const hasPhotos = photoItems.length > 0;
  const photosReady = hasPhotos && photoFiles.canSubmit(photoItems);
  // Pictures only where the site offers photo posts: a reply with pictures
  // is one (instance.json, anahita-services' docs/instance-features.md).
  const canAddPhotos = attachments && offers.post(nodeInfo && nodeInfo.metadata, 'photo');
  const canAddVideo = attachments && videos.isOn(nodeInfo);
  // Something to send: words, pictures that are all stored, or a video.
  const hasSomething = Boolean(text) || photosReady || Boolean(video);
  // Only for a new reply, its notes with words, pictures or both, or a GIF
  // or a video (roadmap row 143).
  const canThread = attachments;
  const threadParts = canThread ? moreParts.filter(threadNotes.hasSomething) : [];
  // Where a reply's note ends: what the networks the viewer is on hold, as a
  // reply goes where the thread's writer and its readers are (roadmap row
  // 126). The count, and long words split into a thread, as in the composer.
  const onFediverse = useOnFediverse(viewer);
  const onBluesky = useOnBluesky(viewer);
  const noteLimit = threadSplit.limitFor({
    goesToBluesky: onBluesky, goesToFediverse: onFediverse,
  });
  // Held back while a note's pictures are being sent, and while any note
  // is longer than a note may be: 300 for somebody on Bluesky, else 500
  // (roadmap rows 144 and 179).
  const isHeldBack = (hasPhotos && !photosReady) || isSending ||
    threadParts.some((note) => { return !threadNotes.isReady(note); }) ||
    threadSplit.lengthOf(text) > noteLimit ||
    threadParts.some((note) => { return threadSplit.lengthOf(note.words) > noteLimit; });
  const split = useThreadSplit({
    body, setBody, moreParts, setMoreParts, limit: noteLimit, canThread: canThread && !compact,
  });

  const known = useMemo(() => {
    return linkPreview ?
      { url: linkPreviews.urlToPreview(initial), preview: linkPreview } :
      null;
  }, [linkPreview, initial]);
  const card = useLinkPreview(body, true, known);
  // Hashtags in use offered as one is typed (roadmap row 78).
  const mobile = useMediaQuery((theme) => { return theme.breakpoints.down('sm'); });
  const hashtags = useTextareaHashtags({ value: body, onChange: setBody, mobile });

  // Words carried over from the line or the dialog go on from their end.
  useEffect(() => {
    const field = hashtags.inputRef.current;
    if (autoFocus && field && initial) {
      field.setSelectionRange(initial.length, initial.length);
    }
    // Only as it opens.
  }, []);

  // What is written, for a dialog to hand back to the line it came from.
  useEffect(() => {
    if (onDraft) {
      onDraft(body);
    }
  }, [body, onDraft]);

  // The photos go when the last is taken out; there is no other button to
  // close them (roadmap row 112).
  const hadPhotos = useRef(false);
  useEffect(() => {
    if (photoItems.length > 0) {
      hadPhotos.current = true;
    } else if (hadPhotos.current) {
      hadPhotos.current = false;
      setIsAddingPhotos(false);
    }
  }, [photoItems.length]);

  const submit = (event) => {
    event.preventDefault();
    if (!hasSomething || isHeldBack) {
      return;
    }

    const attached = attachedOf({
      text, threadParts, photoItems, photosReady, video, card, warning,
    });

    setIsSending(true);
    onSubmit(text, cardOf(card), attached).then(() => {
      card.reset();
      setBody('');
      setPhotoItems([]);
      setMoreParts([]);
      setIsAddingPhotos(false);
      setIncoming(null);
      setVideo(null);
      setWarning(warnings.NONE);
    }).catch(() => {
      // The caller has said what went wrong. The text stays.
    }).finally(() => {
      setIsSending(false);
    });
  };

  return {
    viewer,
    nodeInfo,
    body,
    setBody,
    text,
    isSending,
    hasSomething,
    isHeldBack,
    submit,
    card,
    hashtags,

    // Pictures: the editor open once some are picked, and what it holds.
    canAddPhotos,
    isAddingPhotos,
    photoItems,
    setPhotoItems,
    hasPhotos,
    photosMax: photoFiles.maxFiles(nodeInfo),
    incoming,
    takeIncoming: () => {
      setIncoming(null);
    },
    pickPhotos: (chosen) => {
      if (chosen.length > 0) {
        setIsAddingPhotos(true);
        setIncoming({ files: chosen });
      }
    },

    // A GIF or a video, or what is wrong with the one chosen.
    canAddVideo,
    video,
    videoProblem,
    removeVideo: () => {
      setVideo(null);
    },
    startPickingVideo: () => {
      setVideoProblem('');
    },
    pickVideo: (chosen) => {
      if (!chosen) {
        return;
      }
      const problem = videos.problem(chosen, nodeInfo);
      if (problem) {
        setVideoProblem(problemOf('video', problem, nodeInfo));
        return;
      }
      setVideo(chosen);
    },

    warning,
    setWarning,

    // The notes after the first, and how long a note may be.
    canThread,
    moreParts,
    setMoreParts,
    // Another note, once the last has something in it.
    canAddNote: hasSomething &&
      !moreParts.some((note) => { return !threadNotes.hasSomething(note); }),
    noteLimit,
    onBluesky,
    split,
  };
};

export { attachedOf, cardOf };
export default useReplyForm;
