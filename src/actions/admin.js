import apis from '../api';
import { Admin as ADMIN } from '../constants';

// Reads how many things are waiting for an administrator, for the number
// on the Administration menu entry and on its tabs.
//
// One request per kind of thing, each asking for a single row: it is
// the total in the pagination that is wanted, not the rows.
//
// A failure leaves the previous counts in place. A number that is a few
// minutes old is more use than a badge that blinks out whenever a
// request fails.
function readCounts() {
  return (dispatch) => {
    dispatch({ type: ADMIN.COUNTS.REQUEST });

    return apis.signupRequests.browse({ limit: 1 })
      .then(({ data }) => {
        const pagination = (data && data.pagination) || {};

        dispatch({
          type: ADMIN.COUNTS.SUCCESS,
          counts: {
            signupRequests: Number(pagination.total) || 0,
          },
        });
      })
      .catch((error) => {
        dispatch({
          type: ADMIN.COUNTS.FAILURE,
          error: error.message,
        });
      });
  };
}

export default {
  readCounts,
};
