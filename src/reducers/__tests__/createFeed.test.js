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
