import {
  useCallback, useEffect, useRef, useState,
} from 'react';

import heartbeat from '../../utils/heartbeat';

// How far down the page counts as still being at its top.
const TOP = 160;

const atTop = () => {
  return typeof window === 'undefined' || window.scrollY < TOP;
};

// What was posted since a feed was opened.
//
// The head of the feed is asked for again now and then (utils/heartbeat.js:
// less and less often, stopping when nothing comes, and again when the
// reader returns to the page). What is new is put at the top at once for
// somebody who is at the top. For somebody reading further down it waits,
// and `waiting` says how many: a page that grows above what is being read
// loses the reader's place. `show` puts them in and goes to the top.
//
// `peek` asks for the head of the feed and answers with a promise of its
// posts, newest first. `known` is the posts on the page, by id. `put` puts
// a page of posts at the head of the list. `feedKey` names the feed, and
// everything begins again when it changes.
const useNewPosts = ({
  peek,
  known,
  put,
  feedKey = '',
}) => {
  const [pending, setPending] = useState(null);

  // What the heartbeat reads when it asks, which is later than when it
  // was made.
  const now = useRef({});
  now.current = { peek, known, put };

  useEffect(() => {
    let current = true;
    setPending(null);

    const beats = heartbeat.createHeartbeat({
      beat: () => {
        return now.current.peek().then((posts) => {
          const page = Array.isArray(posts) ? posts : [];
          const fresh = page.filter((post) => {
            return post && post.id && !now.current.known[post.id];
          });

          if (!current || fresh.length === 0) {
            return false;
          }
          if (atTop()) {
            now.current.put(page);
            setPending(null);
          } else {
            setPending({ page, count: fresh.length });
          }
          return true;
        });
      },
    });

    const back = () => {
      if (typeof document === 'undefined' || !document.hidden) {
        beats.wake();
      }
    };

    beats.start();
    document.addEventListener('visibilitychange', back);
    window.addEventListener('focus', back);

    return () => {
      current = false;
      beats.stop();
      document.removeEventListener('visibilitychange', back);
      window.removeEventListener('focus', back);
    };
  }, [feedKey]);

  const show = useCallback(() => {
    if (pending) {
      now.current.put(pending.page);
      setPending(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pending]);

  // Posts that waited and are on the page by now, however they got there,
  // are no longer waiting.
  const waiting = pending ?
    pending.page.filter((post) => { return post && post.id && !known[post.id]; }).length :
    0;

  return { waiting, show };
};

export default useNewPosts;
