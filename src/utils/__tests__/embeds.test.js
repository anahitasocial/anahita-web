/* eslint-env jest */
import embeds from '../embeds';

const ORIGIN = 'https://example.org';

describe('embeds', () => {
  it('takes an address alone on its line, bare or in angle brackets', () => {
    expect(embeds.alone('  https://a.example/x ')).toBe('https://a.example/x');
    expect(embeds.alone('<https://a.example/x>')).toBe('https://a.example/x');
    expect(embeds.alone('see https://a.example/x')).toBe('');
    expect(embeds.alone('ftp://a.example/x')).toBe('');
    expect(embeds.alone('[https://a.example/x](https://a.example/x)')).toBe('https://a.example/x');
    expect(embeds.alone('[words](https://a.example/x)')).toBe('');
  });

  it('writes a link that reads as its own address as the bare address', () => {
    const md = '[https://a.example/x](https://a.example/x)\n\nA [link](https://b.example) and [https://c.example/a\\_b](https://c.example/a_b).';
    expect(embeds.bareLinks(md)).toBe('https://a.example/x\n\nA [link](https://b.example) and https://c.example/a_b.');
  });

  it('reads which post an address here is to', () => {
    expect(embeds.postAt('https://example.org/photos/12')).toEqual({ namespace: 'photos', kind: 'photo', id: 12 });
    expect(embeds.postAt('https://example.org/articles/40-a-title/')).toEqual({ namespace: 'articles', kind: 'article', id: 40 });
    expect(embeds.postAt('https://example.org/people/5')).toBe(null);
    expect(embeds.postAt('https://example.org/photos/')).toBe(null);
  });

  it('tells this installation from elsewhere', () => {
    expect(embeds.isOurs('https://example.org/photos/1', ORIGIN)).toBe(true);
    expect(embeds.isOurs('https://elsewhere.com/', ORIGIN)).toBe(false);
  });

  it('lists the pages elsewhere a text embeds, once each', () => {
    const text = 'Words.\nhttps://elsewhere.com/a\nhttps://example.org/photos/1\nhttps://elsewhere.com/a\nin https://elsewhere.com/b';
    expect(embeds.pagesIn(text, ORIGIN)).toEqual(['https://elsewhere.com/a']);
  });

  it('knows a page by its tidied address', () => {
    expect(embeds.samePage('https://Elsewhere.com/a#part', 'https://elsewhere.com/a')).toBe(true);
    expect(embeds.samePage('https://elsewhere.com/a', 'https://elsewhere.com/b')).toBe(false);
  });
});
