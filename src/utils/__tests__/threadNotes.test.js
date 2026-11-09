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

  it('is sent with its uploads only when it has pictures', () => {
    expect(threadNotes.toPart(threadNotes.make(' On the Canterbury '), 'en')).toEqual({ content: 'On the Canterbury', language: 'en' });
    expect(threadNotes.toPart({ words: '', photos: [stored] }, 'en')).toEqual({
      content: '', language: 'en', uploads: [{ uploadId: 7, altText: 'Ceres' }],
    });
  });
});
