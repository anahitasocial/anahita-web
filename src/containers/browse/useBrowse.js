import { useEffect, useRef, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import actions from '../../actions';
import { App as APP } from '../../constants';

const { LIMIT } = APP.BROWSE;

// A list read from the server a page at a time: what it holds, whether there
// is more, and the way to the next page. Every list of posts or profiles
// browses with this, and draws what it gives with a component that only
// draws (docs/plans/logic-and-presentation.md).
//
//   browse(params)  the list's browse action, given start and limit with
//                   the params
//   reset()         its reset action, which empties it
//   prepend(nodes)  its prepend action, for what is posted while it is open
//   select(state)   its place in the store: { items, error, isFetching } and
//                   either hasMore or total
//   params          what else the server is asked with, as the filters
//   queryKey        what the list is of: when it changes, the list is emptied
//                   and read again from its first page
//   nextStart       where the next page begins, given the start and how many
//                   are held; a page after the start unless said. The home
//                   feed counts what it holds, as new posts go on top
//
// The pagination belongs to the query: `start` is worked out while drawing,
// not reset in an effect, which would leave one moment with a new query and
// the old page, and ask the server for that. No page is asked for while one
// is on its way, or when there is no more: a scroll can arrive then, most of
// all after a tab change.
const useBrowse = ({
  browse,
  reset,
  prepend,
  select,
  params = {},
  queryKey = '',
  limit = LIMIT,
  nextStart,
}) => {
  const dispatch = useDispatch();
  const {
    items,
    hasMore: said,
    total = 0,
    error = '',
    isFetching = false,
  } = useSelector(select, shallowEqual);

  const [page, setPage] = useState({ key: queryKey, start: 0 });
  const start = page.key === queryKey ? page.start : 0;
  const hasMore = said === undefined ? total > items.allIds.length : said;

  // Whether the server has answered since the list was emptied: before that
  // it is empty because nothing has been read yet, not because there is
  // nothing.
  const [answered, setAnswered] = useState(false);
  const wasFetching = useRef(false);
  useEffect(() => {
    if (wasFetching.current && !isFetching) {
      setAnswered(true);
    }
    wasFetching.current = isFetching;
  }, [isFetching]);

  // Emptied when the page is left.
  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, []);

  // A new query empties the list first, ahead of the request for it, which
  // also marks one still on its way as stale.
  const isMounted = useRef(false);
  useEffect(() => {
    if (isMounted.current) {
      dispatch(reset());
      setAnswered(false);
      setPage({ key: queryKey, start: 0 });
    } else {
      isMounted.current = true;
    }
  }, [queryKey]);

  useEffect(() => {
    dispatch(browse({ ...params, start, limit }));
  }, [start, queryKey]);

  useEffect(() => {
    if (error) {
      dispatch(actions.app.alert.error(error));
    }
  }, [error]);

  const next = () => {
    if (isFetching || !hasMore) {
      return;
    }
    const held = items.allIds.length;
    setPage({ key: queryKey, start: nextStart ? nextStart(start, held) : start + limit });
  };

  return {
    items,
    hasMore,
    total,
    error,
    isFetching,
    answered,
    isEmpty: answered && !isFetching && !hasMore && items.allIds.length === 0,
    next,
    prepend: (nodes) => {
      return prepend && dispatch(prepend(nodes));
    },
  };
};

export default useBrowse;
