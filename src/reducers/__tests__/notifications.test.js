/* eslint-env jest */
import reducer from '../notifications';

// Mark all read marks every one on the page read, and nothing else changes.
it('marks every notification on the page read', () => {
  let state = reducer(undefined, {
    type: 'NOTIFICATIONS_BROWSE_SUCCESS',
    notifications: { 1: { id: 1, isRead: false }, 2: { id: 2, isRead: true } },
    ids: [1, 2],
    start: 0,
    total: 2,
    hasMore: false,
  });
  state = reducer(state, { type: 'NOTIFICATIONS_READ_ALL' });
  expect(state.notifications.byId[1].isRead).toBe(true);
  expect(state.notifications.byId[2].isRead).toBe(true);
  expect(state.notifications.allIds).toEqual([1, 2]);
  expect(state.total).toBe(2);
});
