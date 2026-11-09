import threadSplit from '../threadSplit';

describe('a thread\'s limit (roadmap row 126)', () => {
  it('is 500 wherever the post goes (roadmap row 144)', () => {
    expect(threadSplit.limitFor({ goesToBluesky: true, goesToFediverse: true })).toBe(500);
    expect(threadSplit.limitFor({})).toBe(500);
  });

  it('counts a link as 23, and a Markdown link as its words, as the server does', () => {
    const address = `https://example.org/${'a'.repeat(200)}`;
    expect(threadSplit.lengthOf(`See ${address}`)).toBe(4 + 23);
    expect(threadSplit.lengthOf('Read [the log](https://example.org/a/very/long/path) now')).toBe(5 + 7 + 4);
  });

  it('keeps a long link whole, and in the note it fits by its count', () => {
    const address = `https://example.org/${'a'.repeat(300)}`;
    const words = `${'Ceres station. '.repeat(20)}${address} and on.`;
    const notes = threadSplit.split(words, 500);
    expect(notes).toHaveLength(1);
    const longer = `${'Tycho station. '.repeat(30)}${address} at the end.`;
    const parts = threadSplit.split(longer, 300);
    expect(parts.some((note) => { return note.includes(address); })).toBe(true);
    parts.forEach((note) => { expect(threadSplit.lengthOf(note)).toBeLessThanOrEqual(300); });
  });

  it('counts an emoji as one', () => {
    expect(threadSplit.lengthOf('tea 🍵')).toBe(5);
  });
});

describe('long words split into a thread', () => {
  const sentence = (n) => {
    return `Sentence number ${n} is here.`;
  };

  it('leaves words within the limit as one note', () => {
    expect(threadSplit.split('Short words.', 300)).toEqual(['Short words.']);
  });

  it('breaks at the last paragraph that fits', () => {
    const first = 'a'.repeat(150);
    const second = 'b'.repeat(200);
    expect(threadSplit.split(`${first}\n\n${second}`, 300)).toEqual([first, second]);
  });

  it('then at the last sentence, and every note is within the limit', () => {
    const words = Array.from({ length: 30 }, (each, i) => { return sentence(i); }).join(' ');
    const notes = threadSplit.split(words, 100);
    expect(notes.length).toBeGreaterThan(1);
    notes.forEach((note) => {
      expect(threadSplit.lengthOf(note)).toBeLessThanOrEqual(100);
      expect(note.endsWith('.')).toBe(true);
    });
    expect(notes.join(' ')).toBe(words);
  });

  it('then at a space, and never inside a link', () => {
    const link = '[the garden notes](https://example.org/garden)';
    const words = `${'word '.repeat(10)}${link} ${'more '.repeat(10)}`.trim();
    const notes = threadSplit.split(words, 60);
    expect(notes.some((note) => { return note.includes(link); })).toBe(true);
    notes.forEach((note) => {
      expect(threadSplit.lengthOf(note)).toBeLessThanOrEqual(60);
    });
  });

  it('cuts a word longer than a note', () => {
    expect(threadSplit.split('x'.repeat(250), 100)).toEqual(['x'.repeat(100), 'x'.repeat(100), 'x'.repeat(50)]);
  });

  it('says nothing when the words would make more than ten notes', () => {
    expect(threadSplit.split('word '.repeat(400), 100)).toBe(null);
  });
});
