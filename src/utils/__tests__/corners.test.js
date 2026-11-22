/**
 * @jest-environment node
 */
/* eslint-env jest */
import { vi } from 'vitest';
import rounder, { MAX_CORNER, siteCorners } from '../corners';

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

describe('siteCorners', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is sm on a wider screen and md below 600 pixels, unless set', () => {
    expect(siteCorners(false)).toBe(4);
    expect(siteCorners(true)).toBe(8);
  });

  it('is the names the build gives, and the default for one it does not know', () => {
    vi.stubEnv('REACT_APP_CORNER_RADIUS', 'lg');
    vi.stubEnv('REACT_APP_CORNER_RADIUS_MOBILE', 'round');
    expect(siteCorners(false)).toBe(16);
    expect(siteCorners(true)).toBe(8);
  });
});
