import audioFiles from './audio';
import videos from './videos';

// The kinds of post, in one place: how each is written, where the app keeps
// it, and what its page does with it. The composers and a post's page read
// this table rather than naming kinds themselves, so that a site that
// offers only some kinds of post (utils/offers.js, the server's to say) is
// one list away, and a new kind is one row.
//
// The order is the order they are offered in: the long composer opens on
// the first it takes, and shows them as tabs in this order.
//
// How it is written:
//
//   composer           'short', the one box (Composer/Short.jsx), or 'long',
//                      the extended composer (Composer/Long.jsx)
//   namespace          its place in `actions` and `api`, and the namespace
//                      its page is read from; a sound is read as a video is
//   uploaded           sent by the app as a file (Video/SharedVideoUpload),
//                      not by a request of its own
//   isOn(nodeInfo)     for a kind the server may have switched off: whether
//                      it is on there
//   titlePlaceholder,  a long kind's own words for its title and its text
//   bodyPlaceholder
//   federates          goes to other servers, as a note does, when it is
//                      open to everybody on the writer's own profile
//
// What its page and its editor do:
//
//   titled             its edit form has a title as well as words
//   linkCard           a link in its words is shown as a card while it is
//                      edited, as the composer does (useLinkPreview)
//   wordsOptional      it may be posted with no title and no words: what it
//                      shows is its picture or its video
//   richText           edited in the editor it was written in
//   withCover          a cover picture its author chooses, put on once the
//                      post exists
//   withMedia          pictures, a GIF or a video among its words, from the
//                      editor's library
//
// A choice left out of a kind is one it does not make.
const KINDS = {
  note: { composer: 'short', namespace: 'notes', linkCard: true },
  photo: {
    composer: 'short', namespace: 'photos', titled: true, wordsOptional: true,
  },
  video: {
    composer: 'short',
    namespace: 'videos',
    uploaded: true,
    isOn: (nodeInfo) => { return videos.isOn(nodeInfo); },
    titled: true,
    wordsOptional: true,
  },
  // A sound is sent as a video is, made an audio post by the server, and
  // read from video-service (roadmap row 137).
  audio: {
    composer: 'short',
    uploaded: true,
    isOn: (nodeInfo) => { return videos.isOn(nodeInfo) && audioFiles.isOn(nodeInfo); },
  },
  // Pictures, a GIF or a video go into an article's content as blocks; a
  // topic is talked about, with links pasted in, and has neither, nor a
  // cover (the user, 2026-10-16).
  article: {
    composer: 'long',
    namespace: 'articles',
    titlePlaceholder: 'articles:composer.titlePlaceholder',
    bodyPlaceholder: 'articles:composer.bodyPlaceholder',
    federates: true,
    titled: true,
    richText: true,
    withCover: true,
    withMedia: true,
  },
  topic: {
    composer: 'long',
    namespace: 'topics',
    titlePlaceholder: 'topics:composer.titlePlaceholder',
    bodyPlaceholder: 'topics:composer.bodyPlaceholder',
    federates: false,
    titled: true,
    richText: true,
    withCover: false,
    withMedia: false,
  },
};

// What is said of a kind that is not in the table: nothing it does not have.
const NONE = { composer: '', namespace: '' };

// A kind's row, by its short name ("article").
const of = (kind) => {
  return KINDS[kind] || NONE;
};

// A kind's row, by the namespace its page is read from ("articles"). One
// that is not in the table has a title, as every kind but a note.
const byNamespace = (namespace) => {
  const kind = Object.keys(KINDS).find((name) => {
    return KINDS[name].namespace === namespace;
  });
  return kind ? KINDS[kind] : { titled: true };
};

// The kinds one composer writes, of those a profile takes
// (`authorized.composers`), in the table's order.
const forComposer = (composer, takes) => {
  return Object.keys(KINDS).filter((kind) => {
    return KINDS[kind].composer === composer && takes.includes(kind);
  });
};

// Whether a kind may be written: the profile takes it, and the server has
// it on.
const isOffered = (takes, kind, nodeInfo) => {
  const { isOn } = of(kind);
  return takes.includes(kind) && (!isOn || isOn(nodeInfo));
};

// A long kind's words: an article's for a kind without its own.
const wordsOf = (kind) => {
  return KINDS[kind] && KINDS[kind].titlePlaceholder ? KINDS[kind] : KINDS.article;
};

// The two kinds of long writing, by the type the server gives a post:
// "node.medium.text-service.article.v1".
const LONG_TYPE = /\.(article|topic)\.v1$/;

// Whether a post is long writing, an article or a topic, by its type, for
// where only the post is known: read at length, in larger type, an address
// on a line of its own shown as what it is to, its citations at its end,
// and an article to what reads the page's head.
const isLong = (medium) => {
  return LONG_TYPE.test((medium && medium.type) || '');
};

export default {
  of,
  byNamespace,
  forComposer,
  isOffered,
  wordsOf,
  isLong,
};
