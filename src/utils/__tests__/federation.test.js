/* eslint-env jest */
import federation from '../federation';

describe('people and posts from other servers', () => {
  it('knows what came from another server', () => {
    expect(federation.isRemote({ type: 'node.actor.activitypub-service.person.v1', alias: 'alice@mastodon.example' })).toBe(true);
    expect(federation.isRemote({ type: 'node.medium.text-service.note.v1', uri: 'https://mastodon.example/n/1' })).toBe(true);
    expect(federation.isRemote({ type: 'node.actor.person-service.person.v1', alias: 'ana' })).toBe(false);
    expect(federation.isRemote({ type: 'node.medium.text-service.note.v1' })).toBe(false);
    expect(federation.isRemote(null)).toBe(false);
  });

  it('says where somebody is from, and what they are called', () => {
    const alice = { alias: 'alice@mastodon.example' };
    expect(federation.domainOf(alice)).toBe('mastodon.example');
    expect(federation.handleOf(alice)).toBe('@alice@mastodon.example');
    expect(federation.domainOf({ originDomain: 'gts.example', alias: 'x' })).toBe('gts.example');
    expect(federation.domainOf({ alias: 'ana' })).toBe('');
    expect(federation.domainOf(undefined)).toBe('');

    const upper = (text) => { return text.toUpperCase(); };
    expect(federation.displayHandle({ alias: 'Ana' }, upper)).toBe('@ANA');
    expect(federation.displayHandle({ alias: 'alice@mastodon.example', type: 'node.actor.activitypub-service.person.v1' }, upper)).toBe('@alice@mastodon.example');
    expect(federation.displayHandle({})).toBe('');
  });

  it('tells a handle or a profile address from something to search for', () => {
    ['@alice@mastodon.example', 'alice@mastodon.example', ' @Alice@Sub.Mastodon.Example ', 'https://mastodon.example/@alice'].forEach((text) => {
      expect(federation.isLookup(text)).toBe(true);
    });
    ['alice', '@alice', 'alice@localhost', 'gardening tips', 'http://mastodon.example/@alice', 'https://mastodon.example', '', null].forEach((text) => {
      expect(federation.isLookup(text)).toBe(false);
    });
  });

  it('takes a missing service for there being nothing, not for a failure', () => {
    expect(federation.isAbsent({ response: { status: 404 } })).toBe(true);
    expect(federation.isAbsent({ response: { status: 502 } })).toBe(true);
    expect(federation.isAbsent({ response: { status: 409 } })).toBe(false);
    expect(federation.isAbsent({})).toBe(true);
    expect(federation.isAbsent({ response: { status: 500 } })).toBe(false);
    expect(federation.reasonOf({ response: { data: { error: 'profile_not_public' } } })).toBe('profile_not_public');
    expect(federation.reasonOf(undefined)).toBe('');
  });
});
