import embeds from './embeds';
import plainText from './plainText';

// How an article or a topic is shown in a list or a feed, made from its
// content now that it has no excerpt (the user, 2026-10-16): its opening,
// as plain words, and what is in it. An address on a line of its own is
// shown on the page, as what it is to, and is not part of the opening; nor
// is code.

// The most of the opening, before it is cut at a word.
const OPENING = 280;

// The lines that are words: not an address alone, not inside a code block.
const wordsOf = (text = '') => {
  const kept = [];
  let inCode = false;
  String(text).split('\n').forEach((line) => {
    if (/^\s*(```|~~~)/.test(line)) {
      inCode = !inCode;
      return;
    }
    if (inCode || embeds.alone(line)) {
      return;
    }
    kept.push(line);
  });
  return kept.join('\n');
};

// The opening of a text, as plain words, cut at a word with an ellipsis.
const openingOf = (text = '', most = OPENING) => {
  const plain = plainText(wordsOf(text)).replace(/\s+/g, ' ').trim();
  if (plain.length <= most) {
    return plain;
  }
  const cut = plain.slice(0, most);
  const space = cut.lastIndexOf(' ');
  return `${(space > most / 2 ? cut.slice(0, space) : cut).trim()}…`;
};

// What a text shows within itself, each once, in order: the posts here by
// kind, and how many addresses there are in all, which are its citations.
const contentsOf = (text = '', origin = window.location.origin) => {
  const seen = [];
  const counts = { photos: 0, videos: 0, citations: 0 };
  let firstPhoto = null;
  String(text).split('\n').forEach((line) => {
    const address = embeds.alone(line);
    if (!address || seen.includes(address)) {
      return;
    }
    seen.push(address);
    counts.citations += 1;
    const at = embeds.isOurs(address, origin) ? embeds.postAt(address) : null;
    if (at && at.kind === 'photo') {
      counts.photos += 1;
      if (!firstPhoto) {
        firstPhoto = at;
      }
    }
    if (at && at.kind === 'video') {
      counts.videos += 1;
    }
  });
  return { ...counts, firstPhoto };
};

export default {
  contentsOf,
  openingOf,
};
