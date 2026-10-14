/* eslint-env jest */
import federation from '../federation';

describe('people and posts from other servers', () => {
  it('knows what came from another server', () => {
    expect(federation.isRemote({ type: 'node.actor.activitypub-service.person.v1', alias: 'alice@mastodon.example' })).toBe(true);
    expect(federation.isRemote({ type: 'node.medium.text-service.note.v1', uri: 'https://mastodon.example/n/1' })).toBe(true);
    expect(federation.isRemote({ type: 'node.actor.person-service.person.v1', alias: 'ana' })).toBe(false);
    expect(federation.isRemote({ type: 'node.medium.text-service.note.v1' })).toBe(false);
    expect(federation.isRemote(null)).toBe(false);
    expect(federation.isRemote({ type: 'node.actor.atproto-service.person.v1', alias: 'alice.bsky.social' })).toBe(true);
    expect(federation.isRemote({ type: 'node.medium.text-service.note.v1', uri: 'at://did:plc:aaaaaaaaaaaaaaaaaaaaaaaa/app.bsky.feed.post/3l3' })).toBe(true);
  });

  it('knows the page of something from another server', () => {
    const did = 'did:plc:aaaaaaaaaaaaaaaaaaaaaaaa';
    expect(federation.pageOf({ uri: 'https://mastodon.example/@alice/1' })).toBe('https://mastodon.example/@alice/1');
    expect(federation.pageOf({ uri: `at://${did}/app.bsky.feed.post/3l3qo2vutsw2b` })).toBe(`https://bsky.app/profile/${did}/post/3l3qo2vutsw2b`);
    expect(federation.pageOf({ uri: `at://${did}` })).toBe(`https://bsky.app/profile/${did}`);
    // Never a link to somewhere that is not a page.
    ['at://nobody', `at://${did}/app.bsky.feed.like/3l3`, `at://${did}/app.bsky.feed.post/a/b`, 'mailto:alice@mastodon.example', 'http://plain.example/x', ''].forEach((uri) => {
      expect(federation.pageOf({ uri })).toBe('');
    });
    expect(federation.pageOf(null)).toBe('');
  });

  it('tells which network a lookup is asked of', () => {
    const { ACTIVITYPUB, ATPROTO } = federation;
    expect(federation.lookupKind('@alice@mastodon.example')).toBe(ACTIVITYPUB);
    expect(federation.lookupKind('https://mastodon.example/@alice')).toBe(ACTIVITYPUB);
    expect(federation.lookupKind('alice.bsky.social')).toBe(ATPROTO);
    expect(federation.lookupKind(' @Alice.Bsky.Social ')).toBe(ATPROTO);
    expect(federation.lookupKind('nytimes.com')).toBe(ATPROTO);
    expect(federation.lookupKind('did:plc:z72i7hdynmk6r22z27h6tvur')).toBe(ATPROTO);
    expect(federation.lookupKind('https://bsky.app/profile/alice.bsky.social')).toBe(ATPROTO);
    ['alice', '@alice', 'gardening tips', 'node.js tips', 'version 1.2', '1.2.3', 'https://bsky.app/profile/', 'did:plc:short', ''].forEach((text) => {
      expect(federation.lookupKind(text)).toBe('');
    });
  });

  it('asks another server at once only for what is unmistakably a handle', () => {
    ['@alice@mastodon.example', 'alice@mastodon.example', ' alice.bsky.social ', '@nytimes.com',
      'did:plc:z72i7hdynmk6r22z27h6tvur'].forEach((text) => {
      expect(federation.isClearHandle(text)).toBe(true);
    });
    // A word with dots in it, an address, or nothing to look up: the
    // button, or nothing.
    ['nytimes.com', 'seeds.org', 'https://mastodon.example/@alice',
      'https://bsky.app/profile/alice.bsky.social', 'gardening tips', ''].forEach((text) => {
      expect(federation.isClearHandle(text)).toBe(false);
    });
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
