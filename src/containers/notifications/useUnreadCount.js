import { useEffect, useRef } from 'react';
import axios from 'axios';

import heartbeat from '../../utils/heartbeat';

// The longest wait between two checks of the bell's count, in milliseconds:
// five minutes unless the installation sets another.
const LONGEST = Number(process.env.REACT_APP_NOTIFICATIONS_CHECK_INTERVAL) || 300000;

// 15 seconds, 30, 1 minute, 2, then the longest, for as long as the page is
// looked at.
export const WAITS = [15000, 30000, 60000, 120000].filter((wait) => {
  return wait < LONGEST;
}).concat([LONGEST]);

// The tabs of one browser share the asking: one of them checks and tells the
// others.
const LOCK = 'anahita-notifications-check';
const CHANNEL = 'anahita-notifications';

const looked = () => {
  return typeof document === 'undefined' || !document.hidden;
};

// Whether a request the viewer made is one that tends to bring answers: a
// post, a reply, a follow, an event's answer. Anything they send but their
// notifications' own, and signing in.
export const isAnAction = (config = {}) => {
  const method = (config.method || 'get').toLowerCase();
  const url = config.url || '';
  return method !== 'get' && !/notifications|oauth/.test(url);
};

// Keeps the bell's count (roadmap row 96, part 4). No sockets: it asks.
//
// 1. At once when the app opens, when the tab is looked at again, when the
//    window comes into focus and when the connection comes back.
// 2. Less and less often while nothing is new (WAITS), and never from a tab
//    nobody is looking at.
// 3. Soon again after something new, and after the viewer does something
//    that tends to bring answers.
// 4. From one tab for all of them: the tab being looked at takes the lock
//    (Web Locks) and tells the others over a BroadcastChannel. Where a
//    browser has neither, each tab asks for itself.
// 5. Each wait a fifth longer or shorter at random, so tabs opened together
//    do not ask together.
// 6. A failure keeps the last count and waits longer.
//
// `ask` answers with a promise of { count, newestAt }. `onCount` is given
// each answer, this tab's or another's.
const useUnreadCount = ({ ask, onCount }) => {
  const now = useRef({});
  now.current = { ask, onCount };

  useEffect(() => {
    let alive = true;
    let leading = false;
    let release = null;
    let waiting = null;
    let last = null;

    const channel = typeof BroadcastChannel !== 'undefined' ?
      new BroadcastChannel(CHANNEL) : null;
    const locks = typeof navigator !== 'undefined' && navigator.locks ?
      navigator.locks : null;

    const tell = (message) => {
      if (channel) {
        channel.postMessage(message);
      }
    };

    const beats = heartbeat.createHeartbeat({
      waits: WAITS,
      holdLast: true,
      spread: 0.2,
      beat: () => {
        return now.current.ask().then(({ count, newestAt }) => {
          if (!alive) {
            return false;
          }
          const fresh = last !== null && newestAt !== last.newestAt;
          last = { count, newestAt };
          now.current.onCount(count, newestAt);
          tell({ type: 'count', count, newestAt });
          return fresh;
        });
      },
    });

    const lead = () => {
      leading = true;
      beats.wake();
    };

    const follow = () => {
      leading = false;
      beats.stop();
      if (release) {
        release();
        release = null;
      }
      if (waiting) {
        waiting.abort();
        waiting = null;
      }
    };

    // Looked at: this tab asks for all of them, unless another being looked
    // at already does, which is asked to now.
    const take = () => {
      if (!alive || leading || waiting || !looked()) {
        return;
      }
      if (!locks) {
        lead();
        return;
      }
      tell({ type: 'wake' });
      waiting = new AbortController();
      locks.request(LOCK, { signal: waiting.signal }, () => {
        waiting = null;
        if (!alive || !looked()) {
          return undefined;
        }
        lead();
        return new Promise((resolve) => {
          release = resolve;
        });
      }).catch(() => {
        // Given up, when the tab was hidden or closed while it waited.
      });
    };

    const wake = () => {
      if (leading) {
        beats.wake();
      } else {
        tell({ type: 'wake' });
      }
    };

    const seen = () => {
      if (looked()) {
        take();
        wake();
      } else {
        follow();
      }
    };

    const soon = () => {
      if (leading) {
        beats.start();
      } else {
        tell({ type: 'soon' });
      }
    };

    if (channel) {
      channel.onmessage = ({ data = {} }) => {
        if (data.type === 'count') {
          last = { count: data.count, newestAt: data.newestAt };
          now.current.onCount(data.count, data.newestAt);
        } else if (data.type === 'wake' && leading) {
          beats.wake();
        } else if (data.type === 'soon' && leading) {
          beats.start();
        }
      };
    }

    const acted = axios.interceptors.response.use((response) => {
      if (isAnAction(response && response.config)) {
        soon();
      }
      return response;
    });

    document.addEventListener('visibilitychange', seen);
    window.addEventListener('focus', wake);
    window.addEventListener('online', wake);
    take();

    return () => {
      alive = false;
      follow();
      axios.interceptors.response.eject(acted);
      document.removeEventListener('visibilitychange', seen);
      window.removeEventListener('focus', wake);
      window.removeEventListener('online', wake);
      if (channel) {
        channel.close();
      }
    };
  }, []);
};

export default useUnreadCount;
