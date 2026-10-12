import { useEffect, useState } from 'react';

import api from '../../api';

// The custom feeds the viewer keeps on their home page, in their order, for
// whatever lists them: the menu under Home, and the tabs of the home page.
//
// Read when somebody signs in, and again whenever a feed is made, changed,
// deleted or moved anywhere in the app. Empty for a visitor, and empty when
// they cannot be read: the page is then the one feed it always was.
const usePinnedFeeds = (isAuthenticated) => {
  const [feeds, setFeeds] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setFeeds([]);
      return undefined;
    }

    let isCurrent = true;

    const load = () => {
      api.customFeeds.pinned().then((result) => {
        if (isCurrent) {
          setFeeds(result.data.data || []);
        }
      }).catch(() => {
        if (isCurrent) {
          setFeeds([]);
        }
      });
    };

    load();
    const stop = api.customFeeds.onChange(load);

    return () => {
      isCurrent = false;
      stop();
    };
  }, [isAuthenticated]);

  return feeds;
};

export default usePinnedFeeds;
