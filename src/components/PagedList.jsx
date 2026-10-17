import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';

import List from '@mui/material/List';
import Typography from '@mui/material/Typography';

import Progress from './Progress';

const LIMIT = 20;

// A list read a page at a time as somebody scrolls, from a call that
// answers as every list does: `data`, and `pagination` with its `total`.
// It starts again whenever `reloadKey` changes. `header` is drawn above
// the rows with the last answer, for what it says beside them (a trending
// list's `window`).
const PagedList = ({
  load,
  renderItem,
  reloadKey = '',
  empty = '',
  header = null,
}) => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // The answers of a list asked for before the key changed are not this
  // list's.
  const asked = useRef(0);

  const fetchPage = (start) => {
    const ticket = asked.current;
    setIsLoading(true);
    return load({ start, limit: LIMIT }).then((result) => {
      if (ticket !== asked.current) {
        return;
      }
      const data = result.data || {};
      const page = data.data || [];
      setItems((before) => { return start === 0 ? page : before.concat(page); });
      setTotal((data.pagination && data.pagination.total) || 0);
      setAnswer(data);
    }).catch(() => {
      if (ticket === asked.current) {
        setTotal(0);
      }
    }).finally(() => {
      if (ticket === asked.current) {
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    asked.current += 1;
    setItems([]);
    setTotal(0);
    setAnswer(null);
    fetchPage(0);
  }, [reloadKey]);

  return (
    <>
      {header && header(answer, !isLoading && items.length === 0)}
      {isLoading && items.length === 0 && <Progress />}
      {!isLoading && items.length === 0 && empty &&
        <Typography variant="body2" color="textSecondary" sx={{ px: 2, py: 2 }}>
          {empty}
        </Typography>}
      {items.length > 0 &&
        <InfiniteScroll
          dataLength={items.length}
          next={() => {
            if (!isLoading) {
              fetchPage(items.length);
            }
          }}
          hasMore={items.length < total}
          loader={<Progress key="paged-list-progress" />}
          style={{ overflow: 'visible' }}
        >
          <List disablePadding>
            {items.map(renderItem)}
          </List>
        </InfiniteScroll>}
    </>
  );
};

PagedList.propTypes = {
  // Called with { start, limit }; answers with what axios answers.
  load: PropTypes.func.isRequired,
  // Draws one, with its key.
  renderItem: PropTypes.func.isRequired,
  reloadKey: PropTypes.string,
  // Said when there is nothing.
  empty: PropTypes.string,
  // Called with the last answer and whether it was empty.
  header: PropTypes.func,
};

export default PagedList;
