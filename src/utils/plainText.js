// A post's Markdown as plain words, for a short excerpt where the Markdown
// is not drawn: "[@julian](https://…) said" becomes "@julian said", not the
// link written out. Pictures go, emphasis marks and headings' hashes go,
// and spaces and line breaks become single spaces.
const plainText = (markdown = '') => {
  return String(markdown || '')
    // Pictures, then links: their words, not their addresses.
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    // Any HTML that came with a post from elsewhere.
    .replace(/<[^>]+>/g, ' ')
    // Code, emphasis and strike marks.
    .replace(/`{1,3}([^`]*)`{1,3}/g, '$1')
    .replace(/(\*\*|__|\*|_|~~)(\S(?:.*?\S)?)\1/g, '$2')
    // Headings, quotes and list marks at the start of a line.
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export default plainText;
