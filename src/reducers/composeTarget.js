// Where the + button posts (containers/media/Composer/ComposeButton.jsx),
// said by the page that is open: a profile the viewer may post to, or
// `{ id: 'home', home: true }` for the home page, which posts to their own.
// Nothing on any other page, which has no button (the user, 2026-10-19).
export default (state = null, action) => {
  switch (action.type) {
    case 'COMPOSE_TARGET_SET':
      return action.actor || null;
    case 'COMPOSE_TARGET_CLEAR':
      // Only the one that set it: a page that opens before the last one
      // has closed keeps its own.
      return state && state.id === action.id ? null : state;
    default:
      return state;
  }
};
