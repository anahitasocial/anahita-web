/* eslint-env jest */
import account from '../account';

// Who may change a person's type, and to what (the user, 2026-10-18).
// Mirrors MayChangePersonType in anahita-libs, which decides; the point is
// that what is offered agrees with what the server allows.

const HERE = 'node.actor.person-service.person.v1';

const viewer = (personType) => {
  return { id: 1, personType };
};

const person = (personType, extra = {}) => {
  return {
    id: 2,
    type: HERE,
    personType,
    ...extra,
  };
};

describe('account.personTypesFor', () => {
  it('lets an administrator make an administrator of somebody registered', () => {
    expect(account.personTypesFor(viewer('administrator'), person('registered')))
      .toEqual(['registered', 'administrator']);
  });

  it('offers an administrator nothing for an administrator or a super administrator', () => {
    expect(account.personTypesFor(viewer('administrator'), person('administrator'))).toEqual([]);
    expect(account.personTypesFor(viewer('administrator'), person('super-administrator'))).toEqual([]);
  });

  it('offers a super administrator every type', () => {
    expect(account.personTypesFor(viewer('super-administrator'), person('administrator')))
      .toEqual(['registered', 'administrator', 'super-administrator']);
  });

  it('offers nobody their own type, nor anything to somebody registered', () => {
    expect(account.personTypesFor(viewer('super-administrator'), person('super-administrator', { id: 1 })))
      .toEqual([]);
    expect(account.personTypesFor(viewer('registered'), person('registered'))).toEqual([]);
  });

  it('offers nothing for a profile that is not a person here', () => {
    expect(account.personTypesFor(
      viewer('super-administrator'),
      person('registered', { type: 'node.actor.activitypub-service.person.v1' }),
    )).toEqual([]);
  });
});
