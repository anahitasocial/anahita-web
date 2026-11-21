/**
 * @jest-environment node
 */
/* eslint-env jest */
import rounder, { MAX_CORNER } from '../corners';

const theme = (borderRadius) => { return { shape: { borderRadius } }; };

describe('rounder', () => {
  it('is a few times the theme\'s corner', () => {
    expect(rounder(3)(theme(4))).toBe('12px');
    expect(rounder(2)(theme(0))).toBe('0px');
  });

  it('is never rounder than CORNER_RADIUS may be', () => {
    expect(rounder(3)(theme(16))).toBe(`${MAX_CORNER}px`);
  });
});
