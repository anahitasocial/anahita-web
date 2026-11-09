/**
 * @jest-environment node
 */
/* eslint-env jest */
import audio from '../audio';
import embeds from '../embeds';
import customFeeds from '../customFeeds';

const file = (type, size = 1024) => {
  return { type, size };
};

describe('audio posts', () => {
  it('takes the sounds the server takes', () => {
    expect(audio.isAudioType(file('audio/mpeg'))).toBe(true);
    expect(audio.isAudioType(file('audio/x-m4a'))).toBe(true);
    expect(audio.isAudioType(file('video/mp4'))).toBe(false);
    expect(audio.isAudioType(null)).toBe(false);
    expect(audio.PICKER.split(',')).toEqual(audio.TYPES);
  });

  it('says why a sound cannot be sent', () => {
    expect(audio.problem(null)).toBe('none');
    expect(audio.problem(file('image/png'))).toBe('notAudio');
    expect(audio.problem(file('audio/flac', 501 * 1024 * 1024))).toBe('tooLarge');
    expect(audio.problem(file('audio/flac', 2 * 1024 * 1024), { metadata: { audioMaxBytes: 1024 * 1024 } }))
      .toBe('tooLarge');
    expect(audio.problem(file('audio/ogg'))).toBe('');
  });

  it('holds to an hour unless the installation says otherwise', () => {
    expect(audio.maxSeconds()).toBe(3600);
    expect(audio.maxSeconds({ metadata: { audioMaxSeconds: 600 } })).toBe(600);
  });

  it('reads what a post plays, or nothing', () => {
    expect(audio.of({ audio: { url: '/videos/3/files/audio.m4a' } })).toEqual({ url: '/videos/3/files/audio.m4a' });
    expect(audio.of({ video: {} })).toBe(null);
  });

  it('is shown from its address here, read from video-service', () => {
    expect(embeds.postAt('https://example.org/audio/7-a-talk/'))
      .toEqual({ namespace: 'videos', kind: 'audio', id: 7 });
  });

  it('is a kind a custom feed can show, after video', () => {
    const kinds = customFeeds.MEDIA_TYPES;
    expect(kinds.indexOf('audio')).toBe(kinds.indexOf('video') + 1);
  });
});

describe('the installation\'s switches', () => {
  it('takes audio posts unless it says not, and records only where it says so', () => {
    expect(audio.isOn({ metadata: {} })).toBe(true);
    expect(audio.isOn({ metadata: { audioUploads: false } })).toBe(false);
    expect(audio.recordingOn({ metadata: {} })).toBe(false);
    expect(audio.recordingOn({ metadata: { audioRecording: true } })).toBe(true);
  });
});
