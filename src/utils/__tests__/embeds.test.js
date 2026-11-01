/* eslint-env jest */
import embeds, { withoutEndingSpaces } from '../embeds';

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

  it('reads which profile an address here is to', () => {
    expect(embeds.profileAt('https://example.org/@anahita-project')).toEqual({ alias: 'anahita-project' });
    expect(embeds.profileAt('https://example.org/@ana/photos')).toEqual({ alias: 'ana' });
    expect(embeds.profileAt('https://example.org/@alice@mastodon.example')).toEqual({ alias: 'alice@mastodon.example' });
    expect(embeds.profileAt('https://example.org/photos/12')).toBe(null);
  });

  it('tells this installation from elsewhere', () => {
    expect(embeds.isOurs('https://example.org/photos/1', ORIGIN)).toBe(true);
    expect(embeds.isOurs('https://elsewhere.com/', ORIGIN)).toBe(false);
  });

  it('lists the pages elsewhere a text embeds, once each', () => {
    const text = 'Words.\nhttps://elsewhere.com/a\nhttps://example.org/photos/1\nhttps://elsewhere.com/a\nin https://elsewhere.com/b';
    expect(embeds.pagesIn(text, ORIGIN)).toEqual(['https://elsewhere.com/a']);
  });

  it('leaves no empty paragraphs at the end', () => {
    expect(embeds.tidy('Words.\n\n&nbsp;\n\n&nbsp;\n')).toBe('Words.');
    expect(embeds.tidy('A\n\n&nbsp;\n\nB')).toBe('A\n\n&nbsp;\n\nB');
  });

  it('knows a page by its tidied address', () => {
    expect(embeds.samePage('https://Elsewhere.com/a#part', 'https://elsewhere.com/a')).toBe(true);
    expect(embeds.samePage('https://elsewhere.com/a', 'https://elsewhere.com/b')).toBe(false);
  });
});

describe('withoutEndingSpaces', () => {
  it('takes the &nbsp; at the end, and the spaces among them', () => {
    expect(withoutEndingSpaces('words &nbsp;  &nbsp;\n')).toBe('words');
    expect(withoutEndingSpaces('words&nbsp;&nbsp;')).toBe('words');
  });

  it('leaves text with none at its end as it is', () => {
    expect(withoutEndingSpaces('words  ')).toBe('words  ');
    expect(withoutEndingSpaces('a &nbsp; b')).toBe('a &nbsp; b');
    expect(withoutEndingSpaces()).toBe('');
  });

  it('does not stall on a long run of spaces', () => {
    const started = Date.now();
    expect(withoutEndingSpaces(`${' '.repeat(100000)}x`)).toHaveLength(100001);
    expect(withoutEndingSpaces(`x${' &nbsp;'.repeat(20000)}`)).toBe('x');
    expect(Date.now() - started).toBeLessThan(1000);
  });
});
