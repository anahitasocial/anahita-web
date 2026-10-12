/**
 * @jest-environment node
 */
/* eslint-env jest */
import downloads from '../downloads';

const photo = (more = {}) => {
  return { id: 12, type: 'node.medium.photo-service.photo.v1', ...more };
};
const video = (more = {}) => {
  return { id: 30, type: 'node.medium.video-service.video.v1', ...more };
};
const note = { id: 5, type: 'node.medium.text-service.note.v1', authorized: { download: true } };

describe('downloading what a post holds', () => {
  it('is offered only where the server said so, on a post that holds a file', () => {
    expect(downloads.canDownload(photo({ authorized: { download: true } }))).toBe(true);
    expect(downloads.canDownload(video({ authorized: { download: true } }))).toBe(true);
    expect(downloads.canDownload(photo({ authorized: { download: false } }))).toBe(false);
    expect(downloads.canDownload(photo({ authorized: {} }))).toBe(false);
    expect(downloads.canDownload(photo())).toBe(false);
    expect(downloads.canDownload(note)).toBe(false);
    expect(downloads.canDownload(undefined)).toBe(false);
  });

  it('has one thing to download from a video or a single photo, and each image of several', () => {
    expect(downloads.partsOf(video())).toHaveLength(1);
    expect(downloads.partsOf(photo())).toHaveLength(1);
    expect(downloads.partsOf(photo({ files: [{ position: 0 }] }))).toHaveLength(1);
    expect(downloads.partsOf(photo({ files: [{ position: 0 }, { position: 1 }, { position: 2 }] })))
      .toEqual([
        { key: 'photo-0', query: '?file=0', number: 1 },
        { key: 'photo-1', query: '?file=1', number: 2 },
        { key: 'photo-2', query: '?file=2', number: 3 },
      ]);
    expect(downloads.partsOf(note)).toEqual([]);
  });

  it('is asked of the API, by the kind of post', () => {
    const several = photo({ files: [{ position: 0 }, { position: 1 }] });
    expect(downloads.urlOf(several, downloads.partsOf(several)[1], 'https://api.example/'))
      .toBe('https://api.example/photos/12/download?file=1');
    expect(downloads.urlOf(video(), downloads.partsOf(video())[0], 'https://api.example'))
      .toBe('https://api.example/videos/30/download');
  });

  it('has a switch only on a post that says whether it may be downloaded', () => {
    expect(downloads.hasSwitch(photo({ allowDownload: false }))).toBe(true);
    expect(downloads.hasSwitch(video({ allowDownload: true }))).toBe(true);
    expect(downloads.hasSwitch(photo())).toBe(false);
    expect(downloads.hasSwitch({ ...note, allowDownload: true })).toBe(false);
    expect(downloads.isForNamespace('photos')).toBe(true);
    expect(downloads.isForNamespace('videos')).toBe(true);
    expect(downloads.isForNamespace('notes')).toBe(false);
  });
});
