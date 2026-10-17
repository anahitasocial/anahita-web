// Custom feeds: what one shows (its definition), kept in the shape the server
// reads, and put into words.
//
// The server checks every definition and is the one that decides. What is
// here keeps the editor from offering what it would refuse, and says in a
// sentence what a feed shows, so that nothing about a feed is hidden from
// whoever reads it.

const MEDIA_TYPES = ['note', 'article', 'topic', 'photo', 'video'];
const ACTOR_TYPES = ['person', 'group', 'event', 'pulse'];
const ACCESS = ['myself', 'followers', 'registered', 'public'];

// The server's limits, repeated so the editor can stop at them.
const LIMITS = {
  actors: 50,
  hashtags: 10,
  keywords: 10,
  locations: 5,
  keywordMin: 2,
  keywordMax: 50,
  pinned: 10,
  // An area's radius, in kilometres (feeds.MinRadiusKm, MaxRadiusKm).
  radiusMin: 1,
  radiusMax: 500,
};

const list = (value) => {
  return Array.isArray(value) ? value : [];
};

// A definition with every part present, from one that may have some
// missing: a new feed, or what the server sent.
const complete = (definition) => {
  const given = definition || {};
  const sources = given.sources || {};
  const filters = given.filters || {};
  const exclude = given.exclude || {};

  return {
    sources: {
      following: Boolean(sources.following),
      actors: list(sources.actors),
    },
    filters: {
      actorTypes: list(filters.actorTypes),
      mediaTypes: list(filters.mediaTypes),
      hashtagsAny: list(filters.hashtagsAny),
      keywordsAny: list(filters.keywordsAny),
      locationsAny: list(filters.locationsAny),
      language: filters.language || '',
      // An area: a point and a radius in kilometres, or nothing.
      near: filters.near && filters.near.radiusKm ? {
        latitude: Number(filters.near.latitude),
        longitude: Number(filters.near.longitude),
        radiusKm: Number(filters.near.radiusKm),
        // Wherever its reader is, rather than a point kept with it.
        live: Boolean(filters.near.live),
      } : null,
      // Where it was written: '' anywhere, 'here', or 'elsewhere'.
      origin: filters.origin || '',
    },
    exclude: {
      hashtags: list(exclude.hashtags),
      keywords: list(exclude.keywords),
      actors: list(exclude.actors),
    },
    includeReplies: Boolean(given.includeReplies),
    order: given.order || 'newest',
  };
};

// What a new feed starts as: whoever the viewer follows.
const starting = () => {
  return complete({ sources: { following: true } });
};

// A feed of one hashtag, over the whole site.
const ofHashtag = (hashtag) => {
  return complete({ filters: { hashtagsAny: [hashtag] } });
};

// A feed of any of several hashtags, over the whole site.
const ofHashtags = (hashtags) => {
  return complete({ filters: { hashtagsAny: hashtags } });
};

// A feed of one place, over the whole site.
const ofLocation = (id) => {
  return complete({ filters: { locationsAny: [Number(id)] } });
};

// A hashtag as the server keeps it: no "#", lower case.
const cleanHashtag = (value = '') => {
  return value.trim().replace(/^#+/, '').toLowerCase();
};

const cleanKeyword = (value = '') => {
  return value.trim().replace(/\s+/g, ' ');
};

const hasSources = (definition) => {
  const { sources } = complete(definition);

  return sources.following || sources.actors.length > 0;
};

const narrows = (definition) => {
  const { filters } = complete(definition);

  return filters.hashtagsAny.length > 0 ||
    filters.keywordsAny.length > 0 ||
    filters.locationsAny.length > 0 ||
    Boolean(filters.near);
};

// Why the server would refuse this definition, as the word it would answer
// with, or '' when it would not. Only what can be told here.
const problem = (definition) => {
  const { sources, filters, exclude } = complete(definition);

  if (!hasSources(definition) && !narrows(definition)) {
    return 'too_broad';
  }
  if (sources.actors.length > LIMITS.actors || exclude.actors.length > LIMITS.actors) {
    return 'too_many_actors';
  }
  if (filters.hashtagsAny.length > LIMITS.hashtags || exclude.hashtags.length > LIMITS.hashtags) {
    return 'too_many_hashtags';
  }
  if (filters.keywordsAny.length > LIMITS.keywords || exclude.keywords.length > LIMITS.keywords) {
    return 'too_many_keywords';
  }
  if (filters.locationsAny.length > LIMITS.locations) {
    return 'too_many_locations';
  }
  if (filters.near && (filters.near.radiusKm < LIMITS.radiusMin ||
    filters.near.radiusKm > LIMITS.radiusMax)) {
    return 'invalid_near';
  }

  const badKeyword = [...filters.keywordsAny, ...exclude.keywords].find((keyword) => {
    return keyword.length < LIMITS.keywordMin || keyword.length > LIMITS.keywordMax;
  });
  if (badKeyword !== undefined) {
    return 'keyword_length';
  }

  return '';
};

// A definition as one string, to tell whether two show the same thing.
const fingerprint = (definition) => {
  return JSON.stringify(complete(definition));
};

const joined = (words, t) => {
  if (words.length <= 1) {
    return words.join('');
  }

  return t('customFeeds:summary.list', {
    first: words.slice(0, -1).join(', '),
    last: words[words.length - 1],
  });
};

// What a feed shows, in a sentence: "Photos and notes from profiles you
// follow, tagged #garden or #seeds, without replies, newest first."
//
// `t` is the translator, and `names` the names of the profiles and places
// the definition lists, by id, where they are known. Whose feed it is
// changes the wording of "follow": yours, or its owner's.
const summary = (definition, t, { names = {}, isOwn = true } = {}) => {
  const {
    sources, filters, exclude, includeReplies,
  } = complete(definition);

  const named = (ids, countKey) => {
    const known = ids.map((id) => {
      return names[id];
    }).filter(Boolean);

    return known.length === ids.length && known.length <= 3 ?
      joined(known, t) :
      t(countKey, { count: ids.length });
  };

  const kinds = filters.mediaTypes.length > 0 ?
    joined(filters.mediaTypes.map((kind) => {
      return t(`customFeeds:summary.media.${kind}`);
    }), t) :
    t('customFeeds:summary.media.any');

  const from = [];
  if (sources.following) {
    from.push(t(isOwn ? 'customFeeds:summary.following' : 'customFeeds:summary.followingOwner'));
  }
  if (sources.actors.length > 0) {
    from.push(named(sources.actors, 'customFeeds:summary.profiles'));
  }
  if (from.length === 0) {
    from.push(t('customFeeds:summary.everyone'));
  }

  const parts = [t('customFeeds:summary.from', { kinds, from: joined(from, t) })];

  if (filters.actorTypes.length > 0) {
    parts.push(t('customFeeds:summary.on', {
      kinds: joined(filters.actorTypes.map((kind) => {
        return t(`customFeeds:summary.actor.${kind}`);
      }), t),
    }));
  }
  if (filters.hashtagsAny.length > 0) {
    parts.push(t('customFeeds:summary.tagged', {
      tags: filters.hashtagsAny.map((tag) => { return `#${tag}`; }).join(t('customFeeds:summary.or')),
    }));
  }
  if (filters.keywordsAny.length > 0) {
    parts.push(t('customFeeds:summary.mentioning', {
      words: filters.keywordsAny.map((word) => { return `“${word}”`; }).join(t('customFeeds:summary.or')),
    }));
  }
  if (filters.locationsAny.length > 0) {
    parts.push(t('customFeeds:summary.at', {
      places: named(filters.locationsAny, 'customFeeds:summary.places'),
    }));
  }
  if (filters.near) {
    parts.push(t(filters.near.live ? 'customFeeds:summary.nearLive' : 'customFeeds:summary.near', {
      count: filters.near.radiusKm,
    }));
  }
  if (filters.origin) {
    parts.push(t(`customFeeds:summary.origin.${filters.origin}`));
  }
  if (filters.language) {
    parts.push(t('customFeeds:summary.language', { language: filters.language.toUpperCase() }));
  }

  const without = [
    ...exclude.hashtags.map((tag) => { return `#${tag}`; }),
    ...exclude.keywords.map((word) => { return `“${word}”`; }),
  ];
  if (exclude.actors.length > 0) {
    without.push(named(exclude.actors, 'customFeeds:summary.profiles'));
  }
  if (without.length > 0) {
    parts.push(t('customFeeds:summary.without', { what: joined(without, t) }));
  }

  parts.push(t(includeReplies ? 'customFeeds:summary.withReplies' : 'customFeeds:summary.withoutReplies'));
  parts.push(t('customFeeds:summary.newest'));

  const sentence = parts.join(', ');

  return `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`;
};

// The names of what a feed's definition lists, by id, from what the server
// sent with it.
const namesOf = (references) => {
  const names = {};

  list(references).forEach((node) => {
    names[node.id] = node.name || node.title || node.alias || '';
  });

  return names;
};

// Whether anybody but its owner can open a feed.
const isShared = (feed) => {
  return Boolean(feed) && Boolean(feed.access) && feed.access !== 'myself';
};

// Where a feed is read.
const urlOf = (feed) => {
  return `/feeds/${feed.id}`;
};

const FEED_TYPE = 'node.feed.feed-service.generator.v1';

// Whether a node, as search sends one, is a custom feed.
const isFeed = (node) => {
  return Boolean(node) && node.type === FEED_TYPE;
};

// A feed as search sends it, a node with a `feed` block, in the shape the
// rest of the app has a feed in.
const fromSearch = (node) => {
  const details = node.feed || {};

  return {
    id: node.id,
    type: node.type,
    name: node.name || '',
    body: node.body || '',
    access: node.access || '',
    icon: details.icon || 'feed',
    definition: complete(details.definition),
    owner: node.owner,
    createdAt: node.createdAt,
  };
};

// When a feed was made, as a date to read: "11 October 2026". '' for one
// with no date.
const madeOn = (feed, language) => {
  const made = feed && feed.createdAt ? new Date(feed.createdAt) : null;

  if (!made || Number.isNaN(made.getTime())) {
    return '';
  }

  try {
    return new Intl.DateTimeFormat(language, { dateStyle: 'long' }).format(made);
  } catch (e) {
    return made.toDateString();
  }
};

// What to share of a feed: where it is, its name, and who can see it.
const toShare = (feed) => {
  return {
    path: urlOf(feed),
    title: feed.name,
    text: feed.body,
    access: feed.access,
  };
};

// Where a feed is opened after it is saved: Home on its tab when it is kept
// there, and its own page otherwise.
const whereToRead = (feed) => {
  return feed.isPinned ? `/?feed=${feed.id}` : urlOf(feed);
};

// Leaves a dialog that has an address of its own: back to wherever it was
// opened from, or to `fallback` when it was opened by its address, with
// nothing before it to go back to.
const leave = (navigate, fallback) => {
  const state = (typeof window !== 'undefined' && window.history && window.history.state) || {};

  if (state.idx > 0) {
    navigate(-1);
  } else {
    navigate(fallback, { replace: true });
  }
};

export default {
  MEDIA_TYPES,
  ACTOR_TYPES,
  ACCESS,
  LIMITS,
  complete,
  starting,
  ofHashtag,
  ofHashtags,
  ofLocation,
  cleanHashtag,
  cleanKeyword,
  hasSources,
  narrows,
  problem,
  fingerprint,
  summary,
  namesOf,
  isShared,
  isFeed,
  fromSearch,
  leave,
  madeOn,
  toShare,
  urlOf,
  whereToRead,
};
