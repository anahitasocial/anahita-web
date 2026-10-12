import { useEffect, useState } from 'react';

import api from '../../api';

// Reads one custom feed, with the profiles and places it names.
//
// `feed` is null while it is being read, and stays null with `isMissing` set
// when there is none: one that does not exist and one not shared with the
// viewer are answered the same way, and are not told apart here either.
const useFeed = (id) => {
  const [feed, setFeed] = useState(null);
  const [isMissing, setIsMissing] = useState(false);

  const load = () => {
    return api.customFeeds.read(id).then((result) => {
      setFeed(result.data);
      setIsMissing(false);
    }).catch(() => {
      setFeed(null);
      setIsMissing(true);
    });
  };

  useEffect(() => {
    setFeed(null);
    setIsMissing(false);
    load();
  }, [id]);

  return { feed, isMissing, reload: load };
};

export default useFeed;
