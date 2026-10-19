import createReducer from './create';
import DEFAULT_NOTIFICATION from '../proptypes/NotificationDefault';

const reducer = createReducer('notifications', DEFAULT_NOTIFICATION);

// What a line of several is, which only the list says (roadmap row 97,
// part 3): marking one read answers with that one alone, and the line keeps
// its group.
const GROUP = ['ids', 'others', 'othersCount'];

export default (state, action) => {
  const before = state && action.type === 'NOTIFICATIONS_EDIT_SUCCESS' && action.node ?
    state.notifications.byId[action.node.id] :
    null;
  const next = reducer(state, action);

  if (before && next.notifications.byId[action.node.id]) {
    const kept = {};
    GROUP.forEach((key) => {
      if (before[key] !== undefined) {
        kept[key] = before[key];
      }
    });
    // And, for a line of several, what can be done from it: the one alone
    // would offer what the line does not, such as + Follow.
    if (before.ids && before.ids.length > 1) {
      kept.actions = before.actions;
    }
    return {
      ...next,
      notifications: {
        ...next.notifications,
        byId: {
          ...next.notifications.byId,
          [action.node.id]: { ...next.notifications.byId[action.node.id], ...kept },
        },
      },
    };
  }

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
