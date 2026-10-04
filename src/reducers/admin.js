import {
  Admin as ADMIN,
  Session as SESSION,
} from '../constants';

const initState = {
  // How many things are waiting, by kind. Empty until first read.
  counts: {},
  isFetching: false,
  error: '',
};

export default (state = { ...initState }, action) => {
  switch (action.type) {
    case ADMIN.COUNTS.REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case ADMIN.COUNTS.SUCCESS:
      return {
        ...state,
        counts: { ...state.counts, ...action.counts },
        isFetching: false,
        error: '',
      };
    case ADMIN.COUNTS.FAILURE:
      return {
        ...state,
        isFetching: false,
        error: action.error,
      };
    // Signing out must not leave one administrator's counts for the next
    // person to use this browser.
    case SESSION.DELETE.SUCCESS:
      return { ...initState };
    default:
      return state;
  }
};
