import { describe, expect, it } from 'vitest';
import videoElsewhere from '../videoElsewhere';

// A post from elsewhere whose video is not kept here is drawn as its
// poster, leading to it; any other post is drawn as it always was.
describe('videoElsewhere', () => {
  const page = 'https://bsky.app/profile/did:plc:aaa/post/3m';
  const post = (content, files = 1) => {
    return { content, files: Array.from({ length: files }, (_, i) => { return { id: i }; }) };
  };

  it('finds the line, and leaves the words without it', () => {
    const found = videoElsewhere.of(post(`Threads, stop drunk-dialing your exes.\n\n▶︎ [bsky.app](${page})`));
    expect(found).toEqual({ site: 'bsky.app', page, content: 'Threads, stop drunk-dialing your exes.' });
  });

  it('takes a post that is only the video', () => {
    expect(videoElsewhere.of(post(`▶ [mastodon.social](${page})`)).content).toBe('');
  });

  it('leaves alone a post with no picture, or several', () => {
    const line = `▶︎ [bsky.app](${page})`;
    expect(videoElsewhere.of(post(line, 0))).toBeNull();
    expect(videoElsewhere.of(post(line, 2))).toBeNull();
  });

  it('leaves alone a play mark in the middle of the words, or a plain link', () => {
    expect(videoElsewhere.of(post(`▶︎ [bsky.app](${page})\n\nAnd more`))).toBeNull();
    expect(videoElsewhere.of(post(`See [bsky.app](${page})`))).toBeNull();
    expect(videoElsewhere.of(post('▶︎ [x](http://plain.example/a)'))).toBeNull();
  });
});
