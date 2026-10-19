// How many of the viewer's notifications are unread, as the bell shows it,
// and when the newest was told (`newestAt`), which says that there is
// something new to fetch although the count is the same.
//
// Kept here, apart from the list, so that the bell and the list agree:
// reading or deleting one in the list lowers the count at once, instead of
// at the next check.
export const DEFAULT = {
  count: 0,
  newestAt: '',
};

export default (state = DEFAULT, action) => {
  switch (action.type) {
    case 'NOTIFICATIONS_UNREAD_SET':
      return {
        count: Math.max(0, Number(action.count) || 0),
        newestAt: action.newestAt || '',
      };
    case 'NOTIFICATIONS_UNREAD_LESS':
      return {
        ...state,
        count: Math.max(0, state.count - (action.by || 1)),
      };
    case 'NOTIFICATIONS_UNREAD_RESET':
      return DEFAULT;
    default:
      return state;
  }
};
