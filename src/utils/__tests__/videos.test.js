/**
 * @jest-environment node
 */
/* eslint-env jest */
import videos from '../videos';

const video = {
  files: [
    { height: 360, width: 640, url: '/videos/7/files/360.mp4' },
    { height: 1080, width: 1920, url: '/videos/7/files/1080.mp4' },
    { height: 720, width: 1280, url: '/videos/7/files/720.mp4' },
  ],
};

describe('a video being sent', () => {
  it('is refused before any of it is sent when it could not be taken', () => {
    const info = { metadata: { videoUploads: true, videoMaxBytes: 1000 } };

    expect(videos.problem(undefined, info)).toBe('none');
    expect(videos.problem({ type: 'image/jpeg', size: 10 }, info)).toBe('notAVideo');
    expect(videos.problem({ type: 'image/webp', size: 10 }, info)).toBe('notAVideo');
    expect(videos.problem({ type: 'video/mp4', size: 1001 }, info)).toBe('tooLarge');
    expect(videos.problem({ type: 'video/mp4', size: 1000 }, info)).toBe('');
    expect(videos.problem({ type: 'VIDEO/QuickTime', size: 5 }, info)).toBe('');
    // Any video, as an iPhone hands it over when asked for any: the worker
    // reads what it is.
    expect(videos.problem({ type: 'video/x-m4v', size: 5 }, info)).toBe('');
    expect(videos.problem({ type: 'video/3gpp', size: 5 }, info)).toBe('');
    expect(videos.isOn(info)).toBe(true);
    expect(videos.isOn({ metadata: {} })).toBe(false);
    expect(videos.isOn(undefined)).toBe(false);
    expect(videos.maxBytes(undefined)).toBe(500 * 1024 * 1024);
    expect(videos.maxSeconds({ metadata: { videoMaxSeconds: 1200 } })).toBe(1200);
  });

  it('may be a GIF or an animated PNG, held to less than a video', () => {
    const info = {
      metadata: {
        videoUploads: true, videoMaxBytes: 1000, animationMaxBytes: 100, animationMaxSeconds: 20,
      },
    };

    expect(videos.isAnimation({ type: 'image/gif' })).toBe(true);
    expect(videos.isAnimation({ type: 'IMAGE/PNG' })).toBe(true);
    expect(videos.isAnimation({ type: 'video/mp4' })).toBe(false);
    expect(videos.problem({ type: 'image/gif', size: 100 }, info)).toBe('');
    expect(videos.problem({ type: 'image/gif', size: 101 }, info)).toBe('animationTooLarge');
    expect(videos.problem({ type: 'image/png', size: 50 }, info)).toBe('');
    // A video of the same size is taken.
    expect(videos.problem({ type: 'video/mp4', size: 101 }, info)).toBe('');
    expect(videos.animationMaxSeconds(info)).toBe(20);
    expect(videos.animationMaxBytes(undefined)).toBe(25 * 1024 * 1024);
    expect(videos.animationMaxSeconds(undefined)).toBe(30);
  });

  it('is cut into parts that cover it once', () => {
    expect(videos.partsOf(25, 10)).toEqual([
      { number: 1, start: 0, end: 10 },
      { number: 2, start: 10, end: 20 },
      { number: 3, start: 20, end: 25 },
    ]);
    expect(videos.partsOf(10, 10)).toEqual([{ number: 1, start: 0, end: 10 }]);
    expect(videos.partsOf(0, 10)).toEqual([]);
    expect(videos.partsOf(10, 0)).toEqual([]);
  });

  it('says how far along it is', () => {
    expect(videos.percent(0, 200)).toBe(0);
    expect(videos.percent(50, 200)).toBe(25);
    expect(videos.percent(300, 200)).toBe(100);
    expect(videos.percent(5, 0)).toBe(0);
    expect(videos.isInHand({ status: 'processing' })).toBe(true);
    expect(videos.isInHand({ status: 'ready' })).toBe(false);
    expect(videos.isInHand(undefined)).toBe(false);
  });
});

describe('a video being played', () => {
  it('starts at 720p, and smaller on a slow connection', () => {
    expect(videos.pick(video).height).toBe(720);
    expect(videos.pick(video, { slow: true }).height).toBe(360);
    expect(videos.isSlow({ saveData: true })).toBe(true);
    expect(videos.isSlow({ effectiveType: '3g' })).toBe(true);
    expect(videos.isSlow({ effectiveType: '4g' })).toBe(false);
    expect(videos.isSlow(undefined)).toBe(false);
  });

  it('plays the size chosen last time, or the nearest below it', () => {
    expect(videos.pick(video, { preferred: 1080 }).height).toBe(1080);
    expect(videos.pick(video, { preferred: 2160 }).height).toBe(1080);
    expect(videos.pick(video, { preferred: 480 }).height).toBe(360);
    expect(videos.pick(video, { preferred: 144 }).height).toBe(360);
    // A choice outweighs what the connection says.
    expect(videos.pick(video, { preferred: 1080, slow: true }).height).toBe(1080);
  });

  it('plays what there is of a small video', () => {
    expect(videos.pick({ files: [{ height: 360 }] }).height).toBe(360);
    expect(videos.pick({ files: [{ height: 1080 }] }).height).toBe(1080);
    expect(videos.pick({ files: [] })).toBe(null);
    expect(videos.pick(undefined)).toBe(null);
  });

  it('lists its sizes largest first, by name', () => {
    expect(videos.filesOf(video).map(videos.label)).toEqual(['1080p', '720p', '360p']);
    expect(videos.label({ height: 2160 })).toBe('4K');
  });

  it('reads its files from the API', () => {
    expect(videos.urlOf('/videos/7/files/720.mp4', 'https://api.example/')).toBe('https://api.example/videos/7/files/720.mp4');
    expect(videos.urlOf('', 'https://api.example')).toBe('');
  });

  it('says how long it is, and how big', () => {
    expect(videos.duration(65)).toBe('1:05');
    expect(videos.duration(760)).toBe('12:40');
    expect(videos.duration(3723)).toBe('1:02:03');
    expect(videos.duration(undefined)).toBe('0:00');
    expect(videos.megabytes(500 * 1024 * 1024)).toBe('500 MB');
    expect(videos.megabytes(1536 * 1024 * 1024)).toBe('1.5 GB');
  });
});
