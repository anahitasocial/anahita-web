/* eslint-env jest */
import { canRefuseAccount } from '../useRefuseAccount';

// Who may refuse an account for the whole site, and which: an
// administrator, a person from another network (anahita-services'
// docs/plans/refused-accounts.md).

const viewer = (personType) => {
  return { id: 1, personType };
};

const fromMastodon = {
  id: 5, type: 'node.actor.activitypub-service.person.v1', uri: 'https://mastodon.example/users/bob',
};
const fromBluesky = { id: 6, type: 'node.actor.atproto-service.person.v1', uri: 'at://did:plc:eve' };
const here = { id: 7, type: 'node.actor.person-service.person.v1' };
const groupHere = { id: 8, type: 'node.actor.group-service.group.v1' };

describe('canRefuseAccount', () => {
  it('lets an administrator refuse a person from another network', () => {
    expect(canRefuseAccount(viewer('administrator'), fromMastodon)).toBe(true);
    expect(canRefuseAccount(viewer('super-administrator'), fromBluesky)).toBe(true);
  });

  it('never a profile made here', () => {
    expect(canRefuseAccount(viewer('administrator'), here)).toBe(false);
    expect(canRefuseAccount(viewer('administrator'), groupHere)).toBe(false);
  });

  it('and nobody but an administrator', () => {
    expect(canRefuseAccount(viewer('registered'), fromMastodon)).toBe(false);
    expect(canRefuseAccount(null, fromMastodon)).toBe(false);
    expect(canRefuseAccount(viewer('administrator'), null)).toBe(false);
  });
});
