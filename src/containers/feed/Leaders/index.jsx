import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';

import actions from '../../../actions';

import Progress from '../../../components/Progress';
import FeedItems from '../components/Items';
import NodesType from '../../../proptypes/Nodes';
import PersonType from '../../../proptypes/Person';
import { App as APP } from '../../../constants';

const { LIMIT } = APP.BROWSE;

// The home feed: posts and reposts by the people and groups the viewer follows.
//
// A feed holds posts and reposts. Replies are not in it: they are read in
// their thread, on the post's own page, which is where the reply button
// goes.
const FeedLeadersBrowse = ({
  browseList,
  resetList,
  alertError,
  items,
  hasMore = true,
  isAuthenticated,
  viewer,
  error,
  isFetching,
}) => {
  const [start, setStart] = useState(0);

  useEffect(() => {
    return () => {
      resetList();
    };
  }, []);

  useEffect(() => {
    if (!isFetching) {
      browseList({
        include_liked: true,
        include_reposts: true,
        start,
        limit: LIMIT,
      });
    }
  }, [start]);

  useEffect(() => {
    if (error) {
      alertError(error);
    }
  }, [error]);

  const fetchList = () => {
    return setStart(start + LIMIT);
  };

  return (
    <InfiniteScroll
      dataLength={items.allIds.length}
      next={fetchList}
      hasMore={hasMore}
      loader={
        <Progress key="feed-progress" />
      }
    >
      <FeedItems
        items={items}
        namespace="feed_leaders"
        isAuthenticated={isAuthenticated}
        viewer={viewer}
      />
    </InfiniteScroll>
  );
};

FeedLeadersBrowse.propTypes = {
  browseList: PropTypes.func.isRequired,
  resetList: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
  items: NodesType.isRequired,
  hasMore: PropTypes.bool,
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.string.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  viewer: PersonType.isRequired,
};

const mapStateToProps = (state) => {
  const {
    isAuthenticated,
    viewer,
  } = state.session;

  const {
    feed_leaders: items,
    hasMore,
    error,
    isFetching,
  } = state.feedLeaders;

  return {
    items,
    hasMore,
    error,
    isFetching,
    isAuthenticated,
    viewer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    browseList: (params) => {
      return dispatch(actions.feed_leaders.browse(params));
    },
    resetList: () => {
      return dispatch(actions.feed_leaders.reset());
    },
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default (connect(
  mapStateToProps,
  mapDispatchToProps,
)(FeedLeadersBrowse));
