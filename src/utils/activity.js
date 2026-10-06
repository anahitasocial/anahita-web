// A post's activity: who liked it, reposted it, quoted it and replied to
// it. What there is to show in each list, and the numbers beside them.
//
// Plain functions, so they can be tested without the dialog.

const LIKES = 'likes';
const REPOSTS = 'reposts';
const QUOTES = 'quotes';
const REPLIES = 'replies';

// In the order they are shown.
const KINDS = [LIKES, REPOSTS, QUOTES, REPLIES];

// The number on each tab, from the counts the post carries.
const counts = (post = {}) => {
  return {
    [LIKES]: post.likesCount || 0,
    [REPOSTS]: post.repostCount || 0,
    [QUOTES]: post.quoteCount || 0,
    [REPLIES]: post.commentCount || 0,
  };
};

const total = (post) => {
  const each = counts(post);
  return KINDS.reduce((sum, kind) => {
    return sum + each[kind];
  }, 0);
};

// The tab to open on: the one asked for when it has something, or else the
// first that does, or else the first.
const startOn = (post, asked = LIKES) => {
  const each = counts(post);
  if (each[asked] > 0) {
    return asked;
  }
  return KINDS.find((kind) => {
    return each[kind] > 0;
  }) || LIKES;
};

// How much of a quote's or a reply's text a row shows.
const EXCERPT = 140;

const excerptOf = (text = '') => {
  const plain = String(text).replace(/\s+/g, ' ').trim();
  return plain.length > EXCERPT ? `${plain.slice(0, EXCERPT).trim()}…` : plain;
};

// Rows for a list of people: the likers and the reposters, as the server
// sends them.
const peopleRows = (actors = []) => {
  return actors.filter((actor) => {
    return actor && actor.id;
  }).map((actor) => {
    return { key: `actor-${actor.id}`, actor };
  });
};

// Rows for a list of notes: the quotes and the replies. Each is somebody and
// what they said, with the note to go to. A reply that was removed, or
// hidden from the thread, is not somebody's activity to show.
const noteRows = (notes = []) => {
  return notes.filter((note) => {
    return note && note.id && note.author && note.author.id && !note.deleted && !note.hidden;
  }).map((note) => {
    return {
      key: `note-${note.id}`,
      actor: note.author,
      note,
      excerpt: excerptOf(note.body),
    };
  });
};

export default {
  KINDS,
  LIKES,
  QUOTES,
  REPLIES,
  REPOSTS,
  counts,
  noteRows,
  peopleRows,
  startOn,
  total,
};
