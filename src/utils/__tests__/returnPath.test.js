/* eslint-env jest */
import returnPath from '../returnPath';

describe('returnPath', () => {
  it('keeps a path on this site, with its query and fragment', () => {
    expect(returnPath('/settings/security')).toBe('/settings/security');
    expect(returnPath('/@worf?tab=photos#top')).toBe('/@worf?tab=photos#top');
  });

  it('goes home with nothing to go by', () => {
    expect(returnPath(null)).toBe('/');
    expect(returnPath('')).toBe('/');
  });

  it('refuses an address on another site', () => {
    expect(returnPath('https://elsewhere.example/')).toBe('/');
    expect(returnPath('//elsewhere.example/')).toBe('/');
    expect(returnPath('/\\elsewhere.example/')).toBe('/');
    expect(returnPath('/\t/elsewhere.example/')).toBe('/');
  });

  it('refuses what would run', () => {
    // eslint-disable-next-line no-script-url
    expect(returnPath('javascript:alert(1)')).toBe('/');
    expect(returnPath('data:text/html,<script>alert(1)</script>')).toBe('/');
  });
});
