/**
 * @jest-environment node
 */
/* eslint-env jest */
import reducer from '../reducer';

const { editItem, deleteItem } = reducer;

const DEFAULT = { id: 0, name: '' };

// Tagging a location writes to the slice for the node being tagged, and
// nothing browses that slice first — the gadget fetches its own list. So the
// helpers are handed `undefined` and have to build the shape themselves.
// They did not, and `{ ...undefined }.byId[id] = item` threw inside the
// reducer, which rejected the add before it could resolve: the dialog stayed
// open and the list never refreshed.
describe('a list that does not exist yet', () => {
  it('editItem creates the slice instead of throwing', () => {
    const items = editItem(undefined, { id: 154493, name: 'Vancouver' }, DEFAULT);

    expect(items.allIds).toEqual([154493]);
    expect(items.byId[154493]).toEqual({ id: 154493, name: 'Vancouver' });
  });

  it('deleteItem returns an empty slice instead of throwing', () => {
    const items = deleteItem(undefined, { id: 154493 }, DEFAULT);

    expect(items.allIds).toEqual([]);
    expect(items.byId).toEqual({});
  });
});

// The spread in these helpers is shallow, so byId and allIds used to be the
// PREVIOUS state's own objects, edited in place. Redux had already handed
// that state to connected components, and a mutation it cannot see is a
// re-render it does not do.
describe('the previous state', () => {
  it('is not mutated by editItem', () => {
    const before = { byId: { 1: { id: 1 } }, allIds: [1] };

    editItem(before, { id: 2 }, DEFAULT);

    expect(before.allIds).toEqual([1]);
    expect(before.byId).toEqual({ 1: { id: 1 } });
  });

  it('is not mutated by deleteItem', () => {
    const before = { byId: { 1: { id: 1 }, 2: { id: 2 } }, allIds: [1, 2] };

    deleteItem(before, { id: 2 }, DEFAULT);

    expect(before.allIds).toEqual([1, 2]);
    expect(before.byId).toEqual({ 1: { id: 1 }, 2: { id: 2 } });
  });

  it('keeps the items that were not removed', () => {
    const items = deleteItem(
      { byId: { 1: { id: 1 }, 2: { id: 2 } }, allIds: [1, 2] },
      { id: 2 },
      DEFAULT,
    );

    expect(items.allIds).toEqual([1]);
    expect(items.byId).toEqual({ 1: { id: 1 } });
  });
});

describe('pinChanged', () => {
  const list = {
    byId: {
      1: { id: 1, pinned: true, owner: { id: 7 } },
      2: { id: 2, pinned: false, owner: { id: 7 } },
      3: { id: 3, pinned: true, owner: { id: 8 } },
    },
    allIds: [1, 2, 3],
    current: { id: 1, pinned: true, owner: { id: 7 } },
  };

  it('moves the pin: the post that had it on that profile gives it up', () => {
    const next = reducer.pinChanged(list, { id: 2, pinned: true, owner: { id: 7 } });

    expect(next.byId[2].pinned).toBe(true);
    expect(next.byId[1].pinned).toBe(false);
    // Another profile's pin is its own.
    expect(next.byId[3].pinned).toBe(true);
    expect(next.current.pinned).toBe(false);
    // The list it was given is not written through.
    expect(list.byId[1].pinned).toBe(true);
  });

  it('takes a pin off and leaves the rest alone', () => {
    const next = reducer.pinChanged(list, { id: 1, pinned: false, owner: { id: 7 } });

    expect(next.byId[1].pinned).toBe(false);
    expect(next.byId[3].pinned).toBe(true);
  });

  it('gives back the same list when nothing in it changes', () => {
    expect(reducer.pinChanged(list, { id: 99, pinned: false, owner: { id: 7 } })).toBe(list);
    expect(reducer.pinChanged(list, { id: 3, pinned: true, owner: { id: 8 } })).toBe(list);
    expect(reducer.pinChanged(undefined, { id: 1 })).toBe(undefined);
  });
});
