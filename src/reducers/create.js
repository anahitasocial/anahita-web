import _ from 'lodash';
import utils from '../utils';

const {
  editItem,
  deleteItem,
  pinChanged,
} = utils.reducer;

// A browse response is stale iff it was issued before the most recent reset —
// e.g. the previous tab's request resolving after the tab was switched.
// Action creators that don't stamp a requestId are unaffected.
const isStale = (action, state) => {
  return typeof action.requestId === 'number' && action.requestId < state.lastResetId;
};

// Write a page of ids at its own offset instead of blindly appending, so a
// response that arrives out of order still lands in the right place. Only
// pages contiguous with what we already have can be positioned without leaving
// holes — anything else (including producers that send no `start`) falls back
// to appending. The tail is kept and deduped rather than overwritten, so a page
// that had to be appended earlier is repositioned instead of being lost.
const mergeIds = (allIds, ids, start) => {
  const offset = (Number.isInteger(start) && start >= 0 && start <= allIds.length) ?
    start :
    allIds.length;

  return _.uniq([
    ...allIds.slice(0, offset),
    ...ids,
    ...allIds.slice(offset),
  ]);
};

export default (namespace, defaultNode) => {
  const DEFAULT_STATE = {
    isFetching: false,
    [namespace]: {
      byId: {},
      allIds: [],
      current: { ...defaultNode },
    },
    total: 0,
    hasMore: true,
    lastResetId: 0,
    error: '',
    success: false,
  };

  return (state = DEFAULT_STATE, action) => {
    switch (action.type) {
      case `${namespace.toUpperCase()}_BROWSE_RESET`:
        return {
          ...state,
          ...DEFAULT_STATE,
          lastResetId: action.resetId || 0,
        };
      case `${namespace.toUpperCase()}_BROWSE_REQUEST`:
      case `${namespace.toUpperCase()}_READ_REQUEST`:
      case `${namespace.toUpperCase()}_EDIT_REQUEST`:
      case `${namespace.toUpperCase()}_EDIT_ACCESS_REQUEST`:
      case `${namespace.toUpperCase()}_ADD_REQUEST`:
        return {
          ...state,
          isFetching: true,
          success: false,
          error: '',
        };
      case `${namespace.toUpperCase()}_DELETE_REQUEST`:
        return {
          ...state,
          [namespace]: {
            ...state[namespace],
            current: action.node,
          },
          isFetching: true,
          success: false,
          error: '',
        };
      case `${namespace.toUpperCase()}_BROWSE_SUCCESS`:
        if (isStale(action, state)) {
          return state;
        }

        return {
          ...state,
          [namespace]: {
            byId: {
              ...state[namespace].byId,
              ...action[namespace],
            },
            allIds: mergeIds(state[namespace].allIds, action.ids, action.start),
            current: { ...defaultNode },
          },
          total: action.total,
          hasMore: action.hasMore,
          isFetching: false,
        };
      case `${namespace.toUpperCase()}_READ_SUCCESS`:
        return {
          ...state,
          isFetching: false,
          [namespace]: editItem(
            state[namespace],
            action.node,
            defaultNode,
          ),
          success: false,
        };
      case `${namespace.toUpperCase()}_EDIT_SUCCESS`:
      case `${namespace.toUpperCase()}_EDIT_ACCESS_SUCCESS`:
      case `${namespace.toUpperCase()}_ADD_SUCCESS`:
        return {
          ...state,
          isFetching: false,
          [namespace]: editItem(
            state[namespace],
            action.node,
            defaultNode,
          ),
          success: true,
        };
      // The Access card saves through the `${namespace}_access` actions, whose
      // success no reducer used to handle — the server's answer was dropped
      // and the store kept the old access level until a reload. The
      // Permissions tab reads it to decide whether comments can be set.
      //
      // The node only, not success: the Access card raises its own alert,
      // and success here would add the page-level one on top.
      case `${namespace.toUpperCase()}_ACCESS_EDIT_SUCCESS`:
        return {
          ...state,
          [namespace]: editItem(
            state[namespace],
            action.node,
            defaultNode,
          ),
        };
      case `${namespace.toUpperCase()}_DELETE_SUCCESS`:
        return {
          ...state,
          isFetching: false,
          success: false,
          [namespace]: deleteItem(
            state[namespace],
            state[namespace].current,
            defaultNode,
          ),
        };
      case `${namespace.toUpperCase()}_BROWSE_FAILURE`:
        // A stale failure must not permanently kill scrolling on the new list.
        if (isStale(action, state)) {
          return state;
        }

        return {
          ...state,
          hasMore: false,
          isFetching: false,
          error: action.error,
        };
      case `${namespace.toUpperCase()}_READ_FAILURE`:
      case `${namespace.toUpperCase()}_EDIT_FAILURE`:
      case `${namespace.toUpperCase()}_EDIT_ACCESS_FAILURE`:
      case `${namespace.toUpperCase()}_ADD_FAILURE`:
      case `${namespace.toUpperCase()}_DELETE_FAILURE`:
        return {
          ...state,
          hasMore: false,
          isFetching: false,
          error: action.error,
        };
      // A post was pinned or unpinned, somewhere. Announced once for
      // every list on the page, whatever its kind: the same post can be
      // in a feed and in a list of notes at once.
      case 'POST_PIN_CHANGED': {
        const list = pinChanged(state[namespace], action.node);
        return list === state[namespace] ? state : { ...state, [namespace]: list };
      }
      default:
        return state;
    }
  };
};
