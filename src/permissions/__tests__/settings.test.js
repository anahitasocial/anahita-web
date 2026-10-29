/* eslint-env jest */
import settings from '../settings';

// Who opens Site settings, and what of it (the user, 2026-10-29): super
// administrators all of it, administrators the Fediverse tab alone, for
// the accounts refused one by one; the servers stay super administrators'.
// Mirrors activitypub-service's checks, which decide.

const person = (personType) => {
  return { id: 1, personType };
};

const REGISTERED = person('registered');
const ADMIN = person('administrator');
const SUPER_ADMIN = person('super-administrator');

describe('settings', () => {
  it('opens to administrators and super administrators only', () => {
    expect(settings.canBrowse(REGISTERED)).toBe(false);
    expect(settings.canBrowse(ADMIN)).toBe(true);
    expect(settings.canBrowse(SUPER_ADMIN)).toBe(true);
  });

  it('shows an administrator the Fediverse tab alone', () => {
    expect(settings.canBrowseTab(ADMIN, 'fediverse')).toBe(true);
    expect(settings.canBrowseTab(ADMIN, 'privacy')).toBe(false);
    expect(settings.canBrowseTab(ADMIN, 'oauthClients')).toBe(false);
    expect(settings.canBrowseTab(SUPER_ADMIN, 'oauthClients')).toBe(true);
    expect(settings.canBrowseTab(REGISTERED, 'fediverse')).toBe(false);
  });

  it('keeps the servers to super administrators', () => {
    expect(settings.canRefuseServers(ADMIN)).toBe(false);
    expect(settings.canRefuseServers(SUPER_ADMIN)).toBe(true);
  });
});
