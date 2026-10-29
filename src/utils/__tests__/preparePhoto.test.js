/* eslint-env jest */
import { LONGEST, renamed, sizeFor } from '../preparePhoto';

describe('the size a photo is sent at', () => {
  it('is its own when it is no larger than is kept', () => {
    expect(sizeFor(1600, 1200)).toEqual({ width: 1600, height: 1200, scaled: false });
    expect(sizeFor(LONGEST, 100)).toEqual({ width: LONGEST, height: 100, scaled: false });
  });

  it('scales a phone\'s photo down to the longest side kept', () => {
    expect(sizeFor(4032, 3024)).toEqual({ width: 2048, height: 1536, scaled: true });
    expect(sizeFor(3024, 4032)).toEqual({ width: 1536, height: 2048, scaled: true });
  });
});

describe('the name a photo is sent under', () => {
  it('says what it now is', () => {
    expect(renamed('IMG_0042.HEIC', 'image/jpeg')).toBe('IMG_0042.jpg');
    expect(renamed('screen.png', 'image/png')).toBe('screen.png');
    expect(renamed('', 'image/jpeg')).toBe('photo.jpg');
  });
});
