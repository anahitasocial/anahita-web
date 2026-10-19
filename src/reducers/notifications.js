import createReducer from './create';
import DEFAULT_NOTIFICATION from '../proptypes/NotificationDefault';

const reducer = createReducer('notifications', DEFAULT_NOTIFICATION);

export default (state, action) => {
  const next = reducer(state, action);

  // Mark all read: every one on the page is read, as the server has it.
  if (action.type === 'NOTIFICATIONS_READ_ALL') {
    const list = next.notifications;
    const byId = {};
    Object.keys(list.byId).forEach((id) => {
      byId[id] = { ...list.byId[id], isRead: true };
    });
    return { ...next, notifications: { ...list, byId } };
  }

  return next;
};
