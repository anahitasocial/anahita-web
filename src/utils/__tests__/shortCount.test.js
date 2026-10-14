/**
 * @jest-environment node
 */
/* eslint-env jest */
import shortCount from '../shortCount';

describe('a short count', () => {
  it('stays as it is while it is small', () => {
    expect(shortCount(0)).toBe('0');
    expect(shortCount(515)).toBe('515');
  });

  it('is shortened when it is not', () => {
    expect(shortCount(1240)).toBe('1.2K');
    expect(shortCount(48210)).toBe('48K');
    expect(shortCount(3100000)).toBe('3.1M');
  });

  it('is nothing worse than a number when it is not one', () => {
    expect(shortCount(undefined)).toBe('0');
    expect(shortCount('12')).toBe('12');
  });
});
