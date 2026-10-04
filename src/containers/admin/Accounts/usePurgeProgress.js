import { useEffect, useState } from 'react';

import api from '../../../api';

const POLL_EVERY_MS = 1500;

// How long before the wait is called slow. A purge is usually over in
// seconds; one that is not has probably been left to the scheduled job,
// which runs every ten minutes.
const SLOW_AFTER_MS = 30000;

// Follows one purge request until nothing in it is still queued.
//
// A request answers before the work is done, with a batch id. This asks
// how the batch is doing every second and a half, and stops asking when
// the answer has nothing left queued, or when the component using it goes
// away. The purge itself carries on either way: nothing here keeps it
// alive.
//
// Returns:
//   batch     the latest answer ({ total, queued, done, failed, items }),
//             or null before the first one
//   finished  nothing is queued any more
//   slow      it has been going for a while
//   failing   the last attempt to ask failed; it keeps trying
const usePurgeProgress = (namespace, batchId) => {
  const [batch, setBatch] = useState(null);
  const [slow, setSlow] = useState(false);
  const [failing, setFailing] = useState(false);

  useEffect(() => {
    if (!batchId) {
      setBatch(null);
      setSlow(false);
      setFailing(false);
      return undefined;
    }

    let live = true;
    let timer = null;
    const started = Date.now();

    const ask = () => {
      api.accounts.purgeProgress(namespace, batchId)
        .then(({ data }) => {
          if (!live) {
            return;
          }

          setBatch(data);
          setFailing(false);

          if (data.queued > 0) {
            setSlow(Date.now() - started > SLOW_AFTER_MS);
            timer = setTimeout(ask, POLL_EVERY_MS);
          }
        })
        .catch(() => {
          if (!live) {
            return;
          }

          // Asking failed; the purge has not. Keep asking.
          setFailing(true);
          timer = setTimeout(ask, POLL_EVERY_MS * 2);
        });
    };

    ask();

    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [namespace, batchId]);

  const finished = Boolean(batch) && batch.queued === 0;

  return {
    batch,
    finished,
    slow: slow && !finished,
    failing: failing && !finished,
  };
};

export default usePurgeProgress;
