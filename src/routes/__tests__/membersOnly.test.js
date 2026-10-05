/* eslint-env jest */
import membersOnly from '../membersOnly';

const { isOpen } = membersOnly;

// What somebody who is not signed in can still open on a members-only
// site: the ways in, and the pages about the site itself.
describe('members-only gate', () => {
  it('leaves the ways in open', () => {
    ['/', '/auth', '/auth/signup', '/oauth/callback'].forEach((path) => {
      expect(isOpen(path)).toBe(true);
    });
  });

  it('leaves the pages about the site open', () => {
    ['/about', '/support', '/legal/tos', '/legal/privacy', '/pages/tos'].forEach((path) => {
      expect(isOpen(path)).toBe(true);
    });
  });

  it('closes everything a member wrote', () => {
    [
      '/people/ada', '/groups/12-gardeners', '/notes/100', '/photos/7',
      '/hashtags/seeds', '/locations/3', '/search', '/blogs', '/pages/anything',
    ].forEach((path) => {
      expect(isOpen(path)).toBe(false);
    });
  });

  // A prefix is a path segment, not a string: /authors is not /auth.
  it('matches whole segments', () => {
    expect(isOpen('/authors')).toBe(false);
    expect(isOpen('/aboutus')).toBe(false);
  });
});
