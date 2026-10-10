/**
 * @jest-environment node
 */
/* eslint-env jest */
import socialgraph from '../socialgraph';

const person = {
  id: 1,
  type: 'node.actor.person-service.person.v1',
  followerCount: 3,
  leaderCount: 2,
};
const group = { id: 9, type: 'node.actor.group-service.group.v1', followerCount: 5 };

describe('which lists a profile has', () => {
  it('gives a person followers and leaders, and what a signed-in viewer has in common', () => {
    expect(socialgraph.kinds(person, { id: 2 })).toEqual(['followers', 'leaders', 'mutuals']);
  });

  it('gives a group no leaders: a group follows nobody', () => {
    expect(socialgraph.kinds(group, { id: 2 })).toEqual(['followers', 'mutuals']);
  });

  it('leaves out what is in common on your own profile and for a visitor', () => {
    expect(socialgraph.kinds(person, { id: 1 })).toEqual(['followers', 'leaders']);
    expect(socialgraph.kinds(person, {})).toEqual(['followers', 'leaders']);
  });

  it('opens on the list asked for, or the first when the profile has no such list', () => {
    const lists = socialgraph.kinds(group, {});
    expect(socialgraph.known(lists, 'followers')).toBe('followers');
    expect(socialgraph.known(lists, 'leaders')).toBe('followers');
    expect(socialgraph.known(lists, 'blocks')).toBe('followers');
  });
});

describe('the numbers on the tabs', () => {
  it('are the profile\'s own counts, and none for what is in common', () => {
    expect(socialgraph.counts(person)).toEqual({ followers: 3, leaders: 2 });
    expect(socialgraph.counts(group)).toEqual({ followers: 5, leaders: 0 });
    expect(socialgraph.counts(person).mutuals).toBeUndefined();
  });

  it('has one for what is in common once that list has been read', () => {
    const lists = { mutuals: { rows: [{ id: 4 }], total: 7 } };
    expect(socialgraph.counts(person, lists).mutuals).toBe(7);
    expect(socialgraph.counts(person, {}).mutuals).toBeUndefined();
  });
});

describe('the button that follows somebody', () => {
  it('says Follow back to somebody who follows you', () => {
    expect(socialgraph.followLabelKey({ isFollowingViewer: true })).toBe('actions:followBack');
    expect(socialgraph.followLabelKey({ isFollowingViewer: false })).toBe('actions:follow');
    expect(socialgraph.followLabelKey(undefined)).toBe('actions:follow');
  });
});

describe('the order of a list', () => {
  it('asks the server for the oldest first, and for nothing otherwise', () => {
    expect(socialgraph.ORDERS).toEqual(['latest', 'oldest']);
    expect(socialgraph.direction('oldest')).toBe('asc');
    expect(socialgraph.direction('latest')).toBeUndefined();
    expect(socialgraph.direction(undefined)).toBeUndefined();
  });
});

describe('the line under a name', () => {
  it('is the alias, and that they follow you when they do', () => {
    expect(socialgraph.rowNote({ alias: 'ana' }, 'Follows you')).toBe('@ana');
    expect(socialgraph.rowNote({ alias: 'ana', isFollowingViewer: true }, 'Follows you'))
      .toBe('@ana · Follows you');
    expect(socialgraph.rowNote({}, 'Follows you')).toBe('');
  });
});

describe('adding a page to a list', () => {
  it('starts with the first page', () => {
    const page = { data: [{ id: 1 }, { id: 2 }], pagination: { total: 3 } };
    const list = socialgraph.merge(undefined, page, 0);
    expect(list).toEqual({ rows: [{ id: 1 }, { id: 2 }], total: 3 });
  });

  it('adds the next without anybody twice', () => {
    const first = { rows: [{ id: 1 }, { id: 2 }], total: 3 };
    const page = { data: [{ id: 2 }, { id: 3 }], pagination: { total: 3 } };
    const list = socialgraph.merge(first, page, 2);
    expect(list.rows.map((row) => { return row.id; })).toEqual([1, 2, 3]);
  });

  it('stops offering more when a page comes back empty or without a total', () => {
    const first = { rows: [{ id: 1 }], total: 9 };
    expect(socialgraph.merge(first, { data: [], pagination: { total: 9 } }, 1).total).toBe(1);
    expect(socialgraph.merge(undefined, { data: [{ id: 1 }] }, 0).total).toBe(1);
  });
});
