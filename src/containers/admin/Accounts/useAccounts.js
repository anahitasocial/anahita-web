import { useCallback, useEffect, useState } from 'react';

import api from '../../../api';
import i18n from '../../../languages';
import permissions from '../../../permissions';

const PAGE_SIZE = 50;

// A select shows '' as nothing chosen, so "no filter" has a value of its
// own.
export const ANY = 'any';

// How long to wait after the last keystroke before searching.
const SEARCH_DELAY_MS = 400;

const PROTECTED_TYPES = ['administrator', 'super-administrator'];

export const NO_FILTERS = {
  tier: ANY,
  state: ANY,
  lastActiveBefore: '',
  createdBefore: '',
  onlyUnverified: false,
  onlyNotOnboarded: false,
  onlyWithoutContent: false,
  onlyWithoutAdmin: false,
};

// Whether an account is an administrator's or a super administrator's,
// which nobody may remove from here.
export const isProtected = (account) => {
  return PROTECTED_TYPES.includes(account.personType);
};

// The accounts list, apart from how it is drawn: what is asked for, what
// came back, and what is selected.
//
// More accounts are fetched by `more()`, which adds to the list. Pages would
// shift under the selection: remove forty accounts and everything after them
// moves up a page.
//
// SELECTION. Kept as the accounts themselves, by id, not as ids alone:
// the confirmation shows how much the selected accounts have written,
// and "select all that match" selects accounts that are not on screen.
// Changing a filter clears it, so nothing is ever selected that the
// filters on screen do not describe. Administrators, super
// administrators and the viewer cannot be selected; the server would
// refuse the whole request for one of them.
const useAccounts = ({ viewer, alertError }) => {
  const [kind, setKind] = useState('person');
  const [filters, setFilters] = useState(NO_FILTERS);
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [isFetching, setIsFetching] = useState(true);

  const [selected, setSelected] = useState({});

  const isGroup = kind === 'group';
  // An event or a website is removed for good one at a time, from its
  // settings: there is no batch purge of them, so the list offers no ticks.
  const oneAtATime = kind === 'event' || kind === 'channel';
  // What groups, events and channels share: content posted in them, and
  // administrators of their own.
  const hasAdmins = isGroup || oneAtATime;

  // The search box filters as it is typed in, once the typing pauses.
  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(search.trim());
    }, SEARCH_DELAY_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  const query = useCallback((limit, offset) => {
    return api.accounts.browse({
      ...filters,
      kind,
      q,
      tier: filters.tier === ANY ? '' : filters.tier,
      state: filters.state === ANY ? '' : filters.state,
      limit,
      offset,
    });
  }, [kind, q, filters]);

  const fetchPage = useCallback((offset) => {
    setIsFetching(true);

    return query(PAGE_SIZE, offset)
      .then(({ data }) => {
        const page = data.data || [];

        setItems((previous) => {
          return offset === 0 ? page : [...previous, ...page];
        });
        setTotal((data.pagination && data.pagination.total) || 0);
      })
      .catch(() => {
        alertError(i18n.t('accounts:list.loadError'));
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [query, alertError]);

  // Starts the list again, and drops a selection made under the old one.
  const restart = () => {
    setItems([]);
    setSelected({});
    fetchPage(0);
  };

  // A new question: start again.
  useEffect(() => {
    restart();
  }, [fetchPage]);

  const canSelect = (account) => {
    return account.kind !== 'event' && account.kind !== 'channel' &&
      account.id !== viewer.id &&
      !isProtected(account) &&
      permissions.account.canBrowse(viewer);
  };

  const selectedAccounts = Object.values(selected);
  const selectable = items.filter(canSelect);
  const shownSelected = selectable.filter((account) => {
    return Boolean(selected[account.id]);
  });

  const toggle = (account) => {
    setSelected((previous) => {
      const next = { ...previous };
      if (next[account.id]) {
        delete next[account.id];
      } else {
        next[account.id] = account;
      }
      return next;
    });
  };

  const toggleShown = () => {
    setSelected((previous) => {
      const next = { ...previous };
      const all = shownSelected.length === selectable.length;

      selectable.forEach((account) => {
        if (all) {
          delete next[account.id];
        } else {
          next[account.id] = account;
        }
      });

      return next;
    });
  };

  // Everything the filters match, on screen or not, up to as many as one
  // request may remove.
  const selectMatching = () => {
    setIsFetching(true);

    return query(api.accounts.BATCH_MAX, 0)
      .then(({ data }) => {
        const next = {};
        (data.data || []).filter(canSelect).forEach((account) => {
          next[account.id] = account;
        });
        setSelected(next);
      })
      .catch(() => {
        alertError(i18n.t('accounts:list.loadError'));
      })
      .finally(() => {
        setIsFetching(false);
      });
  };

  const setFilter = (name, value) => {
    setFilters((previous) => {
      return { ...previous, [name]: value };
    });
  };

  const changeKind = (value) => {
    setKind(value);
    // The filters that mean nothing for the other kind are let go.
    setFilters((previous) => {
      return {
        ...previous,
        onlyUnverified: false,
        onlyNotOnboarded: false,
        onlyWithoutAdmin: false,
      };
    });
  };

  const clearFilters = () => {
    setFilters(NO_FILTERS);
    setSearch('');
  };

  const filtered = q !== '' || Object.keys(NO_FILTERS).some((name) => {
    return filters[name] !== NO_FILTERS[name];
  });

  return {
    // What is asked for.
    kind,
    changeKind,
    filters,
    setFilter,
    search,
    setSearch,
    filtered,
    clearFilters,
    hasAdmins,
    oneAtATime,
    // What came back.
    items,
    total,
    isFetching,
    hasProtected: items.some(isProtected),
    more: () => {
      fetchPage(items.length);
    },
    restart,
    // What is selected.
    selected,
    selectedAccounts,
    selectable,
    shownSelected,
    canSelect,
    toggle,
    toggleShown,
    selectMatching,
    clearSelection: () => {
      setSelected({});
    },
  };
};

export default useAccounts;
