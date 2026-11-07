// How long a note of a thread may be before the next begins, and long words
// split into notes (roadmap row 126). Plain functions, with nothing from
// React, so they can be tested on their own.
import LIMITS from '../constants/limits';

// What a note may hold where it goes: Bluesky's 300 when it goes there,
// the fediverse's 500 when it goes only there, and a note's own 8,000 when
// it stays here. Mastodon shows a longer note from elsewhere whole: the 500
// is what its people write, not a cut.
const limitFor = ({ goesToBluesky = false, goesToFediverse = false } = {}) => {
  if (goesToBluesky) {
    return LIMITS.BLUESKY_POST_MAX;
  }
  if (goesToFediverse) {
    return LIMITS.FEDIVERSE_POST_MAX;
  }
  return LIMITS.POST_BODY_MAX;
};

// Letters, as the composer counts them: an emoji is one, and Markdown's
// marks are counted as typed.
const lengthOf = (words = '') => {
  return Array.from(words).length;
};

// Whether a place in the words is inside Markdown's [words](address), where
// a note must not end.
const insideLink = (letters, at) => {
  const before = letters.slice(0, at).join('');
  const open = before.lastIndexOf('[');
  if (open < 0) {
    return false;
  }
  const close = before.lastIndexOf(')');
  return close < open;
};

// Where the first note of `letters` ends, at most `limit` letters in: after
// the last paragraph that fits, then the last sentence, then the last
// space; never inside a link. A word longer than a note is cut.
const cutAt = (letters, limit) => {
  const window = letters.slice(0, limit + 1).join('');
  const fits = (at) => {
    return at > 0 && at <= limit && !insideLink(letters, at);
  };
  // Never so early that a note is a few words when the next is full.
  const enough = Math.floor(limit / 3);

  const paragraph = window.lastIndexOf('\n\n');
  if (paragraph >= enough && fits(Array.from(window.slice(0, paragraph)).length)) {
    return Array.from(window.slice(0, paragraph)).length;
  }

  const sentences = [...window.matchAll(/[.!?…。！？]["')\]]*\s/g)];
  for (let i = sentences.length - 1; i >= 0; i -= 1) {
    const end = Array.from(window.slice(0, sentences[i].index + sentences[i][0].length - 1)).length;
    if (end >= enough && fits(end)) {
      return end;
    }
  }

  for (let at = Math.min(limit, letters.length - 1); at >= enough; at -= 1) {
    if (/\s/.test(letters[at]) && fits(at)) {
      return at;
    }
  }

  return limit;
};

// The words split into notes of at most `limit` letters each, in order,
// none empty; or null when they would make more than `max` notes, which an
// article takes whole. Words within the limit are one note.
const split = (words, limit, max = LIMITS.THREAD_PARTS_MAX) => {
  let letters = Array.from((words || '').trim());
  const notes = [];
  while (letters.length > limit) {
    const at = cutAt(letters, limit);
    const note = letters.slice(0, at).join('').trim();
    if (note) {
      notes.push(note);
    }
    letters = Array.from(letters.slice(at).join('').trim());
    if (notes.length > max) {
      return null;
    }
  }
  if (letters.length > 0) {
    notes.push(letters.join(''));
  }
  return notes.length <= max ? notes : null;
};

export default {
  limitFor,
  lengthOf,
  split,
};
