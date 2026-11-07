/* eslint-env jest */
// The profile page draws a profile only when it is the one the address asks
// for: never the one before it, while the new one is on its way.
import { isProfileAsked } from '..';

describe('isProfileAsked', () => {
  const worf = { id: 12, alias: 'worf' };

  it('is the profile asked for by its id', () => {
    expect(isProfileAsked(worf, '12', 'groups')).toBe(true);
    expect(isProfileAsked(worf, 12, 'events')).toBe(true);
  });

  it('is a person asked for by their alias, in any capitals', () => {
    expect(isProfileAsked(worf, 'worf', 'people')).toBe(true);
    expect(isProfileAsked(worf, 'Worf', 'people')).toBe(true);
  });

  it('is not the profile before, while another is asked for', () => {
    expect(isProfileAsked(worf, 'jeanluc', 'people')).toBe(false);
    expect(isProfileAsked(worf, '13', 'groups')).toBe(false);
  });

  it('matches an alias only for people', () => {
    expect(isProfileAsked(worf, 'worf', 'groups')).toBe(false);
  });

  it('is not anything when there is no profile yet', () => {
    expect(isProfileAsked({}, 'worf', 'people')).toBe(false);
    expect(isProfileAsked(null, 'worf', 'people')).toBe(false);
    expect(isProfileAsked(worf, '', 'people')).toBe(false);
  });
});
