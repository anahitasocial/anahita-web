/* eslint-env jest */
import createReducer from '../create';

const reducer = createReducer('notifications', { id: 0 });

const listOf = (...ids) => {
  return reducer(undefined, {
    type: 'NOTIFICATIONS_BROWSE_SUCCESS',
    notifications: Object.fromEntries(ids.map((id) => { return [id, { id }]; })),
    ids,
    start: 0,
    total: 10,
    hasMore: true,
  });
};

describe('deleting from a list', () => {
  it('takes the one the action names, and lowers the total', () => {
    let state = listOf(1, 2, 3);
    // Two deletes asked at once: the second is `current` when the first
    // comes back.
    state = reducer(state, { type: 'NOTIFICATIONS_DELETE_REQUEST', node: { id: 1 } });
    state = reducer(state, { type: 'NOTIFICATIONS_DELETE_REQUEST', node: { id: 2 } });
    state = reducer(state, { type: 'NOTIFICATIONS_DELETE_SUCCESS', node: { id: 1 } });
    expect(state.notifications.allIds).toEqual([2, 3]);
    expect(state.total).toBe(9);

    state = reducer(state, { type: 'NOTIFICATIONS_DELETE_SUCCESS', node: { id: 2 } });
    expect(state.notifications.allIds).toEqual([3]);
    expect(state.total).toBe(8);
  });

  it('leaves the total alone for one that was not listed', () => {
    const state = reducer(listOf(1), { type: 'NOTIFICATIONS_DELETE_SUCCESS', node: { id: 7 } });
    expect(state.total).toBe(10);
  });
});
