/* eslint-env jest */
import permissions from '../node';

const member = { id: 7, personType: 'registered' };

describe('who may tie a location to a profile or a post', () => {
  it('lets a person on their own profile', () => {
    expect(permissions.canAdd(member, { id: 7 })).toBe(true);
  });

  it('keeps them off somebody else\'s', () => {
    expect(permissions.canAdd(member, { id: 8 })).toBe(false);
  });

  it('lets the author of a post in a group', () => {
    expect(permissions.canAdd(member, { id: 50, author: { id: 7 }, owner: { id: 90 } })).toBe(true);
  });

  it('lets whoever looks after a group, a website or an event', () => {
    expect(permissions.canAdd(member, { id: 90, authorized: { administration: true } })).toBe(true);
  });

  it('lets an administrator anywhere', () => {
    expect(permissions.canAdd({ id: 3, personType: 'administrator' }, { id: 8 })).toBe(true);
  });
});
