import warnings from '../warnings';

describe('warnings.hasMedia', () => {
  it('lies over the pictures of a photo post, and its words are shown', () => {
    expect(warnings.hasMedia({ type: 'com.anahita.medium.photo.v1', files: [{ id: 1 }] })).toBe(true);
  });

  it('lies over a video, a GIF or a sound', () => {
    expect(warnings.hasMedia({ type: 'com.anahita.medium.video.v1', video: {} })).toBe(true);
    expect(warnings.hasMedia({ type: 'com.anahita.medium.audio.v1', audio: {} })).toBe(true);
  });

  it('lies over the whole of a post of words alone', () => {
    expect(warnings.hasMedia({ type: 'com.anahita.medium.note.v1', content: 'Words' })).toBe(false);
    expect(warnings.hasMedia(null)).toBe(false);
  });

  it('lies over the whole of an article or a topic, whose words may hold pictures', () => {
    expect(warnings.hasMedia({ type: 'com.anahita.medium.article.v1', files: [{ id: 1 }] })).toBe(false);
    expect(warnings.hasMedia({ type: 'com.anahita.medium.topic.v1' })).toBe(false);
  });
});
