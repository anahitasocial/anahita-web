/**
 * @jest-environment node
 */
/* eslint-env jest */
import previews from '../linkPreviews';

describe('the card a note carries for a link', () => {
  it('is for the first link in it, without what follows it in a sentence', () => {
    expect(previews.firstURL('Read https://example.org/heap. Then http://b.example/')).toBe('https://example.org/heap');
    expect(previews.firstURL('(see https://example.org/a?b=1&c=2)')).toBe('https://example.org/a?b=1&c=2');
    expect(previews.firstURL('nothing here')).toBe('');
    expect(previews.firstURL(undefined)).toBe('');
  });

  it('is not asked for where a player is shown', () => {
    expect(previews.urlToPreview('Watch https://www.youtube.com/watch?v=abc')).toBe('');
    expect(previews.urlToPreview('Read https://example.org/heap')).toBe('https://example.org/heap');
    expect(previews.isShown({ url: 'https://example.org/', title: 'A' }, 'https://vimeo.com/1')).toBe(false);
    expect(previews.isShown({ url: 'https://example.org/', title: 'A' }, 'https://example.org/')).toBe(true);
    expect(previews.isShown(undefined, 'https://example.org/')).toBe(false);
    expect(previews.isShown({ url: 'https://example.org/' }, '')).toBe(false);
  });

  it('reads its picture from this installation', () => {
    const preview = { image: '/link-previews/image/abc.jpg' };
    expect(previews.imageOf(preview, 'https://api.example/')).toBe('https://api.example/link-previews/image/abc.jpg');
    expect(previews.imageOf(preview, '')).toBe('/link-previews/image/abc.jpg');
    expect(previews.imageOf({}, 'https://api.example')).toBe('');
  });

  it('names the site by its host where the page did not', () => {
    expect(previews.siteOf({ siteName: 'The Allotment', url: 'https://example.org/' })).toBe('The Allotment');
    expect(previews.siteOf({ url: 'https://www.example.org/heap' })).toBe('example.org');
    expect(previews.siteOf({ url: 'not an address' })).toBe('');
  });
});
