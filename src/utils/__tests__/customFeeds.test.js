/**
 * @jest-environment node
 */
/* eslint-env jest */
import i18n from '../../languages';
import feeds from '../customFeeds';

const t = (key, options) => {
  return i18n.t(key, { lng: 'en-GB', ...options });
};

describe('a custom feed\'s definition', () => {
  it('is made whole from whatever part of it there is', () => {
    expect(feeds.complete(undefined)).toEqual({
      sources: { following: false, actors: [] },
      filters: {
        actorTypes: [],
        mediaTypes: [],
        hashtagsAny: [],
        keywordsAny: [],
        locationsAny: [],
        language: '',
      },
      exclude: { hashtags: [], keywords: [], actors: [] },
      includeReplies: false,
      order: 'newest',
    });
    expect(feeds.complete({ filters: { hashtagsAny: ['garden'] } }).filters.hashtagsAny).toEqual(['garden']);
    expect(feeds.starting().sources.following).toBe(true);
    expect(feeds.ofHashtag('garden').filters.hashtagsAny).toEqual(['garden']);
  });

  it('keeps hashtags and keywords as the server does', () => {
    expect(feeds.cleanHashtag(' #Garden ')).toBe('garden');
    expect(feeds.cleanHashtag('##seeds')).toBe('seeds');
    expect(feeds.cleanKeyword('  heirloom   tomato ')).toBe('heirloom tomato');
  });

  it('is refused when it would be the whole site', () => {
    expect(feeds.problem({})).toBe('too_broad');
    expect(feeds.problem({ filters: { mediaTypes: ['photo'] } })).toBe('too_broad');
    expect(feeds.problem({ filters: { actorTypes: ['group'] } })).toBe('too_broad');
    expect(feeds.problem({ sources: { following: true } })).toBe('');
    expect(feeds.problem({ sources: { actors: [4] } })).toBe('');
    expect(feeds.problem({ filters: { hashtagsAny: ['garden'] } })).toBe('');
    expect(feeds.problem({ filters: { keywordsAny: ['compost'] } })).toBe('');
    expect(feeds.problem({ filters: { locationsAny: [9] } })).toBe('');
  });

  it('is refused past the limits', () => {
    const many = (count) => {
      return Array.from({ length: count }, (unused, index) => {
        return `word${index}`;
      });
    };

    expect(feeds.problem({ filters: { hashtagsAny: many(11) } })).toBe('too_many_hashtags');
    expect(feeds.problem({ filters: { keywordsAny: many(11) } })).toBe('too_many_keywords');
    expect(feeds.problem({ sources: { following: true }, exclude: { keywords: many(11) } })).toBe('too_many_keywords');
    expect(feeds.problem({ filters: { locationsAny: [1, 2, 3, 4, 5, 6] } })).toBe('too_many_locations');
    expect(feeds.problem({ filters: { keywordsAny: ['a'] } })).toBe('keyword_length');
    const ids = Array.from({ length: 51 }, (unused, index) => {
      return index + 1;
    });
    expect(feeds.problem({ sources: { actors: ids } })).toBe('too_many_actors');
  });

  it('has a link worth sending only when somebody else can open it', () => {
    expect(feeds.isShared({ access: 'myself' })).toBe(false);
    expect(feeds.isShared({ access: 'followers' })).toBe(true);
    expect(feeds.isShared({ access: 'public' })).toBe(true);
    expect(feeds.isShared({})).toBe(false);
    expect(feeds.urlOf({ id: 12 })).toBe('/feeds/12');
  });

  it('tells two definitions apart by what they show', () => {
    expect(feeds.fingerprint({ sources: { following: true } }))
      .toBe(feeds.fingerprint(feeds.starting()));
    expect(feeds.fingerprint(feeds.starting())).not.toBe(feeds.fingerprint(feeds.ofHashtag('garden')));
  });
});

describe('what a custom feed shows, in a sentence', () => {
  it('is the plainest for a feed of profiles followed', () => {
    expect(feeds.summary(feeds.starting(), t))
      .toBe('Posts from profiles you follow, without replies, newest first.');
    expect(feeds.summary(feeds.starting(), t, { isOwn: false }))
      .toBe('Posts from profiles its owner follows, without replies, newest first.');
  });

  it('names the hashtag of a feed of one', () => {
    expect(feeds.summary(feeds.ofHashtag('garden'), t))
      .toBe('Posts from everyone, tagged #garden, without replies, newest first.');
  });

  it('says every part of a full one', () => {
    const definition = {
      sources: { following: true, actors: [4, 7] },
      filters: {
        mediaTypes: ['photo', 'note'],
        actorTypes: ['group'],
        hashtagsAny: ['garden', 'seeds'],
        keywordsAny: ['compost'],
        locationsAny: [9],
        language: 'fr',
      },
      exclude: { hashtags: ['spam'], keywords: ['ad'], actors: [11] },
      includeReplies: true,
    };

    expect(feeds.summary(definition, t, { names: { 4: 'Carol', 7: 'Cyclists', 9: 'The allotment' } }))
      .toBe('Photos and notes from profiles you follow and Carol and Cyclists, posted on groups, ' +
        'tagged #garden or #seeds, mentioning “compost”, at The allotment, in FR, ' +
        'leaving out #spam, “ad” and 1 chosen profile, with replies, newest first.');
  });

  it('counts the profiles it cannot name', () => {
    expect(feeds.summary({ sources: { actors: [4, 7] } }, t))
      .toBe('Posts from 2 chosen profiles, without replies, newest first.');
    expect(feeds.summary({ sources: { actors: [4] } }, t))
      .toBe('Posts from 1 chosen profile, without replies, newest first.');
  });

  it('reads the names sent with a feed', () => {
    expect(feeds.namesOf([{ id: 4, name: 'Carol' }, { id: 9, name: '', alias: 'the-allotment' }]))
      .toEqual({ 4: 'Carol', 9: 'the-allotment' });
    expect(feeds.namesOf(undefined)).toEqual({});
  });
});
