import { useEffect, useState } from 'react';

import api from '../../../api';

// Whether the viewer is on the fediverse, asked once and remembered: the
// composer is on every profile and is drawn again and again.
//
// Unknown is no: where there is no such service, or it does not answer,
// nothing is said about the fediverse at all.
let known = { viewerId: 0, asked: null };

const ask = (viewerId) => {
  if (known.viewerId !== viewerId || !known.asked) {
    known = {
      viewerId,
      asked: api.federation.settings()
        .then((result) => {
          return Boolean(result.data && result.data.enabled);
        })
        .catch(() => {
          return false;
        }),
    };
  }

  return known.asked;
};

// Told by the settings page when the viewer turns it on or off, so that
// the composer does not go on saying what was true before.
export const rememberOnFediverse = (enabled) => {
  if (known.viewerId) {
    known = { viewerId: known.viewerId, asked: Promise.resolve(Boolean(enabled)) };
  } else {
    known = { viewerId: 0, asked: null };
  }
};

const useOnFediverse = (viewer) => {
  const viewerId = (viewer && viewer.id) || 0;
  const [onFediverse, setOnFediverse] = useState(false);

  useEffect(() => {
    let current = true;

    if (!viewerId) {
      setOnFediverse(false);
      return undefined;
    }

    ask(viewerId).then((enabled) => {
      if (current) {
        setOnFediverse(enabled);
      }
    });

    return () => {
      current = false;
    };
  }, [viewerId]);

  return onFediverse;
};

// What to say under a reply being written to something from another
// server by somebody who is not on the fediverse: it will be read here and
// not there. Nothing, where the reply will reach whoever it answers, or
// where what is answered was written here.
export const useReplyStaysHere = (viewer, answered) => {
  const onFediverse = useOnFediverse(viewer);
  const fromElsewhere = Boolean(answered && (answered.uri ||
    (typeof answered.type === 'string' && answered.type.includes('.activitypub-service.'))));

  return fromElsewhere && !onFediverse;
};

export default useOnFediverse;
