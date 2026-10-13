import createReducer from './create';
import NODE_DEFAULT from '../proptypes/NodeDefault';
import utils from '../utils';

const {
  editItem,
} = utils.reducer;

export default (namespace) => {
  return (iniState, action) => {
    const state = createReducer(namespace, NODE_DEFAULT)(iniState, action);
    const { type } = action;

    // A post removed from anywhere leaves the feed too: the post itself,
    // and a repost of it. The removal is announced under the post's own
    // kind (NOTES_DELETE_SUCCESS and so on), not under the feed's name.
    if (/^[A-Z]+_DELETE_SUCCESS$/.test(type) && action.node && action.node.id) {
      const list = state[namespace];
      const gone = list.allIds.filter((itemId) => {
        const item = list.byId[itemId];
        return itemId === action.node.id ||
          Boolean(item && item.parent && item.parent.id === action.node.id);
      });

      if (gone.length === 0) {
        return state;
      }

      const byId = { ...list.byId };
      gone.forEach((itemId) => {
        delete byId[itemId];
      });

      return {
        ...state,
        [namespace]: {
          ...list,
          byId,
          allIds: list.allIds.filter((itemId) => {
            return !gone.includes(itemId);
          }),
        },
      };
    }

    switch (type) {
      // The head of the feed read again, with what was posted since it
      // was opened (containers/feed/useNewPosts.js). It goes before what
      // is held, in its own order; what is held already is brought up to
      // date and stays where it was.
      //
      // When nothing of it is held, more was posted than one page holds,
      // and there is no knowing what lies between: the feed is begun
      // again from this page, to be read on from there.
      case `${namespace.toUpperCase()}_BROWSE_PREPEND`: {
        const list = state[namespace];
        const page = (action.nodes || []).filter((node) => {
          return node && node.id;
        });
        if (page.length === 0) {
          return state;
        }

        const ids = page.map((node) => { return node.id; });
        const joins = list.allIds.length === 0 || ids.some((id) => {
          return list.byId[id] !== undefined;
        });
        const byId = joins ? { ...list.byId } : {};
        page.forEach((node) => {
          byId[node.id] = node;
        });

        return {
          ...state,
          [namespace]: {
            ...list,
            byId,
            allIds: joins ?
              [...ids, ...list.allIds.filter((id) => { return !ids.includes(id); })] :
              ids,
          },
          hasMore: joins ? state.hasMore : true,
        };
      }
      case `${namespace.toUpperCase()}_LIKES_ADD_REQUEST`:
      case `${namespace.toUpperCase()}_LIKES_DELETE_REQUEST`:
        return {
          ...state,
          isFetching: true,
          success: false,
          error: '',
        };
      case `${namespace.toUpperCase()}_LIKES_ADD_SUCCESS`:
      case `${namespace.toUpperCase()}_LIKES_DELETE_SUCCESS`: {
        const { node, child } = action;
        const hasChild = child && child.id;
        if (hasChild) {
          child.parent = node;
        }
        return {
          ...state,
          [namespace]: editItem(
            state[namespace],
            hasChild ? child : node,
            NODE_DEFAULT,
          ),
          isFetching: false,
          success: false,
          error: '',
        };
      }
      case `${namespace.toUpperCase()}_LIKES_ADD_FAILURE`:
      case `${namespace.toUpperCase()}_LIKES_DELETE_FAILURE`:
        return {
          ...state,
          isFetching: false,
          success: false,
          error: action.error,
        };
      default:
        return state;
    }
  };
};
