import plainText from './plainText';

// A link written in a post's Markdown, [words](address), or an address
// standing on its own.
const LINK = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|(https?:\/\/[^\s<>()[\]]+)/g;

// What a short excerpt of a post is made of: plain words, and its links,
// to draw as links and not as Markdown written out (the user, 2026-11-08:
// a quoted post showed "[https://t.co/…](https://t.co/…)"). Cut at `max`
// characters of what is shown, with "…" when there was more.
//
// Each part is { text } or { text, href }.
const excerpt = (markdown = '', max = 280) => {
  const parts = [];
  const source = String(markdown || '');
  let at = 0;
  let match;
  LINK.lastIndex = 0;
  // eslint-disable-next-line no-cond-assign
  while ((match = LINK.exec(source)) !== null) {
    if (match.index > at) {
      parts.push({ text: source.slice(at, match.index) });
    }
    parts.push(match[2] ?
      { text: match[1], href: match[2] } :
      { text: match[3], href: match[3] });
    at = LINK.lastIndex;
  }
  if (at < source.length) {
    parts.push({ text: source.slice(at) });
  }

  // Plain words as plainText makes them, keeping the space at either end
  // that stands between a word and a link.
  const shown = [];
  let left = max;
  parts.forEach((part) => {
    if (left <= 0) {
      return;
    }
    let text = part.href ? plainText(part.text) : part.text;
    if (!part.href) {
      const before = /^\s/.test(text) ? ' ' : '';
      const after = /\s$/.test(text) ? ' ' : '';
      const words = plainText(text);
      text = words ? `${before}${words}${after}` : (before || after);
    }
    if (!text) {
      return;
    }
    if (text.length > left) {
      text = `${text.slice(0, left).trimEnd()}…`;
      left = 0;
    } else {
      left -= text.length;
    }
    shown.push(part.href ? { text, href: part.href } : { text });
  });

  // No space before the first word or after the last.
  if (shown.length > 0) {
    shown[0].text = shown[0].text.trimStart();
    const last = shown[shown.length - 1];
    last.text = last.text.trimEnd();
  }
  return shown.filter((part) => { return part.text; });
};

export default excerpt;
