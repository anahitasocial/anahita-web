import photoFiles from './photoFiles';

// A post from elsewhere whose video is not kept here: one picture, the
// video's poster, and its words ending with the line that leads to it,
// "▶ [bsky.app](page)", as anahita-libs/federation WithVideoLink writes it.
// Such a post shows the poster with a play button that goes there, and its
// words without the line (components/VideoElsewhere.jsx).
const LINE = /(?:^|\n+)[ \t]*▶[︎️]?[ \t]*\[([^\]\n]*)\]\((https:\/\/[^)\s]+)\)\s*$/;

// What the post shows in place of its picture and its last line, or null
// for any other post: `{ page, site, content }`.
const of = (node) => {
  if (!node || typeof node.content !== 'string' || photoFiles.countOf(node) !== 1) {
    return null;
  }
  const found = LINE.exec(node.content);
  if (!found) {
    return null;
  }
  return {
    site: found[1],
    page: found[2],
    content: node.content.slice(0, found.index).trimEnd(),
  };
};

export default {
  of,
};
