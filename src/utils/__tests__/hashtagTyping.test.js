/* eslint-env jest */
import {
  typedHashtag, putHashtag, isFull, appendHashtag,
} from '../hashtagTyping';

describe('typedHashtag', () => {
  it('is what follows the # being typed', () => {
    expect(typedHashtag('Hello #ana')).toBe('ana');
    expect(typedHashtag('#')).toBe('');
    expect(typedHashtag('line\n#école')).toBe('école');
  });

  it('is null away from one', () => {
    expect(typedHashtag('Hello #ana ')).toBeNull();
    expect(typedHashtag('a#b')).toBeNull();
    expect(typedHashtag('')).toBeNull();
  });
});

describe('putHashtag', () => {
  it('puts the hashtag in place of what was typed, a space after it', () => {
    expect(putHashtag('Hi #ana', 7, 'anahita')).toEqual({ text: 'Hi #anahita ', caret: 12 });
  });

  it('takes the rest of a word the caret is in, and keeps a space after it', () => {
    expect(putHashtag('Hi #anxx there', 6, 'anahita')).toEqual({ text: 'Hi #anahita there', caret: 12 });
  });

  it('leaves the text alone away from a hashtag', () => {
    expect(putHashtag('Hi ana', 6, 'anahita')).toEqual({ text: 'Hi ana', caret: 6 });
  });
});

describe('isFull', () => {
  const ten = '#a1 #a2 #a3 #a4 #a5 #a6 #a7 #a8 #a9 #a10';

  it('is false under ten', () => {
    expect(isFull('#a1 #ne', 7, 'ne')).toBe(false);
  });

  it('is true for an eleventh, not for one of the ten again', () => {
    expect(isFull(`${ten} #ne`, ten.length + 4, 'ne')).toBe(true);
    expect(isFull(`${ten} #A1`, ten.length + 4, 'A1')).toBe(false);
  });
});

describe('appendHashtag', () => {
  it('adds to a last line of hashtags, or on a line of its own', () => {
    expect(appendHashtag('Words.\n\n#one', 'two')).toBe('Words.\n\n#one #two');
    expect(appendHashtag('Words.\n', 'two')).toBe('Words.\n\n#two');
    expect(appendHashtag('', 'two')).toBe('#two');
  });
});
