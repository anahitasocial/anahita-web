import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';
import utils from '../../../utils';
import composer from '../../../utils/composer';
import photoFiles from '../../../utils/photoFiles';
import threadNotes from '../../../utils/threadNotes';
import warnings from '../../../utils/warnings';
import { tagPeople, tagOutcomeMessage } from '../TagPeopleDialog';
import kinds from '../../../utils/postKinds';

// How what is written in the short box is sent, once it may be
// (useShortComposer): as a note or a photo post, a video or a sound, a
// thread, or a thread with files in it. Plain functions, given what is
// written and what to send it with, so that each way can be tested alone.
//
// `post` is what is written:
//
//   text            the first note's words, trimmed
//   photoItems      its photos, as the photo editor holds them
//   photosReady     whether there are photos and all are stored
//   people          who is in them, tagged once the post is made
//   video           a GIF, a video or a sound, the file chosen
//   linkPreviewUrl  the link the first note's card is for
//   threadParts     the notes after the first that say something
//
// `to` is what it is sent with: `actor`, the profile it is posted on;
// `viewer`, who writes it; `dispatch`; `choices` (usePostChoices);
// `locationIds()`; `upload`, the app's (Video/SharedVideoUpload);
// `setIsSending`; `reset()`, which empties and closes the composer; and
// `alertSuccess` and `alertError`.

// Posted, with View, to the post wherever the feed is scrolled.
const posted = (to, made = null) => {
  to.dispatch(actions.app.alert.success(
    i18n.t('prompts:posted.success'),
    made && made.id ? utils.node.getURL(made) : '',
  ));
  to.reset();
};

// Once a photo post is made, alone or as a thread's first note: whoever
// is in its photos tagged, and who could not be, or is asked first, said
// so instead of "Posted".
const taggedAfter = (to, made, tagged) => {
  if (tagged.length === 0 || !made || !made.id) {
    posted(to, made);
    return null;
  }
  return tagPeople(made, tagged).then((outcomes) => {
    const said = tagOutcomeMessage(outcomes);
    if (said.error) {
      to.alertError(said.text);
    } else if (outcomes.some((each) => { return each.outcome === 'asked'; })) {
      to.alertSuccess(said.text);
    } else {
      to.alertSuccess(i18n.t('prompts:posted.success'));
    }
    to.reset();
  });
};

// What goes with a post of any kind: its words, its choices, and its
// locations.
const shared = (post, to) => {
  return {
    content: post.text,
    ...to.choices.request(),
    ...to.locationIds(),
  };
};

// What a thread's first note takes as the post: all a post takes but its
// words, which are the first part's; and, with photos, whether they may be
// downloaded.
const threadPost = (post, to) => {
  const made = {
    ...shared(post, to),
    ...(post.photosReady ? { allow_download: to.choices.allowDownload } : {}),
  };
  delete made.content;
  return made;
};

// Sent, and what was written stays, to post again, should it fail.
const sending = (to, request) => {
  to.setIsSending(true);
  return request.catch(() => {
    to.alertError(i18n.t('prompts:posted.error'));
  }).finally(() => {
    to.setIsSending(false);
  });
};

// A thread whose notes have a GIF, a video or a sound (roadmap row 143),
// cut where its files are (threadNotes.cut). Every file is sent by the
// app, one after another; what was made is said as any video post is.
const sendThreadWithFiles = (post, to) => {
  const {
    actor, viewer, choices, upload,
  } = to;
  const { language } = choices.request();
  const notes = [{
    words: post.text,
    photos: post.photosReady ? post.photoItems : [],
    video: post.video,
    linkPreviewUrl: !post.photosReady && !post.video ? post.linkPreviewUrl : '',
  }, ...post.threadParts];
  const { before, segments } = threadNotes.cut(notes);
  // Each file's post: its note's words, the thread's warning, and the
  // notes after it up to the next file.
  const fileStep = (segment) => {
    return {
      title: '',
      content: segment.note.words.trim(),
      language,
      ...warnings.toRequest(choices.warning),
      threadAfter: segment.after.map((note) => { return threadNotes.toPart(note, language); }),
    };
  };
  // The files after the first, each a reply by the writer on their own
  // profile, after the one before.
  const more = segments.slice(1).map((segment) => {
    return { owner: viewer, post: fileStep(segment), file: segment.note.video };
  });
  const [first] = segments;

  // The first note has the file: it is the post, with all a post takes.
  if (before.length === 0) {
    upload.start(actor, {
      ...choices.request(),
      ...fileStep(first),
      allowDownload: choices.allowDownload,
    }, first.note.video, more);
    to.reset();
    return null;
  }

  // Otherwise the notes before it, as a thread, and the file answers the
  // last of them.
  const parts = before.map((note) => { return threadNotes.toPart(note, language); });
  return sending(to, api.replies.addThread(actor, threadPost(post, to), parts).then((result) => {
    const made = result.data.parts;
    to.dispatch({ type: 'NOTES_ADD_SUCCESS', node: made[0] });
    upload.start(viewer, {
      ...fileStep(first),
      parentId: made[made.length - 1].id,
    }, first.note.video, more);
    to.reset();
  }));
};

// A thread: its notes made together, in order, all or none. The first
// takes what a post takes; the rest are replies to the one before. Each
// note with pictures is a photo post in it (roadmap row 143): the first
// with the post's own, uploaded for the profile it is on, and whether they
// may be downloaded; the rest with theirs, the writer's.
const sendThread = (post, to) => {
  const { language } = to.choices.request();
  const first = {
    content: post.text,
    language,
    ...(post.photosReady ? { uploads: photoFiles.toRequest(post.photoItems) } : {}),
    ...(!post.photosReady && post.linkPreviewUrl ? { linkPreviewUrl: post.linkPreviewUrl } : {}),
  };
  const parts = [first, ...post.threadParts.map((note) => {
    return threadNotes.toPart(note, language);
  })];
  // Whoever is in the first note's photos is tagged once it is made, as on
  // a photo post.
  const tagged = post.photosReady ? post.people : [];
  return sending(to, api.replies.addThread(to.actor, threadPost(post, to), parts).then((result) => {
    const [made] = result.data.parts;
    // Its first note, at the head of the open feed, as any post.
    to.dispatch({ type: 'NOTES_ADD_SUCCESS', node: made });
    return taggedAfter(to, made, tagged);
  }));
};

// One post: a photo post with its photos, or a note, with the link its
// card is for. What the card says is the server's.
const sendOne = (post, to) => {
  const kind = composer.kindOf({ hasPhotos: post.photosReady });
  const request = kind === 'photo' ? {
    ...shared(post, to),
    title: '',
    uploads: photoFiles.toRequest(post.photoItems),
    allow_download: to.choices.allowDownload,
  } : {
    ...shared(post, to),
    ...(post.linkPreviewUrl ? { link_preview_url: post.linkPreviewUrl } : {}),
  };
  const { namespace } = kinds.of(kind);
  const tagged = kind === 'photo' ? post.people : [];
  return sending(to, to.dispatch(actions[namespace].add(request, to.actor)).then((made) => {
    return taggedAfter(to, made, tagged);
  }));
};

// Sends what is written, the way it is to go.
//
// A video goes in the background, as on other networks: the app sends it,
// and the composer closes at once, empty, so that nothing of this post is
// left in it to be taken for part of the next (roadmap row 115). How it is
// getting on is at the head of the home feed and round the + button; that
// it is posted, or why not, is said wherever the viewer is.
//
// A thread with a file in any note (roadmap row 143): the notes before the
// first file made now; then each file sent, in turn, with the notes after
// it, which the server makes once it is ready.
const sendShort = (post, to) => {
  const threadHasVideo = post.threadParts.some(threadNotes.hasVideo);
  if ((post.video && post.threadParts.length > 0) || threadHasVideo) {
    return sendThreadWithFiles(post, to);
  }
  if (post.video) {
    to.upload.start(to.actor, {
      title: '',
      content: post.text,
      ...to.choices.request(),
      allowDownload: to.choices.allowDownload,
    }, post.video);
    to.reset();
    return null;
  }
  if (post.threadParts.length > 0) {
    return sendThread(post, to);
  }
  return sendOne(post, to);
};

export default sendShort;
