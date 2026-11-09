import { describe, expect, it } from 'vitest';

import threadNotes from '../threadNotes';

const stored = {
  key: 'a', uploadId: 7, status: 'ready', altText: ' Ceres ',
};
const sending = {
  key: 'b', uploadId: 8, status: 'uploading', altText: '',
};

describe('threadNotes', () => {
  it('says something with words or with pictures', () => {
    expect(threadNotes.hasSomething(threadNotes.make('  '))).toBe(false);
    expect(threadNotes.hasSomething(threadNotes.make('Tycho Station'))).toBe(true);
    expect(threadNotes.hasSomething({ words: '', photos: [stored] })).toBe(true);
  });

  it('waits for its pictures to be stored', () => {
    expect(threadNotes.isReady(threadNotes.make('Words alone'))).toBe(true);
    expect(threadNotes.isReady({ words: '', photos: [stored] })).toBe(true);
    expect(threadNotes.isReady({ words: '', photos: [stored, sending] })).toBe(false);
  });

  it('is sent with its card\'s link, but not beside pictures', () => {
    const address = 'https://example.org/tycho';
    expect(threadNotes.toPart({ words: address, photos: [], linkPreviewUrl: address }, 'en'))
      .toEqual({ content: address, language: 'en', linkPreviewUrl: address });
    expect(threadNotes.toPart({ words: address, photos: [stored], linkPreviewUrl: address }, 'en'))
      .not.toHaveProperty('linkPreviewUrl');
  });

  it('is sent with its uploads only when it has pictures', () => {
    expect(threadNotes.toPart(threadNotes.make(' On the Canterbury '), 'en')).toEqual({ content: 'On the Canterbury', language: 'en' });
    expect(threadNotes.toPart({ words: '', photos: [stored] }, 'en')).toEqual({
      content: '', language: 'en', uploads: [{ uploadId: 7, altText: 'Ceres' }],
    });
  });

  it('says something with a file alone', () => {
    expect(threadNotes.hasSomething({ words: ' ', photos: [], video: { name: 'tycho.mp4' } })).toBe(true);
  });

  it('is cut where its files are', () => {
    const words = (said) => { return { ...threadNotes.make(said) }; };
    const clip = (said) => { return { ...threadNotes.make(said), video: { name: `${said}.mp4` } }; };
    const [one, two, three, four, five] = [words('one'), words('two'), clip('three'), words('four'), clip('five')];

    expect(threadNotes.cut([one, two])).toBeNull();
    expect(threadNotes.cut([one, two, three, four, five])).toEqual({
      before: [one, two],
      segments: [{ note: three, after: [four] }, { note: five, after: [] }],
    });
    // A file in the first note: nothing is made before it.
    expect(threadNotes.cut([three, one])).toEqual({
      before: [],
      segments: [{ note: three, after: [one] }],
    });
  });
});
