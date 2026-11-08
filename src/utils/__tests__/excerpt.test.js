import excerpt from '../excerpt';

describe('excerpt', () => {
  it('draws a Markdown link as a link, not written out', () => {
    expect(excerpt('How to help someone change — the samurai guide [https://t.co/ZWg](https://t.co/ZWg)')).toEqual([
      { text: 'How to help someone change — the samurai guide ' },
      { text: 'https://t.co/ZWg', href: 'https://t.co/ZWg' },
    ]);
  });

  it('draws an address on its own as a link, and keeps the words around it', () => {
    expect(excerpt('Read https://rocinante.example/log first, *then* reply')).toEqual([
      { text: 'Read ' },
      { text: 'https://rocinante.example/log', href: 'https://rocinante.example/log' },
      { text: ' first, then reply' },
    ]);
  });

  it('is plain words when there is no link', () => {
    expect(excerpt('**Bold** words\n\nand more')).toEqual([{ text: 'Bold words and more' }]);
  });

  it('cuts at the length shown, across words and links', () => {
    const parts = excerpt('abcdef [ghijkl](https://x.example) mnop', 10);
    expect(parts).toEqual([
      { text: 'abcdef ' },
      { text: 'ghi…', href: 'https://x.example' },
    ]);
  });

  it('is nothing for nothing', () => {
    expect(excerpt('')).toEqual([]);
    expect(excerpt(null)).toEqual([]);
  });
});
