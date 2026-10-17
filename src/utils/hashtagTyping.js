// Hashtags as somebody writes them: the one being typed where the caret
// is, putting a suggestion in its place, and where the caret is on the
// screen, for the suggestions to be shown by (components/HashtagSuggestions).

import { hashtagsIn } from './contentfilter/hashtag';
import { Medium as MEDIUM } from '../constants';

// A # and the letters of a hashtag after it, ending at the caret: at the
// start of the text or after a space, as the services find hashtags.
const TYPING = /(^|\s)#([\p{L}\p{N}_]*)$/u;

// The hashtag being typed, given the text before the caret: what follows
// its # (perhaps nothing yet), or null when the caret is not in one.
const typedHashtag = (before = '') => {
  const found = before.match(TYPING);
  return found ? found[2] : null;
};

// The text with the hashtag being typed, ending at `caret`, made `name`,
// and a space after it; and where the caret goes, after the space.
const putHashtag = (text, caret, name) => {
  const typed = typedHashtag(text.slice(0, caret));
  if (typed === null) {
    return { text, caret };
  }
  const start = caret - typed.length - 1;
  // The rest of a word the caret was inside of goes too.
  const after = text.slice(caret).replace(/^[\p{L}\p{N}_]*/u, '');
  const put = `#${name}${after.startsWith(' ') ? '' : ' '}`;
  return {
    text: `${text.slice(0, start)}${put}${after}`,
    caret: start + put.length + (after.startsWith(' ') ? 1 : 0),
  };
};

// Whether a post is at its hashtags' cap, given the other hashtags
// written, in lower case, and the one being typed.
const isFullAmong = (written, typed) => {
  if (written.length < MEDIUM.MAX_HASHTAGS) {
    return false;
  }
  // One of the ten typed again is still one of them.
  return !(typed && written.includes(typed.toLowerCase()));
};

// Whether a text is at its hashtags' cap without the one being typed: one
// more would be a word, not a hashtag (MEDIUM.MAX_HASHTAGS). `typed` is the
// hashtag being typed, ending at `caret`.
const isFull = (text, caret, typed) => {
  const without = typed === null ?
    text :
    `${text.slice(0, caret - typed.length - 1)}${text.slice(caret)}`;
  return isFullAmong(hashtagsIn(without), typed);
};

// A hashtag added to the end of long writing: on the line of hashtags it
// ends with, or on a line of its own.
const appendHashtag = (text, name) => {
  const trimmed = text.replace(/\s+$/, '');
  if (trimmed === '') {
    return `#${name}`;
  }
  const lastLine = trimmed.slice(trimmed.lastIndexOf('\n') + 1);
  if (/^(#[\p{L}\p{N}_]+\s*)+$/u.test(lastLine)) {
    return `${trimmed} #${name}`;
  }
  return `${trimmed}\n\n#${name}`;
};

// The CSS a textarea's text is laid out by, copied to a mirror of it.
const MIRRORED = [
  'boxSizing', 'width', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth',
  'borderLeftWidth', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'lineHeight',
  'fontFamily', 'textAlign', 'textTransform', 'textIndent', 'letterSpacing',
  'wordSpacing', 'tabSize', 'direction',
];

// Where the caret is in a textarea on the screen, as getBoundingClientRect
// gives places: { top, bottom, left }. A hidden copy of the textarea is
// laid out with the text up to the caret, and a mark put where it ends.
const caretRect = (textarea, position) => {
  const mirror = document.createElement('div');
  const style = window.getComputedStyle(textarea);
  MIRRORED.forEach((property) => {
    mirror.style[property] = style[property];
  });
  mirror.style.position = 'absolute';
  mirror.style.visibility = 'hidden';
  mirror.style.whiteSpace = 'pre-wrap';
  mirror.style.overflowWrap = 'break-word';
  mirror.style.top = '0';
  mirror.style.left = '-9999px';
  mirror.textContent = textarea.value.slice(0, position);
  const mark = document.createElement('span');
  mark.textContent = textarea.value.slice(position) || '.';
  mirror.appendChild(mark);
  document.body.appendChild(mirror);

  const box = textarea.getBoundingClientRect();
  const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.4;
  const top = (box.top + mark.offsetTop) - textarea.scrollTop;
  const left = (box.left + mark.offsetLeft) - textarea.scrollLeft;
  document.body.removeChild(mirror);
  return { top, bottom: top + lineHeight, left };
};

export {
  typedHashtag,
  putHashtag,
  isFull,
  isFullAmong,
  appendHashtag,
  caretRect,
};
