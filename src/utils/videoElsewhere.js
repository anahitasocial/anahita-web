import photoFiles from './photoFiles';

// A post from elsewhere whose video is not kept here: one picture, the
// video's poster, and its words ending with the line that leads to it,
// "▶ [bsky.app](page)", as anahita-libs/federation WithVideoLink writes it.
// Such a post shows the poster with a play button that goes there, and its
// words without the line (components/VideoElsewhere.jsx).
const LINE = /(?:^|\n+)[ \t]*▶[︎️]?[ \t]*\[([^\]\n]*)\]\((https:\/\/[^)\s]+)\)\s*$/;

// What the post shows in place of its picture and its last line, or null
// for any other post: `{ kind, page, site, content }`. A post that says
// what it carries (`mediaElsewhere`, roadmap row 120) is played here once
// asked for; one kept before that is read from its last line, and leads
// there.
const of = (node) => {
  if (!node || typeof node.content !== 'string') {
    return null;
  }
  const found = LINE.exec(node.content);
  const content = found ? node.content.slice(0, found.index).trimEnd() : node.content;
  const said = node.mediaElsewhere;
  if (said && said.page) {
    return {
      kind: said.kind || 'video',
      site: said.site || (found && found[1]) || '',
      page: said.page,
      content,
    };
  }
  if (!found || photoFiles.countOf(node) !== 1) {
    return null;
  }
  return {
    kind: 'video',
    site: found[1],
    page: found[2],
    content,
  };
};

export default {
  of,
};
