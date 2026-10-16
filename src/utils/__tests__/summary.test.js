/* eslint-env jest */
import summary from '../summary';

const ORIGIN = 'https://example.org';

const TEXT = [
  'An **opening** paragraph.',
  '',
  'https://example.org/photos/12',
  '',
  '```',
  'code that is not words',
  '```',
  '',
  'More words, and https://elsewhere.com in a sentence.',
  '',
  'https://example.org/videos/3',
  'https://example.org/photos/14',
  'https://elsewhere.com/page',
  'https://example.org/photos/12',
].join('\n');

describe('summary', () => {
  it('opens with the words, not the addresses alone or the code', () => {
    expect(summary.openingOf(TEXT)).toBe('An opening paragraph. More words, and https://elsewhere.com in a sentence.');
  });

  it('cuts a long opening at a word', () => {
    const opening = summary.openingOf('word '.repeat(100), 30);
    expect(opening.endsWith('word…')).toBe(true);
    expect(opening.length).toBeLessThanOrEqual(31);
  });

  it('counts what is in it, each once', () => {
    const contents = summary.contentsOf(TEXT, ORIGIN);
    expect(contents).toEqual({
      photos: 2, videos: 1, citations: 4, firstPhoto: { namespace: 'photos', kind: 'photo', id: 12 },
    });
  });
});
