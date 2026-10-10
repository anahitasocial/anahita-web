/**
 * @jest-environment node
 */
/* eslint-env jest */
import invites from '../invites';

describe('what became of each person', () => {
  const rows = [
    { personId: 2, result: 'invited' },
    { personId: 4, result: 'already_follower' },
    { personId: 5, result: 'blocked' },
  ];

  it('is kept by person', () => {
    expect(invites.byPerson(rows)).toEqual({ 2: 'invited', 4: 'already_follower', 5: 'blocked' });
    expect(invites.byPerson(undefined)).toEqual({});
  });

  it('counts the ones who were invited', () => {
    expect(invites.invitedCount(rows)).toBe(1);
    expect(invites.invitedCount([])).toBe(0);
  });

  it('has wording for every answer, and for one it does not know', () => {
    expect(invites.resultKey('cooldown')).toBe('socialgraph:invite.results.cooldown');
    expect(invites.resultKey('something_new')).toBe('socialgraph:invite.results.unavailable');
  });
});

describe('ticking people', () => {
  it('adds and removes', () => {
    expect(invites.toggle([], 2, 50)).toEqual([2]);
    expect(invites.toggle([2, 3], 2, 50)).toEqual([3]);
  });

  it('stops at the most one request may name', () => {
    const chosen = [1, 2];
    expect(invites.toggle(chosen, 3, 2)).toBe(chosen);
    // Unticking still works at the limit.
    expect(invites.toggle(chosen, 1, 2)).toEqual([2]);
  });
});
