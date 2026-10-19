/* eslint-env jest */
import deletion from '../deletion';

// How many days a profile scheduled for deletion has left, for its label.

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 9, 18, 12, 0, 0);

describe('deletion.daysLeft', () => {
  it('is null for a profile not scheduled for deletion', () => {
    expect(deletion.daysLeft({})).toBe(null);
    expect(deletion.daysLeft(null)).toBe(null);
    expect(deletion.daysLeft({ deletedAt: 'not a date' })).toBe(null);
  });

  it('counts the days to the end of the grace period', () => {
    expect(deletion.daysLeft({ deletedAt: new Date(NOW).toISOString() }, NOW)).toBe(30);
    expect(deletion.daysLeft({ deletedAt: new Date(NOW - (3 * DAY)).toISOString() }, NOW)).toBe(27);
  });

  it('counts part of a day as a day, and never goes below 0', () => {
    expect(deletion.daysLeft({ deletedAt: new Date(NOW - (29.5 * DAY)).toISOString() }, NOW)).toBe(1);
    expect(deletion.daysLeft({ deletedAt: new Date(NOW - (40 * DAY)).toISOString() }, NOW)).toBe(0);
  });
});
