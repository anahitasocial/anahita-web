import { describe, expect, it } from 'vitest';

import kinds from '../postKinds';

// What a post's page does differently for each kind of post.
describe('the kinds of post a page draws', () => {
  it('gives a note no title, and a card for its link while it is edited', () => {
    expect(kinds.byNamespace('notes').titled).toBeFalsy();
    expect(kinds.byNamespace('notes').linkCard).toBe(true);
    expect(kinds.byNamespace('articles').linkCard).toBeFalsy();
  });

  it('gives every other kind a title, one not in the table too', () => {
    ['articles', 'topics', 'photos', 'videos', 'events'].forEach((namespace) => {
      expect(kinds.byNamespace(namespace).titled).toBe(true);
    });
  });

  it('lets a photo or a video be posted without words', () => {
    expect(kinds.byNamespace('photos').wordsOptional).toBe(true);
    expect(kinds.byNamespace('videos').wordsOptional).toBe(true);
    expect(kinds.byNamespace('articles').wordsOptional).toBeFalsy();
  });

  it('edits long writing in its own editor, and gives an article its cover', () => {
    expect(kinds.byNamespace('articles')).toMatchObject({ richText: true, withCover: true, withMedia: true });
    expect(kinds.byNamespace('topics').richText).toBe(true);
    expect(kinds.byNamespace('topics').withCover).toBeFalsy();
  });

  it('knows long writing by its type', () => {
    expect(kinds.isLong({ type: 'node.medium.text-service.article.v1' })).toBe(true);
    expect(kinds.isLong({ type: 'node.medium.text-service.topic.v1' })).toBe(true);
    expect(kinds.isLong({ type: 'node.medium.text-service.note.v1' })).toBe(false);
    expect(kinds.isLong({})).toBe(false);
    expect(kinds.isLong(null)).toBe(false);
  });
});

// How each kind is written.
const withVideos = { metadata: { videoUploads: true } };
const withoutAudio = { metadata: { videoUploads: true, audioUploads: false } };

describe('the kinds of post', () => {
  it('gives each composer its kinds, of those a profile takes, in order', () => {
    const takes = ['topic', 'audio', 'note', 'article', 'photo', 'video'];
    expect(kinds.forComposer('short', takes)).toEqual(['note', 'photo', 'video', 'audio']);
    expect(kinds.forComposer('long', takes)).toEqual(['article', 'topic']);
    expect(kinds.forComposer('long', ['note', 'topic'])).toEqual(['topic']);
    expect(kinds.forComposer('short', ['group'])).toEqual([]);
  });

  it('offers a kind the profile takes and the server has on', () => {
    const all = ['note', 'photo', 'video', 'audio'];
    expect(kinds.isOffered(all, 'note', null)).toBe(true);
    expect(kinds.isOffered(['photo'], 'note', withVideos)).toBe(false);
    expect(kinds.isOffered(all, 'video', null)).toBe(false);
    expect(kinds.isOffered(all, 'video', withVideos)).toBe(true);
    expect(kinds.isOffered(all, 'audio', withVideos)).toBe(true);
    expect(kinds.isOffered(all, 'audio', withoutAudio)).toBe(false);
  });

  it('gives an article a cover, media and the fediverse, and a topic none', () => {
    expect(kinds.of('article')).toMatchObject({ withCover: true, withMedia: true, federates: true });
    expect(kinds.of('topic')).toMatchObject({ withCover: false, withMedia: false, federates: false });
    expect(kinds.of('photo').namespace).toBe('photos');
    expect(kinds.of('poll').withCover).toBeUndefined();
  });

  it("gives a long kind its words, and an article's to one without", () => {
    expect(kinds.wordsOf('topic').titlePlaceholder).toBe('topics:composer.titlePlaceholder');
    expect(kinds.wordsOf('note').namespace).toBe('articles');
    expect(kinds.wordsOf(undefined).namespace).toBe('articles');
  });
});
