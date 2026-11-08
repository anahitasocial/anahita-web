import { isMutedOut, until } from '../mutes';

// Naomi muted Moss (roadmap row 133). What a feed lets go of at once.
const MOSS = 2;
const ROSE = 3;
const GROUP = 5;

const post = (author, owner, parent) => {
  return {
    id: Math.random(), author: { id: author }, owner: { id: owner }, parent,
  };
};

describe('isMutedOut', () => {
  it('takes out what they wrote, what is on their profile, and reposts by or of them', () => {
    expect(isMutedOut(post(MOSS, MOSS), MOSS)).toBe(true);
    expect(isMutedOut(post(MOSS, GROUP), MOSS)).toBe(true);
    expect(isMutedOut(post(ROSE, MOSS), MOSS)).toBe(true);
    expect(isMutedOut(post(ROSE, ROSE, post(MOSS, MOSS)), MOSS)).toBe(true);
    expect(isMutedOut(post(MOSS, MOSS, post(ROSE, ROSE)), MOSS)).toBe(true);
  });

  it('leaves everybody else', () => {
    expect(isMutedOut(post(ROSE, ROSE), MOSS)).toBe(false);
    expect(isMutedOut(post(ROSE, GROUP, post(ROSE, ROSE)), MOSS)).toBe(false);
    expect(isMutedOut(null, MOSS)).toBe(false);
  });

  it('keeps, in a profile feed, what is on their own profile', () => {
    expect(isMutedOut(post(MOSS, MOSS), MOSS, true)).toBe(false);
    expect(isMutedOut(post(ROSE, MOSS), MOSS, true)).toBe(false);
    expect(isMutedOut(post(MOSS, MOSS, post(ROSE, ROSE)), MOSS, true)).toBe(false);
    // And lets go of what they wrote on anybody else's.
    expect(isMutedOut(post(MOSS, GROUP), MOSS, true)).toBe(true);
    expect(isMutedOut(post(ROSE, ROSE, post(MOSS, MOSS)), MOSS, true)).toBe(true);
  });
});

describe('until', () => {
  it('says nothing for a mute until unmuted', () => {
    expect(until(null)).toBe('');
    expect(until('not a date')).toBe('');
  });

  it('writes the day and the time', () => {
    const text = until('2026-11-15T18:20:00Z', 'en-CA');
    expect(text).toMatch(/15/);
    expect(text).toMatch(/Nov/);
  });
});
