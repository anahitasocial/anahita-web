// How long a note of a thread may be before the next begins, and long words
// split into notes (roadmap row 126). Plain functions, with nothing from
// React, so they can be tested on their own.
import LIMITS from '../constants/limits';

// What a note may hold, wherever it goes: 500, as on Mastodon and Threads
// (roadmap row 144). Bluesky shows the first 300 of it, with a link to the
// rest; the count warns of that, and does not stop at it.
const limitFor = () => {
  return LIMITS.POST_MAX;
};

// A link as Markdown writes it, and an address standing alone: the
// services' posts.Length.
const MARKDOWN_LINK = /\[([^\]\n]*)\]\((https?:\/\/[^)\s]+)\)/g;
const ADDRESS = /https?:\/\/[^\s<>)\]]+/g;

// What each letter of the words costs, as the server counts them: one, but
// a link standing alone LINK_LENGTH in all, on its first letter, and a
// Markdown link its words alone. `within` marks the letters inside an
// address, where a note must not end.
const costsOf = (words = '') => {
  const letters = Array.from(words);
  const costs = letters.map(() => { return 1; });
  const within = letters.map(() => { return false; });
  // Places in the string are UTF-16; in letters, code points.
  const letterAt = [];
  letters.forEach((letter, index) => {
    for (let unit = 0; unit < letter.length; unit += 1) {
      letterAt.push(index);
    }
  });
  letterAt.push(letters.length);
  const taken = letters.map(() => { return false; });
  [...words.matchAll(MARKDOWN_LINK)].forEach((match) => {
    const start = letterAt[match.index];
    const end = letterAt[match.index + match[0].length];
    const wordsEnd = letterAt[match.index + 1 + match[1].length];
    for (let i = start; i < end; i += 1) {
      taken[i] = true;
      // The brackets and the address cost nothing; the words, one each.
      costs[i] = i > start && i < wordsEnd ? 1 : 0;
      within[i] = i > wordsEnd;
    }
  });
  [...words.matchAll(ADDRESS)].forEach((match) => {
    const start = letterAt[match.index];
    if (taken[start]) {
      return;
    }
    const end = letterAt[match.index + match[0].length];
    for (let i = start; i < end; i += 1) {
      costs[i] = i === start ? LIMITS.LINK_LENGTH : 0;
      within[i] = i > start;
    }
  });
  return { letters, costs, within };
};

// How long the words are, as the server counts them (posts.Length): an
// emoji is one, Markdown's marks count as typed, a link standing alone is
// LINK_LENGTH however long, and a Markdown link its words.
const lengthOf = (words = '') => {
  return costsOf(words).costs.reduce((sum, cost) => { return sum + cost; }, 0);
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
const cutAt = (letters, limit, within = []) => {
  const window = letters.slice(0, limit + 1).join('');
  const fits = (at) => {
    return at > 0 && at <= limit && !insideLink(letters, at) && !within[at];
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
  let rest = (words || '').trim();
  const notes = [];
  while (lengthOf(rest) > limit) {
    const { letters, costs, within } = costsOf(rest);
    // The most letters whose cost is within the limit.
    let room = 0;
    let spent = 0;
    while (room < letters.length && spent + costs[room] <= limit) {
      spent += costs[room];
      room += 1;
    }
    const at = cutAt(letters, Math.max(room, 1), within);
    const note = letters.slice(0, at).join('').trim();
    if (note) {
      notes.push(note);
    }
    rest = letters.slice(at).join('').trim();
    if (notes.length > max) {
      return null;
    }
  }
  if (rest.length > 0) {
    notes.push(rest);
  }
  return notes.length <= max ? notes : null;
};

export default {
  limitFor,
  lengthOf,
  split,
};
