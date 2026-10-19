/* eslint-env jest */
import photoPosition from '../photoPosition';

// exifr itself is not under test: what it mockAnswers for each file is.
const mockAnswers = new Map();
jest.mock('exifr', () => {
  return {
    gps: (file) => {
      if (mockAnswers.get(file) === 'throws') {
        return Promise.reject(new Error('unreadable'));
      }
      return Promise.resolve(mockAnswers.get(file));
    },
  };
});

// A photo as the browser gives it: its start is read, and stands for it
// here.
const image = (name) => {
  const photo = { name, type: 'image/jpeg' };
  photo.slice = () => {
    return { arrayBuffer: () => { return Promise.resolve(photo); } };
  };
  return photo;
};

describe('photoPosition.read', () => {
  it('is the first position among the photos, to four decimals', async () => {
    const none = image('none.jpg');
    const broken = image('broken.jpg');
    const placed = image('placed.jpg');
    mockAnswers.set(none, undefined);
    mockAnswers.set(broken, 'throws');
    mockAnswers.set(placed, { latitude: 49.28691234, longitude: -123.14304321 });
    await expect(photoPosition.read([none, broken, placed]))
      .resolves.toEqual({ latitude: 49.2869, longitude: -123.143 });
  });

  it('is nothing for no photo, no position, or a point at 0, 0', async () => {
    const zero = image('zero.jpg');
    mockAnswers.set(zero, { latitude: 0, longitude: 0 });
    await expect(photoPosition.read([])).resolves.toBe(null);
    await expect(photoPosition.read([{ name: 'clip.mp4', type: 'video/mp4' }])).resolves.toBe(null);
    await expect(photoPosition.read([zero])).resolves.toBe(null);
  });
});
