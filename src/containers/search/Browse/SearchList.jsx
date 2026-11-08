import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { makeStyles } from 'tss-react/mui';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

import InfiniteScroll from 'react-infinite-scroll-component';

import actions from '../../../actions';

import ActorsCard from '../../actors/Browse/Card';
import Masonry from '../../../components/BreakpointMasonry';
import MediaCard from '../../nodes/MediumNode';
import CustomFeedSearchCard from '../../feeds/SearchCard';
import customFeeds from '../../../utils/customFeeds';
import Progress from '../../../components/Progress';
import NothingFound from './NothingFound';
import useBrowse from '../../browse/useBrowse';
import federation from '../../../utils/federation';
import searchChoices from '../../../utils/searchChoices';
import { Search as SEARCH } from '../../../constants';

import utils from '../../../utils/node';
import i18n from '../../../languages';

const {
  RELEVANT,
  RECENT,
} = SEARCH.SORTING;

const useStyles = makeStyles()((theme) => {
  return {
    card: {
      marginBottom: theme.spacing(2),
    },
  };
});

// No error here: a search that failed says so in its own place, with Try
// again, never in an alert as well.
const select = (state) => {
  const { search: items, isFetching, total } = state.search;
  return { items, isFetching, total };
};

// What was searched for, its results through useBrowse, drawn as cards in a
// masonry. The page gives each search its own list.
const SearchList = ({
  onScope,
  lead = null,
  counts = {},
  queryParams: {
    sort,
    q,
    scope,
    coordLong,
    coordLat,
    searchRange,
    choices = searchChoices.NONE,
  },
}) => {
  const { classes } = useStyles();
  const error = useSelector((state) => { return state.search.error; });

  // The distance is chosen in kilometres and asked for in metres; the last
  // mark on the slider is anywhere, and sends none.
  const near = searchRange <= 100;
  const {
    items, hasMore, answered, next, again,
  } = useBrowse({
    browse: actions.search.browse,
    reset: actions.search.reset,
    select,
    params: {
      ...(sort === RELEVANT ? searchChoices.paramsOf(choices) : {}),
      sort,
      scope,
      search_range: near ? searchRange * 1000 : '',
      coord_lng: near ? coordLong : '',
      coord_lat: near ? coordLat : '',
      term: q,
    },
    queryKey: JSON.stringify([q, sort, scope, searchRange, coordLong, coordLat, choices]),
    // Nothing to ask for until something is typed.
    skip: !q,
    // Said below, from the store, as a sentence and not a status code.
    failed: () => {},
  });

  // A search that failed, said once and plainly, with the way to ask
  // again: never the request's own message ("Request failed with status
  // code 400"), which says nothing to anybody reading it (the user,
  // 2026-10-19).
  if (error) {
    return (
      <Alert
        severity="warning"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={again}
          >
            {i18n.t('search:retry')}
          </Button>
        }
      >
        {i18n.t('search:failed')}
      </Alert>
    );
  }

  // Nothing found. A handle from another server finds nothing here by
  // its nature, and the card above it says what to do instead.
  if (q && answered && items.allIds.length === 0 && !federation.isLookup(q)) {
    return (
      <NothingFound
        term={q}
        scope={scope}
        onScope={onScope}
        counts={counts}
      />
    );
  }

  return (
    <InfiniteScroll
      dataLength={items.allIds.length}
      next={next}
      hasMore={hasMore}
      loader={
        <Progress key="items-progress" />
      }
    >
      <Masonry>
        {lead &&
          <div key={`search_lead_${lead.id}`} className={classes.card}>
            <ActorsCard actor={lead} />
          </div>}
        {items.allIds.filter((itemId) => {
          return !lead || items.byId[itemId].id !== lead.id;
        }).map((itemId) => {
          const node = items.byId[itemId];
          const key = `search_node_${node.id}`;
          return (
            <div key={key} className={classes.card}>
              {utils.isActor(node) &&
                <ActorsCard actor={node} />}
              {utils.isMedium(node) &&
                <MediaCard medium={node} />}
              {customFeeds.isFeed(node) &&
                <CustomFeedSearchCard node={node} />}
            </div>
          );
        })}
      </Masonry>
    </InfiniteScroll>
  );
};

SearchList.propTypes = {
  queryParams: PropTypes.shape({
    sort: PropTypes.oneOf([RELEVANT, RECENT]),
    q: PropTypes.string,
    scope: PropTypes.string,
    // In kilometres; more than 100 is anywhere.
    searchRange: PropTypes.number,
    coordLong: PropTypes.number,
    coordLat: PropTypes.number,
    // How the searcher likes "Most relevant" ordered (utils/searchChoices).
    choices: PropTypes.shape({
      followedFirst: PropTypes.bool,
      recentFirst: PropTypes.bool,
    }),
  }).isRequired,
  // Opens another tab, from the words for a search that found nothing.
  onScope: PropTypes.func.isRequired,
  // Somebody looked up on another server, drawn first.
  lead: PropTypes.objectOf(PropTypes.any),
  // How many each tab finds.
  counts: PropTypes.objectOf(PropTypes.number),
};

export default SearchList;
