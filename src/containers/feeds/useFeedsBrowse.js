import { useEffect, useState } from 'react';

import api from '../../api';
import i18n from '../../languages';
import reasonOf, { isExplained } from './reasonOf';

const PAGE = 20;

// Whose feeds the list shows: everyone's, theirs among them, the default;
// the feeds of the people they follow; theirs alone; or the ones on their
// home page, in their order there.
export const WHOSE = ['everyone', 'following', 'mine', 'home'];

// The list of feeds, apart from how it is drawn (roadmap row 125): a page of
// the chosen list at a time, and the feeds on the viewer's home page, which
// every row says whether it is among and which "On your home" lists.
//
// It gives what to show (`shown`), whether it is loading or failed, whether
// there is more and `more()` for it; and, for a row, its place on the home
// page (`placeOf(feed)`, -1 when it is not there), `pin(feed, isPinned)`,
// `move(feed, by)` and `deleteItem(feed)`. While one of those is on its way,
// `waiting` is true.
const useFeedsBrowse = ({ whose, alertSuccess, alertError }) => {
  const [list, setList] = useState([]);
  const [next, setNext] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [pinned, setPinned] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);
  const [waiting, setWaiting] = useState(false);

  // The feeds on the home page: the list of "On your home", and the house
  // on every row.
  const loadPinned = () => {
    return api.customFeeds.pinned().then((result) => {
      setPinned(result.data.data || []);
    });
  };

  // A page of the chosen list, after `start`; the first page anew.
  const loadPage = (start) => {
    return api.customFeeds.discover({ whose, start, limit: PAGE }).then((result) => {
      const page = result.data.data || [];
      const pagination = result.data.pagination || {};
      setList((before) => {
        return start === 0 ? page : [...before, ...page];
      });
      // camelCased by the API's client, as every key is.
      setNext(pagination.nextStart || 0);
      setHasMore(Boolean(pagination.hasMore));
    });
  };

  const load = () => {
    setIsLoading(true);
    return Promise.all([loadPinned(), whose === 'home' ? Promise.resolve() : loadPage(0)]).then(() => {
      setHasFailed(false);
    }).catch(() => {
      setHasFailed(true);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    setList([]);
    setHasMore(false);
    load();
  }, [whose]);

  const failed = (response) => {
    const reason = reasonOf(response);

    alertError(i18n.t(isExplained(reason) ?
      `customFeeds:form.errors.${reason}` :
      'customFeeds:prompts.failed'));
  };

  // Runs a change to the feeds, holding the buttons still while it is on
  // its way, and saying so when it fails.
  const change = (request) => {
    setWaiting(true);
    request().catch(failed).finally(() => {
      setWaiting(false);
    });
  };

  const pinnedIds = pinned.map((feed) => {
    return feed.id;
  });

  const pin = (feed, isPinned) => {
    change(() => {
      return api.customFeeds.setPinned(feed, isPinned).then(() => {
        alertSuccess(i18n.t(isPinned ? 'customFeeds:prompts.pinned' : 'customFeeds:prompts.unpinned'));
        return loadPinned();
      });
    });
  };

  const deleteItem = (feed) => {
    change(() => {
      return api.customFeeds.deleteItem(feed).then(() => {
        alertSuccess(i18n.t('customFeeds:prompts.deleted'));
        setList((before) => {
          return before.filter((each) => {
            return each.id !== feed.id;
          });
        });
        return loadPinned();
      });
    });
  };

  // Moves a feed one place among the tabs of the home page.
  const move = (feed, by) => {
    const from = pinnedIds.indexOf(feed.id);
    const to = from + by;

    if (from < 0 || to < 0 || to >= pinnedIds.length) {
      return;
    }

    const ids = [...pinnedIds];
    ids.splice(from, 1);
    ids.splice(to, 0, feed.id);

    change(() => {
      return api.customFeeds.setPins(ids).then((result) => {
        setPinned(result.data.data || []);
      });
    });
  };

  return {
    shown: whose === 'home' ? pinned : list,
    isLoading,
    hasFailed,
    hasMore,
    more: () => {
      loadPage(next).catch(() => {
        setHasMore(false);
      });
    },
    waiting,
    pinnedCount: pinnedIds.length,
    placeOf: (feed) => {
      return pinnedIds.indexOf(feed.id);
    },
    pin,
    move,
    deleteItem,
  };
};

export default useFeedsBrowse;
