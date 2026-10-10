import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Masonry from '../../components/BreakpointMasonry';
import Progress from '../../components/Progress';
import EventCard from './Card';
import i18n from '../../languages';
import socialgraph from '../../utils/socialgraph';
import { App as APP } from '../../constants';

const { LIMIT } = APP.BROWSE;

// A list of events, read a page at a time as its end is scrolled to.
//
// `read` is given where to start and how many, and answers with the
// server's page. Kept here and not in the store: each list is one screen's,
// and is read again when that screen is opened.
const EventsList = ({ read, empty }) => {
  const [list, setList] = useState(null);
  const [hasFailed, setHasFailed] = useState(false);

  const load = (start) => {
    read({ start, limit: LIMIT }).then((result) => {
      setList((before) => {
        return socialgraph.merge(before, result.data, start);
      });
    }).catch(() => {
      setHasFailed(true);
    });
  };

  useEffect(() => {
    setList(null);
    setHasFailed(false);
    load(0);
  }, [read]);

  if (hasFailed && !list) {
    return (
      <Typography variant="body2" color="error" role="alert" sx={{ p: 2 }}>
        {i18n.t('events:event.failed')}
      </Typography>
    );
  }

  if (!list) {
    return <Progress />;
  }

  if (list.rows.length === 0) {
    return (
      <Typography variant="body1" color="textSecondary" sx={{ p: 2 }}>
        {empty}
      </Typography>
    );
  }

  return (
    <InfiniteScroll
      dataLength={list.rows.length}
      next={() => {
        load(list.rows.length);
      }}
      hasMore={list.rows.length < list.total}
      loader={<Progress key="events-progress" />}
    >
      <Masonry>
        {list.rows.map((actor) => {
          return (
            <Box key={`event-${actor.id}`} sx={{ mb: 2 }}>
              <EventCard actor={actor} />
            </Box>
          );
        })}
      </Masonry>
    </InfiniteScroll>
  );
};

EventsList.propTypes = {
  // ({ start, limit }) => a promise of the server's page.
  read: PropTypes.func.isRequired,
  // What to say when there is nothing in it.
  empty: PropTypes.string.isRequired,
};

export default EventsList;
