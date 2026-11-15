/* eslint-env jest */
import passkeyOffer from '../passkeyOffer';

// THE RULE THIS GUARDS (roadmap row 153): a passkey is offered once, right
// after signing in, to somebody past onboarding, on a device that can hold
// one, who has none and has not skipped it here; and never otherwise.
describe('decide', () => {
  const ready = {
    due: true,
    viewerId: 7,
    onboarding: false,
    skipped: false,
    hasPlatform: true,
    passkeyCount: 0,
  };

  it('asks when everything holds', () => {
    expect(passkeyOffer.decide(ready)).toBe('ask');
  });

  it('never asks without a sign-in that just finished', () => {
    expect(passkeyOffer.decide({ ...ready, due: false })).toBe('never');
  });

  it('waits through onboarding, and for who it is', () => {
    expect(passkeyOffer.decide({ ...ready, onboarding: true })).toBe('wait');
    expect(passkeyOffer.decide({ ...ready, viewerId: 0 })).toBe('wait');
  });

  it('waits until the device and the passkeys are known', () => {
    expect(passkeyOffer.decide({ ...ready, hasPlatform: undefined })).toBe('wait');
    expect(passkeyOffer.decide({ ...ready, passkeyCount: undefined })).toBe('wait');
  });

  it('never asks on a device without its own authenticator, with a passkey, or once skipped', () => {
    expect(passkeyOffer.decide({ ...ready, hasPlatform: false })).toBe('never');
    expect(passkeyOffer.decide({ ...ready, passkeyCount: 1 })).toBe('never');
    expect(passkeyOffer.decide({ ...ready, skipped: true })).toBe('never');
  });
});

describe('storage', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  it('is due once a sign-in finishes, until cleared', () => {
    expect(passkeyOffer.isDue()).toBe(false);
    passkeyOffer.markDue();
    expect(passkeyOffer.isDue()).toBe(true);
    passkeyOffer.clearDue();
    expect(passkeyOffer.isDue()).toBe(false);
  });

  it('keeps a skip for that person alone', () => {
    passkeyOffer.skip(7);
    expect(passkeyOffer.isSkipped(7)).toBe(true);
    expect(passkeyOffer.isSkipped(8)).toBe(false);
  });
});
