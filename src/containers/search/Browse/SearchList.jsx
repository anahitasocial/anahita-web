import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { makeStyles } from 'tss-react/mui';
import Typography from '@mui/material/Typography';

import InfiniteScroll from 'react-infinite-scroll-component';

import actions from '../../../actions';
import NodesType from '../../../proptypes/Nodes';

import ActorsCard from '../../actors/Browse/Card';
import Masonry from '../../../components/BreakpointMasonry';
import MediaCard from '../../nodes/MediumNode';
import CustomFeedSearchCard from '../../feeds/SearchCard';
import customFeeds from '../../../utils/customFeeds';
import Progress from '../../../components/Progress';
import NothingFound from './NothingFound';
import federation from '../../../utils/federation';
import { App as APP, Search as SEARCH } from '../../../constants';

import utils from '../../../utils/node';

const { LIMIT } = APP.BROWSE;

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

const SearchList = ({
  browseList,
  resetList,
  alertError,
  items,
  error,
  isFetching,
  onScope,
  total = 0,
  queryParams: {
    sort,
    q,
    scope,
    coordLong,
    coordLat,
    searchRange,
  },
}) => {
  const { classes } = useStyles();

  const [start, setStart] = useState(0);

  // Whether this search has had its answer: the list is drawn anew for
  // each search, and until the answer comes an empty list says nothing.
  const [answered, setAnswered] = useState(false);
  const wasFetching = useRef(false);
  useEffect(() => {
    if (isFetching) {
      wasFetching.current = true;
    } else if (wasFetching.current) {
      setAnswered(true);
    }
  }, [isFetching]);

  useEffect(() => {
    return () => {
      resetList();
    };
  }, []);

  useEffect(() => {
    if (!q) {
      resetList();
      return;
    }

    // The distance is chosen in kilometres and asked for in metres; the
    // last mark on the slider is anywhere, and sends none.
    const near = searchRange <= 100;
    browseList({
      sort,
      start,
      scope,
      search_range: near ? searchRange * 1000 : '',
      coord_lng: near ? coordLong : '',
      coord_lat: near ? coordLat : '',
      limit: LIMIT,
      term: q,
    });
  }, [
    sort,
    start,
    scope,
    searchRange,
    searchRange,
    coordLong,
    coordLat,
  ]);

  useEffect(() => {
    if (error) {
      alertError(error);
    }
  }, [error]);

  const fetchList = () => {
    return setStart(start + LIMIT);
  };

  const hasMore = total > items.allIds.length;

  if (error) {
    return (
      <Typography variant="body1" color="error" align="center">
        {error}
      </Typography>
    );
  }

  // Nothing found. A handle from another server finds nothing here by
  // its nature, and the card above it says what to do instead.
  if (q && answered && items.allIds.length === 0 && !federation.isLookup(q)) {
    const near = searchRange <= 100;
    return (
      <NothingFound
        term={q}
        scope={scope}
        onScope={onScope}
        params={{
          sort,
          search_range: near ? searchRange * 1000 : '',
          coord_lng: near ? coordLong : '',
          coord_lat: near ? coordLat : '',
        }}
      />
    );
  }

  return (
    <InfiniteScroll
      dataLength={items.allIds.length}
      next={fetchList}
      hasMore={hasMore}
      loader={
        <Progress key="items-progress" />
      }
    >
      <Masonry>
        {items.allIds.map((itemId) => {
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

const mapStateToProps = (state) => {
  const {
    search: items,
    error,
    isFetching,
    total,
  } = state.search;

  return {
    items,
    error,
    isFetching,
    total,
  };
};

SearchList.propTypes = {
  browseList: PropTypes.func.isRequired,
  resetList: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
  items: NodesType.isRequired,
  queryParams: PropTypes.shape({
    sort: PropTypes.oneOf([RELEVANT, RECENT]),
    q: PropTypes.string,
    scope: PropTypes.string,
    // In kilometres; more than 100 is anywhere.
    searchRange: PropTypes.number,
    coordLong: PropTypes.number,
    coordLat: PropTypes.number,
  }).isRequired,
  error: PropTypes.string.isRequired,
  isFetching: PropTypes.bool.isRequired,
  // Opens another tab, from the words for a search that found nothing.
  onScope: PropTypes.func.isRequired,
  total: PropTypes.number,
};

const mapDispatchToProps = (dispatch) => {
  return {
    browseList: (params) => {
      return dispatch(actions.search.browse(params));
    },
    resetList: () => {
      return dispatch(actions.search.reset());
    },
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchList);
