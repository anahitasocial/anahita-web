/* eslint-env jest */
import onboarding from '../onboarding';

const { hasAvatar, hasIncompleteProfile, needsOnboarding } = onboarding;

const avatarUrls = { large: { url: 'https://example.com/a.png' } };

describe('hasAvatar', () => {
  // The default viewer carries an empty object, which is truthy.
  it('does not read an empty object as an avatar', () => {
    expect(hasAvatar({ avatarUrls: {} })).toBe(false);
    expect(hasAvatar({ avatarUrls: { large: { url: '' } } })).toBe(false);
    expect(hasAvatar({})).toBe(false);
  });

  it('reads any size with a URL as an avatar', () => {
    expect(hasAvatar({ avatarUrls })).toBe(true);
  });
});

describe('hasIncompleteProfile', () => {
  it('is incomplete without an avatar or without a bio', () => {
    expect(hasIncompleteProfile({ hasBio: true })).toBe(true);
    expect(hasIncompleteProfile({ avatarUrls, hasBio: false })).toBe(true);
  });

  it('is complete with both', () => {
    expect(hasIncompleteProfile({ avatarUrls, hasBio: true })).toBe(false);
  });
});

describe('needsOnboarding', () => {
  it('sends somebody with an incomplete profile who has not been through it', () => {
    expect(needsOnboarding({ id: 1, hasBio: false })).toBe(true);
  });

  // Skipping everything sets onboardedAt too; they are not sent back.
  it('does not send somebody who has been through it', () => {
    expect(needsOnboarding({ id: 1, hasBio: false, onboardedAt: '2026-09-27T10:00:00Z' })).toBe(false);
  });

  it('does not send somebody whose profile is already complete', () => {
    expect(needsOnboarding({ id: 1, avatarUrls, hasBio: true })).toBe(false);
  });

  it('does not send a guest', () => {
    expect(needsOnboarding({ id: 0 })).toBe(false);
    expect(needsOnboarding(undefined)).toBe(false);
  });
});
