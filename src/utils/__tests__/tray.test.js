import tray from '../tray';

const memory = () => {
  const data = {};
  return {
    getItem: (key) => {
      return key in data ? data[key] : null;
    },
    setItem: (key, value) => {
      data[key] = value;
    },
    data,
  };
};

const NOW = new Date('2026-10-05T12:00:00Z').getTime();
const at = (hoursAgo) => {
  return new Date(NOW - (hoursAgo * 60 * 60 * 1000)).toISOString();
};

const viewer = { id: 7 };

describe('tray', () => {
  it('marks an actor new until the viewer has looked past their latest post', () => {
    const entry = { actor: { id: 3 }, latestPostAt: at(1) };

    expect(tray.isNew(entry, {})).toBe(true);
    expect(tray.isNew(entry, { 3: new Date(at(2)).getTime() })).toBe(true);
    expect(tray.isNew(entry, { 3: new Date(at(1)).getTime() })).toBe(false);
    expect(tray.isNew({ actor: {} }, {})).toBe(false);
  });

  it('puts those with something new first, each in the order given', () => {
    const entries = [
      { actor: { id: 1 }, latestPostAt: at(1) },
      { actor: { id: 2 }, latestPostAt: at(2) },
      { actor: { id: 3 }, latestPostAt: at(3) },
    ];
    const seen = { 1: NOW };

    expect(tray.order(entries, seen).map((entry) => {
      return entry.actor.id;
    })).toEqual([2, 3, 1]);
  });

  it('remembers on the device, per person, and never goes backwards', () => {
    const storage = memory();

    tray.markSeen(viewer, 3, at(1), storage, NOW);
    expect(tray.readSeen(viewer, storage)[3]).toBe(new Date(at(1)).getTime());

    // Looking again at something older does not undo it.
    tray.markSeen(viewer, 3, at(5), storage, NOW);
    expect(tray.readSeen(viewer, storage)[3]).toBe(new Date(at(1)).getTime());

    // Somebody else on the same browser has their own.
    expect(tray.readSeen({ id: 8 }, storage)).toEqual({});
  });

  it('forgets what is too old to matter', () => {
    const storage = memory();

    tray.markSeen(viewer, 3, at(100), storage, NOW - (100 * 60 * 60 * 1000));
    tray.markSeen(viewer, 4, at(1), storage, NOW);

    expect(Object.keys(tray.readSeen(viewer, storage))).toEqual(['4']);
  });

  it('does without a browser that will not keep anything', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };

    expect(tray.readSeen(viewer, broken)).toEqual({});
    expect(tray.markSeen(viewer, 3, at(1), broken, NOW)[3]).toBe(new Date(at(1)).getTime());
    expect(tray.readSeen(viewer, null)).toEqual({});
    expect(tray.readSeen(viewer, { getItem: () => { return 'not json'; } })).toEqual({});
  });

  it('steps through an actor\'s own posts in the window, oldest first', () => {
    const items = [
      { id: 1, type: 'node.medium.text-service.note.v1', createdAt: at(2) },
      { id: 2, type: 'node.base.repost-service.repost.v1', createdAt: at(1) },
      { id: 3, type: 'node.medium.photo-service.photo.v1', createdAt: at(5) },
      // Pinned to the profile long ago, so it leads the page it came from.
      { id: 4, type: 'node.medium.text-service.note.v1', createdAt: at(400), pinned: true },
      { id: 5, type: 'node.medium.text-service.note.v1', createdAt: at(1), rootId: 9 },
    ];

    expect(tray.postsInWindow(items, NOW).map((item) => {
      return item.id;
    })).toEqual([3, 1]);
  });
});
