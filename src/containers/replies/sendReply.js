import api from '../../api';
import postLanguage from '../../utils/postLanguage';
import thread from '../../utils/thread';
import threadNotes from '../../utils/threadNotes';
import warnings from '../../utils/warnings';

// How a new reply goes to the server, apart from the thread that shows it,
// so that the rules for each kind of reply are in one place and can be
// tested without drawing anything.
//
// A reply with words alone is a note; with pictures, a photo post; with a
// GIF or a video, a video post, which is in the thread once it has been
// sent and prepared. A thread written in one go is made together, in
// order, each note answering the one before.
//
// It answers with what was made, `made`, to put in the thread at once, and
// `onTheWay`, a reply with a file still to be sent (VideoReplyOnTheWay), or
// null. A refusal from the server is passed on as it came.

// The words for a reply that could not be added: a refusal said as one.
const notAddedKey = (error) => {
  const status = error && error.response && error.response.status;
  return status === 403 ? 'replies:prompts.notAllowed' : 'replies:prompts.notAdded';
};

// Replies made together, put in the thread one after the other, by the
// same rule the server follows.
const addAll = (replies, made) => {
  return made.reduce((list, part) => { return thread.add(list, part); }, replies);
};

const sendReply = (viewer, parent, body, card = {}, attached = {}) => {
  // The language this person writes in, as for any post.
  const language = postLanguage.defaultFor(viewer);
  // Its content warning, when its writer gave it one (row 122): a
  // thread's is every note's.
  const warning = warnings.toRequest(attached.warning);

  // A thread with a file in any note (roadmap row 143): the notes before
  // the first file made now, as a thread; then each file sent, in turn,
  // with the notes after it, which the server makes once it is ready.
  const cut = attached.thread && attached.firstNote ?
    threadNotes.cut([attached.firstNote, ...attached.thread]) : null;
  if (cut) {
    const partsOf = (notes) => {
      return notes.map((note) => { return threadNotes.toPart(note, language); });
    };
    const [first, ...rest] = cut.segments;
    const onTheWay = (answered) => {
      return {
        parent: answered,
        body: first.note.words.trim(),
        language,
        warning,
        threadAfter: partsOf(first.after),
        more: rest.map((segment) => {
          return {
            body: segment.note.words.trim(),
            threadAfter: partsOf(segment.after),
            file: segment.note.video,
          };
        }),
        file: first.note.video,
      };
    };
    if (cut.before.length === 0) {
      return Promise.resolve({ made: [], onTheWay: onTheWay(parent) });
    }
    return api.replies.addReplyThread(parent, partsOf(cut.before), warning).then((result) => {
      const made = result.data.parts;
      return { made, onTheWay: onTheWay(made[made.length - 1]) };
    });
  }

  if (attached.video) {
    return Promise.resolve({
      made: [],
      onTheWay: {
        parent, body, language, warning, file: attached.video,
      },
    });
  }

  // A thread written in one go: its notes made together, in order, each
  // answering the one before (roadmap row 101), each with words,
  // pictures or both (row 143).
  if (attached.thread) {
    const first = {
      content: body,
      language,
      ...(attached.uploads ? { uploads: attached.uploads } : {}),
      ...(!attached.uploads && card.linkPreviewUrl ?
        { linkPreviewUrl: card.linkPreviewUrl } : {}),
    };
    const parts = [first, ...attached.thread.map((note) => {
      return threadNotes.toPart(note, language);
    })];
    return api.replies.addReplyThread(parent, parts, warning).then((result) => {
      return { made: result.data.parts, onTheWay: null };
    });
  }

  const sent = attached.uploads ?
    api.replies.addWithPictures(parent, {
      content: body, language, uploads: attached.uploads, warning,
    }) :
    api.replies.add(parent, {
      content: body, card, language, warning,
    });

  return sent.then((result) => {
    return { made: [result.data], onTheWay: null };
  });
};

export { addAll, notAddedKey };
export default sendReply;
