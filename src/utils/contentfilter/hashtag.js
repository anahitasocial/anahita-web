import { Medium as MEDIUM } from '../../constants';

const baseURL = window.location.origin.toString();

// The letters of a hashtag, as the services find them
// (entities.HashtagRegexPattern).
const HASHTAG = /(^|\s)#([\w\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}]+)/gu;

// The hashtags in a text as links to their pages: only the first
// MEDIUM.MAX_HASHTAGS different ones, whatever their capitals, as the
// services file a post under. The rest are left as words.
const contentfilterHashtag = (text) => {
  const linked = new Set();

  return text.replace(HASHTAG, (match, before, tag) => {
    const alias = tag.toLowerCase();
    if (!linked.has(alias) && linked.size >= MEDIUM.MAX_HASHTAGS) {
      return match;
    }
    linked.add(alias);
    return `${before}[#${tag}](${baseURL}/hashtags/${alias}/)`;
  });
};

// The different hashtags in a text, whatever their capitals, in the order
// they are first written.
const hashtagsIn = (text = '') => {
  const found = [];
  Array.from(text.matchAll(HASHTAG)).forEach((match) => {
    const alias = match[2].toLowerCase();
    if (!found.includes(alias)) {
      found.push(alias);
    }
  });
  return found;
};

export { hashtagsIn };
export default contentfilterHashtag;
