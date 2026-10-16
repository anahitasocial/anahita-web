/* eslint-env jest */
import composer from '../composer';

describe('what a post becomes', () => {
  it('is a note when it is words alone', () => {
    expect(composer.kindOf({})).toBe('note');
  });

  it('is a photo post when it has pictures, words or not', () => {
    expect(composer.kindOf({ hasPhotos: true })).toBe('photo');
  });

  it('is a video post when it has a video', () => {
    expect(composer.kindOf({ hasVideo: true })).toBe('video');
  });
});

describe('whether there is something to post', () => {
  it('needs more than spaces', () => {
    expect(composer.canPost({ text: '   ' })).toBe(false);
  });

  it('takes words where the profile takes notes', () => {
    expect(composer.canPost({ text: 'Hello' })).toBe(true);
  });

  it('does not take words alone where it does not', () => {
    expect(composer.canPost({ text: 'Hello', takesNotes: false })).toBe(false);
  });

  it('takes pictures only once they are all stored', () => {
    expect(composer.canPost({ photosReady: false })).toBe(false);
    expect(composer.canPost({ photosReady: true, takesNotes: false })).toBe(true);
  });

  it('takes a video with nothing written', () => {
    expect(composer.canPost({ hasVideo: true })).toBe(true);
  });
});
