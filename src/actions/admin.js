import apis from '../api';
import { Admin as ADMIN } from '../constants';

// Reads how many things are waiting for an administrator, for the number
// on the Administration menu entry and on its tabs.
//
// One request per kind of thing: pending signup requests (the total in
// the pagination of a one-row page) and open reports.
//
// A failure leaves the previous counts in place. A number that is a few
// minutes old is more use than a badge that blinks out whenever a
// request fails.
function readCounts() {
  return (dispatch) => {
    dispatch({ type: ADMIN.COUNTS.REQUEST });

    // Each count on its own: one failing must not blank the other.
    const signupRequests = apis.signupRequests.browse({ limit: 1 })
      .then(({ data }) => {
        const pagination = (data && data.pagination) || {};
        return { signupRequests: Number(pagination.total) || 0 };
      });

    const reports = apis.abuseReports.summary()
      .then(({ data }) => {
        return { reports: Number(data && data.open) || 0 };
      });

    return Promise.allSettled([signupRequests, reports])
      .then((results) => {
        const counts = {};
        let failure = '';

        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            Object.assign(counts, result.value);
          } else {
            failure = result.reason && result.reason.message;
          }
        });

        if (Object.keys(counts).length > 0) {
          dispatch({ type: ADMIN.COUNTS.SUCCESS, counts });
        }
        if (failure) {
          dispatch({ type: ADMIN.COUNTS.FAILURE, error: failure });
        }
      });
  };
}

export default {
  readCounts,
};
