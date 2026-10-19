/* eslint-env jest */
import location from '../location';

// Who may add a location, as location-service's LOCATIONS_FROM decides it.
// A rendering hint: the point is that it agrees with the gate.

const person = (personType) => {
  return { id: 1, personType };
};

const GUEST = person('guest');
const REGISTERED = person('registered');
const ADMIN = person('administrator');
const SUPER_ADMIN = person('super-administrator');

describe('location.canAdd', () => {
  it('lets anybody signed in add one when set to registered', () => {
    expect(location.canAdd(GUEST, { locationsFrom: 'registered' })).toBe(false);
    expect(location.canAdd(REGISTERED, { locationsFrom: 'registered' })).toBe(true);
    expect(location.canAdd(ADMIN, { locationsFrom: 'registered' })).toBe(true);
  });

  it('keeps it to administrators when set so', () => {
    expect(location.canAdd(REGISTERED, { locationsFrom: 'administrators' })).toBe(false);
    expect(location.canAdd(ADMIN, { locationsFrom: 'administrators' })).toBe(true);
    expect(location.canAdd(SUPER_ADMIN, { locationsFrom: 'administrators' })).toBe(true);
  });

  it('offers it to nobody before NodeInfo has said', () => {
    expect(location.canAdd(SUPER_ADMIN, {})).toBe(false);
    expect(location.canAdd(SUPER_ADMIN)).toBe(false);
  });
});
