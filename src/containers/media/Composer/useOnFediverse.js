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

// Whether the viewer has connected their Bluesky account, asked once and
// remembered in the same way.
let knownBluesky = { viewerId: 0, asked: null };

const askBluesky = (viewerId) => {
  if (knownBluesky.viewerId !== viewerId || !knownBluesky.asked) {
    knownBluesky = {
      viewerId,
      asked: api.federation.blueskySettings()
        .then((result) => {
          return Boolean(result.data && result.data.connected && !result.data.broken);
        })
        .catch(() => {
          return false;
        }),
    };
  }

  return knownBluesky.asked;
};

// Told by the settings page when the viewer connects or disconnects.
export const rememberOnBluesky = (connected) => {
  if (knownBluesky.viewerId) {
    knownBluesky = { viewerId: knownBluesky.viewerId, asked: Promise.resolve(Boolean(connected)) };
  } else {
    knownBluesky = { viewerId: 0, asked: null };
  }
};

export const useOnBluesky = (viewer) => {
  const viewerId = (viewer && viewer.id) || 0;
  const [onBluesky, setOnBluesky] = useState(false);

  useEffect(() => {
    let current = true;

    if (!viewerId) {
      setOnBluesky(false);
      return undefined;
    }

    askBluesky(viewerId).then((connected) => {
      if (current) {
        setOnBluesky(connected);
      }
    });

    return () => {
      current = false;
    };
  }, [viewerId]);

  return onBluesky;
};

// What to say under a reply being written to something from another
// server, when it will be read here and not there: the name of the words
// to say it with, or '' for nothing.
//
// Under something from the fediverse, by somebody who is not on it. Under
// something from Bluesky, by somebody who has not connected their account
// there. Nothing, where the reply will reach whoever it answers, or where
// what is answered was written here.
export const useReplyStaysHere = (viewer, answered) => {
  const onFediverse = useOnFediverse(viewer);
  const onBluesky = useOnBluesky(viewer);
  const type = answered && typeof answered.type === 'string' ? answered.type : '';
  const uri = answered && typeof answered.uri === 'string' ? answered.uri : '';

  if (uri.startsWith('at://') || type.includes('.atproto-service.')) {
    return onBluesky ? '' : 'federation:composer.replyStaysHereBluesky';
  }
  if ((uri || type.includes('.activitypub-service.')) && !onFediverse) {
    return 'federation:composer.replyStaysHere';
  }
  return '';
};

export default useOnFediverse;
