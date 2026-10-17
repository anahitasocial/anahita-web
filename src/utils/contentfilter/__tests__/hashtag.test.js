/* eslint-env jest */
import hashtag, { hashtagsIn } from '../hashtag';

const origin = window.location.origin.toString();
const link = (name) => {
  return `[#${name}](${origin}/hashtags/${name.toLowerCase()}/)`;
};

describe('the hashtag filter', () => {
  it('links a hashtag and keeps what was before it', () => {
    expect(hashtag('#Seeds grow')).toBe(`${link('Seeds')} grow`);
    expect(hashtag('one\n#seeds')).toBe(`one\n${link('seeds')}`);
    expect(hashtag('not a#b')).toBe('not a#b');
  });

  it('links only the first ten different ones', () => {
    const tags = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'a10'];
    const text = `${tags.map((tag) => { return `#${tag}`; }).join(' ')} #A1 #a11`;
    const linked = `${tags.map(link).join(' ')} ${link('A1')} #a11`;
    expect(hashtag(text)).toBe(linked);
  });
});

describe('hashtagsIn', () => {
  it('lists each once, as first written', () => {
    expect(hashtagsIn('#Seeds and #seeds, #rain')).toEqual(['seeds', 'rain']);
    expect(hashtagsIn('')).toEqual([]);
  });
});
