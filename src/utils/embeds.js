// What a post shows within its text: an address on a line of its own, in
// an article or a topic. A post of this installation is drawn as itself and
// a page elsewhere by its card; an address inside a sentence stays a link.
//
// The server reads the text the same way to keep the cards and the edges
// (anahita-libs/embeds). The two say the same.

// The kinds of post an address here can be to, by the first part of its
// path, and the namespace each is read from.
const KINDS = {
  articles: 'article',
  topics: 'topic',
  notes: 'note',
  photos: 'photo',
  videos: 'video',
};

const POST_PATH = /^\/([a-z]+)\/([0-9]+)(?:-[^/]*)?\/?$/;

// Whether an address is one of this installation's: the web app's own.
const isOurs = (address, origin = window.location.origin) => {
  try {
    return new URL(address).origin === new URL(origin).origin;
  } catch (e) {
    return false;
  }
};

// The post an address here is to, as { namespace, kind, id }, or null.
const postAt = (address) => {
  let path = '';
  try {
    path = new URL(address).pathname;
  } catch (e) {
    return null;
  }
  const match = POST_PATH.exec(path);
  if (!match || !KINDS[match[1]]) {
    return null;
  }
  const id = Number(match[2]);
  if (!id) {
    return null;
  }
  return { namespace: match[1], kind: KINDS[match[1]], id };
};

// A link whose words are its own address, as some editors write one:
// [https://a.example/](https://a.example/).
const SELF_LINK = /^\[([^\]]+)\]\((\S+)\)$/;
const SELF_LINKS = /\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)/g;

// Markdown's escapes taken out of a link's words: \_ is _.
const unescape = (text) => {
  return text.replace(/\\([\\`*_{}[\]()#+\-.!|~<>])/g, '$1');
};

// Whether a line is an address and nothing else, as Markdown writes one:
// bare, in angle brackets, or as a link whose words are the address. The
// address, or ''.
const alone = (line = '') => {
  let text = line.trim();
  const self = SELF_LINK.exec(text);
  if (self) {
    if (unescape(self[1]) !== self[2]) {
      return '';
    }
    [, , text] = self;
  }
  if (text.startsWith('<') && text.endsWith('>')) {
    text = text.slice(1, -1).trim();
  }
  if (!text || /\s/.test(text)) {
    return '';
  }
  return /^https?:\/\//i.test(text) ? text : '';
};

// The pages elsewhere a text embeds, each once, in order: for the composer
// to ask for their previews while it is written, so that they are there to
// keep when the post is saved.
const pagesIn = (text = '', origin = window.location.origin) => {
  const pages = [];
  String(text).split('\n').forEach((line) => {
    const address = alone(line);
    if (address && !isOurs(address, origin) && !pages.includes(address)) {
      pages.push(address);
    }
  });
  return pages.slice(0, 10);
};

// Two addresses the same page, tidied as the server keeps them: the host in
// lower case, no fragment.
const samePage = (a = '', b = '') => {
  const tidy = (address) => {
    try {
      const parsed = new URL(address.trim());
      parsed.hash = '';
      return parsed.toString();
    } catch (e) {
      return address;
    }
  };
  return tidy(a) === tidy(b);
};

// Markdown with every link whose words are its own address written as the
// bare address: what the editor writes as [https://a.example/](https://a.example/)
// reads, and is kept, as https://a.example/. One on a line of its own is
// then an embed whatever reads it, and the text elsewhere is plainer.
const bareLinks = (markdown = '') => {
  return String(markdown).replace(SELF_LINKS, (whole, words, address) => {
    return unescape(words) === address ? address : whole;
  });
};

// What the editor writes, as it is kept: a link that reads as its own
// address bare, and no empty paragraphs at the end, which it writes as
// &nbsp; and which left a gap under the text.
const tidy = (markdown = '') => {
  return bareLinks(markdown)
    .replace(/(\s*&nbsp;\s*)+$/, '')
    .replace(/\s+$/, '');
};

export default {
  alone,
  bareLinks,
  tidy,
  isOurs,
  pagesIn,
  postAt,
  samePage,
};
