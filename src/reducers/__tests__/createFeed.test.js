import createFeed from '../createFeed';

const feed = createFeed('feed_actor');

const stateWith = (items) => {
  const start = feed(undefined, { type: '@@INIT' });
  const byId = {};
  items.forEach((item) => {
    byId[item.id] = item;
  });
  return {
    ...start,
    feed_actor: {
      ...start.feed_actor,
      byId,
      allIds: items.map((item) => {
        return item.id;
      }),
    },
  };
};

describe('a feed after a post is removed', () => {
  const state = stateWith([
    { id: 1, type: 'node.medium.text-service.note.v1' },
    { id: 2, type: 'node.base.repost-service.repost.v1', parent: { id: 1 } },
    { id: 3, type: 'node.medium.photo-service.photo.v1' },
  ]);

  it('drops the post and a repost of it, under whatever kind it was removed as', () => {
    const next = feed(state, { type: 'NOTES_DELETE_SUCCESS', node: { id: 1 } });

    expect(next.feed_actor.allIds).toEqual([3]);
    expect(Object.keys(next.feed_actor.byId)).toEqual(['3']);
  });

  it('is left alone when what was removed is not in it', () => {
    expect(feed(state, { type: 'PHOTOS_DELETE_SUCCESS', node: { id: 99 } })).toBe(state);
  });

  it('is left alone by a like being taken back', () => {
    const next = feed(state, { type: 'NOTES_LIKES_DELETE_SUCCESS', node: { id: 1 } });

    expect(next.feed_actor.allIds).toEqual([1, 2, 3]);
  });
});

describe('a feed when its head is read again', () => {
  const state = stateWith([
    { id: 5, name: 'five' },
    { id: 4, name: 'four' },
    { id: 3, name: 'three' },
  ]);
  const prepend = (nodes, from = state) => {
    return feed(from, { type: 'FEED_ACTOR_BROWSE_PREPEND', nodes });
  };

  it('puts what is new first, in its own order, and keeps the rest', () => {
    const next = prepend([{ id: 7 }, { id: 6 }, { id: 5, name: 'five, changed' }, { id: 4, name: 'four' }]);
    expect(next.feed_actor.allIds).toEqual([7, 6, 5, 4, 3]);
    expect(next.feed_actor.byId[5].name).toBe('five, changed');
    expect(next.feed_actor.byId[3].name).toBe('three');
  });

  it('puts a post that was added among the ones held where the server has it', () => {
    const next = prepend([{ id: 5 }, { id: 45 }, { id: 4 }]);
    expect(next.feed_actor.allIds).toEqual([5, 45, 4, 3]);
  });

  it('begins again when more was posted than a page holds', () => {
    const next = prepend([{ id: 12 }, { id: 11 }, { id: 10 }], { ...state, hasMore: false });
    expect(next.feed_actor.allIds).toEqual([12, 11, 10]);
    expect(next.feed_actor.byId[5]).toBeUndefined();
    expect(next.hasMore).toBe(true);
  });

  it('fills a feed that was empty, and is unchanged by nothing', () => {
    const empty = stateWith([]);
    expect(prepend([{ id: 1 }], empty).feed_actor.allIds).toEqual([1]);
    expect(prepend([])).toBe(state);
    expect(prepend(undefined)).toBe(state);
  });
});
