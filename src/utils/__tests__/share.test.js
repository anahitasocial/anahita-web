/**
 * @jest-environment node
 */
/* eslint-env jest */
import share from '../share';

const what = { url: 'https://example.org/notes/12', title: 'Compost tips', text: 'ignored' };

describe('sharing a link', () => {
  it('builds the address in full, with nothing added', () => {
    expect(share.linkOf('/feeds/12', 'https://example.org')).toBe('https://example.org/feeds/12');
  });

  it('is sent with its title, or the start of its text', () => {
    expect(share.messageOf(what)).toBe('Compost tips');
    expect(share.messageOf({ text: ' a\n note  on two lines ' })).toBe('a note on two lines');
    expect(share.messageOf({})).toBe('');

    const long = share.excerpt('word '.repeat(60));
    expect(long.length).toBeLessThanOrEqual(100);
    expect(long.endsWith('…')).toBe(true);
  });

  it('reads a Mastodon server however it is typed', () => {
    expect(share.serverOf(' https://Mastodon.social/ ')).toBe('mastodon.social');
    expect(share.serverOf('fosstodon.org/@someone')).toBe('fosstodon.org');
    expect(share.serverOf('localhost')).toBe('');
    expect(share.serverOf('not a server')).toBe('');
    expect(share.serverOf('evil.example/share?x=<script>')).toBe('evil.example');
    expect(share.serverOf('')).toBe('');
  });

  it('opens other places with the message and the link', () => {
    expect(share.emailURL(what))
      .toBe('mailto:?subject=Compost%20tips&body=https%3A%2F%2Fexample.org%2Fnotes%2F12');
    expect(share.blueskyURL(what))
      .toBe('https://bsky.app/intent/compose?text=Compost%20tips%20https%3A%2F%2Fexample.org%2Fnotes%2F12');
    expect(share.mastodonURL(what, 'mastodon.social'))
      .toBe('https://mastodon.social/share?text=Compost%20tips%20https%3A%2F%2Fexample.org%2Fnotes%2F12');
    expect(share.mastodonURL(what, '')).toBe('');
    expect(share.blueskyURL({ url: 'https://example.org/x' }))
      .toBe('https://bsky.app/intent/compose?text=https%3A%2F%2Fexample.org%2Fx');
  });

  it('goes beyond the site only for what a visitor could open', () => {
    expect(share.isOpen('public')).toBe(true);
    expect(share.isOpen('public', 'preview')).toBe(true);
    expect(share.isOpen('public', 'registered')).toBe(false);
    expect(share.isOpen('followers')).toBe(false);
    expect(share.isOpen('registered')).toBe(false);
    expect(share.isOpen(undefined)).toBe(false);
  });

  it('opens the one dialog for whoever is listening', () => {
    const seen = [];
    const stop = share.listen((asked) => {
      seen.push(asked);
    });

    share.open(what);
    stop();
    share.open(what);

    expect(seen).toEqual([what]);
  });
});
