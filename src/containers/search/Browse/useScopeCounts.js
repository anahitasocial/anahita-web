import { useEffect, useState } from 'react';

import api from '../../../api';
import { Search as SEARCH } from '../../../constants';

const SCOPES = Object.values(SEARCH.SCOPE);

// How many each tab of the search page finds, for the counts beside the
// tabs and for the words when the open one finds nothing. One request for
// each tab, asking for a single result and reading the total; asked again
// when the words or the distance change, not when the order does, which
// changes no count. Until they come, and when one fails, that tab has no
// count.
const useScopeCounts = (term, params = {}) => {
  const [counts, setCounts] = useState({});
  const key = JSON.stringify(params);

  useEffect(() => {
    let current = true;
    setCounts({});

    if (!term) {
      return undefined;
    }

    SCOPES.forEach((scope) => {
      api.search.browse({
        ...params,
        term,
        scope,
        start: 0,
        limit: 1,
      }).then(({ data }) => {
        const total = (data && data.pagination && data.pagination.total) || 0;
        if (current) {
          setCounts((known) => {
            return { ...known, [scope]: total };
          });
        }
      }).catch(() => {
        // No count for that tab.
      });
    });

    return () => {
      current = false;
    };
  }, [term, key]);

  return counts;
};

export default useScopeCounts;
