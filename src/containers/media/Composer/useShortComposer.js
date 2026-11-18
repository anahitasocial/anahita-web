import { useEffect, useRef, useState } from 'react';

import LIMITS from '../../../constants/limits';
import composer from '../../../utils/composer';
import photoFiles from '../../../utils/photoFiles';
import threadNotes from '../../../utils/threadNotes';
import threadSplit from '../../../utils/threadSplit';
import kinds from '../../../utils/postKinds';
import sendShort from './sendShort';
import useComposer from './useComposer';
import useDraft from './useDraft';
import useLinkPreview from './useLinkPreview';
import useTextareaHashtags from './useHashtagSuggestions';
import useShortFiles from './useShortFiles';
import useThreadSplit from './useThreadSplit';
import { useSharedVideoUpload } from './Video/SharedVideoUpload';

// What the short box holds and the rules it keeps; Short.jsx draws it.
// The words, kept as a draft until they are posted (useDraft); what is put
// with them (useShortFiles); the notes of a thread after the first; and
// which of its two steps is open, the post itself or the choices that go
// with it (roadmap row 114).
//
// From those it works out whether there is something to post, whether it
// is held back, and what to say of where it will go; and it sends it, with
// sendShort.
//
// `kinds` is what the profile takes, of note, photo, video and audio
// (kinds.js). `onClose` closes it; `onExpand`, where the profile takes long
// writing, opens the extended composer with what was written.
const useShortComposer = ({
  actor,
  kinds: takes,
  open,
  onClose,
  onExpand = null,
}) => {
  const base = useComposer({ actor, open, withBluesky: true });
  const {
    nodeInfo, mobile, choices, goesOut, goesToBluesky,
  } = base;

  const [body, setBody, clearDraft] = useDraft(actor.id);
  const [isSending, setIsSending] = useState(false);
  // The notes of a thread after the first, written in one go (roadmap row
  // 101).
  const [moreParts, setMoreParts] = useState([]);

  // 'write', the post itself, or 'details', what goes with it.
  const [step, setStep] = useState('write');
  const onDetails = step === 'details';
  // The dialog's height as Details opens, kept so that it does not jump
  // from one step to the other on a wider screen.
  const form = useRef(null);
  const [held, setHeld] = useState(0);
  const toDetails = () => {
    setHeld(form.current ? form.current.offsetHeight : 0);
    setStep('details');
  };

  // The app's, so that it goes on being sent from page to page.
  const upload = useSharedVideoUpload();
  const busy = isSending;
  const files = useShortFiles({
    open, takes, nodeInfo, choices, upload, busy,
  });
  const { photoItems, hasPhotos, video } = files;

  const canWords = kinds.isOffered(takes, 'note', nodeInfo);
  const text = body.trim();
  // A thread is of notes, each with words, pictures or both, or a GIF, a
  // video or a sound (roadmap row 143).
  const canThread = canWords;
  const threadParts = canThread ? moreParts.filter(threadNotes.hasSomething) : [];
  const photosReady = hasPhotos && photoFiles.canSubmit(photoItems);
  // A thread with a file in a note after the first, which the app sends too.
  const threadHasVideo = threadParts.some(threadNotes.hasVideo);
  const hasSomething = composer.canPost({
    text,
    takesNotes: canWords,
    photosReady,
    hasVideo: Boolean(video),
  });
  // Any note longer than a note may be (roadmap row 144): split, shortened,
  // or made an article before it can go on.
  const tooLong = threadSplit.lengthOf(text) > LIMITS.POST_MAX ||
    threadParts.some((note) => { return threadSplit.lengthOf(note.words) > LIMITS.POST_MAX; });
  // Held back too while a note's pictures are still being sent.
  const isHeldBack = (hasPhotos && !photosReady) || busy || tooLong ||
    threadParts.some((note) => { return !threadNotes.isReady(note); }) ||
    (threadHasVideo && files.videoBusy);
  // On to the choices once there is something to post, photos still being
  // sent included: Post waits for them, on the next step.
  const canGoOn = (hasSomething || hasPhotos) && !isSending && !tooLong;

  const linkPreview = useLinkPreview(body, canWords && !hasPhotos && !video);
  // Hashtags in use offered as one is typed (roadmap row 78).
  const hashtags = useTextareaHashtags({ value: body, onChange: setBody, mobile });

  // Where a note of a thread ends, where the post goes (roadmap row 126),
  // the count against it, and long words split into a thread.
  const noteLimit = threadSplit.limitFor({ goesToBluesky, goesToFediverse: goesOut });
  const split = useThreadSplit({
    body, setBody, moreParts, setMoreParts, limit: noteLimit, canThread,
  });
  // What other networks will show of it, said before it is posted (roadmap
  // row 100): the first four pictures on Mastodon and Bluesky, with a link
  // to the post here for the rest; and the first 300 letters on Bluesky
  // (NoteParts.blueskyCut).
  const morePictures = photoItems.length > LIMITS.PICTURES_SHOWN_MAX && (
    (goesOut && goesToBluesky && 'federation:composer.morePictures') ||
    (goesOut && 'federation:composer.morePicturesMastodon') ||
    (goesToBluesky && 'federation:composer.morePicturesBluesky'));

  // Opened, it opens on the words.
  useEffect(() => {
    if (open) {
      setStep('write');
    }
  }, [open]);

  // Everything back to an empty box, closed. The choices of audience and
  // language stay; who may reply is asked of each post.
  const reset = () => {
    clearDraft();
    files.clear();
    setMoreParts([]);
    setStep('write');
    base.posted();
    linkPreview.reset();
    onClose();
  };

  const send = () => {
    sendShort({
      text,
      photoItems,
      photosReady,
      people: files.people,
      video,
      linkPreviewUrl: linkPreview.url,
      threadParts,
    }, {
      actor,
      viewer: base.viewer,
      dispatch: base.dispatch,
      choices,
      locationIds: base.locationIds,
      upload,
      setIsSending,
      reset,
      alertSuccess: base.alertSuccess,
      alertError: base.alertError,
    });
  };

  // On the words, Next: on to the choices. On the choices, Post, once
  // there is something to post and nothing holds it back.
  const submit = (event) => {
    if (event) {
      event.preventDefault();
    }
    if (!onDetails) {
      if (canGoOn) {
        toDetails();
      }
      return;
    }
    if (!hasSomething || isHeldBack) {
      return;
    }
    base.rules.run(send);
  };

  // What is written goes along to the extended composer, and is its draft
  // from then on.
  const expand = () => {
    onClose();
    onExpand(body);
    clearDraft();
  };

  return {
    ...base,
    files,
    form,
    held,
    onDetails,
    back: () => { setStep('write'); },
    body,
    setBody,
    text,
    moreParts,
    setMoreParts,
    canWords,
    canThread,
    photosReady,
    isSending,
    busy,
    hasSomething,
    isHeldBack,
    canGoOn,
    linkPreview,
    hashtags,
    split,
    noteLimit,
    morePictures,
    submit,
    // None where the profile takes no long writing.
    expand: onExpand ? expand : null,
  };
};

export default useShortComposer;
