import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';

import actions from '../../../actions';
import api from '../../../api';

import Progress from '../../../components/Progress';
import FeedItems from '../components/Items';
import NewPosts from '../components/NewPosts';
import useNewPosts from '../useNewPosts';
import usePosted from '../usePosted';
import NodesType from '../../../proptypes/Nodes';
import PersonType from '../../../proptypes/Person';
import { App as APP } from '../../../constants';

const { LIMIT } = APP.BROWSE;

const PARAMS = {
  include_liked: true,
  include_reposts: true,
};

// The head of the feed, asked for again while it is open.
const peek = () => {
  return api.feed_leaders.browse({ ...PARAMS, start: 0, limit: LIMIT }).then((result) => {
    return result.data.data || [];
  });
};

// The home feed: posts and reposts by the people and groups the viewer follows.
//
// What is posted while it is open is put at its top: see useNewPosts.
//
// A feed holds posts and reposts. Replies are not in it: they are read in
// their thread, on the post's own page, which is where the reply button
// goes.
const FeedLeadersBrowse = ({
  browseList,
  resetList,
  prependList,
  alertError,
  items,
  hasMore = true,
  isAuthenticated,
  viewer,
  error,
  isFetching,
  columns = false,
}) => {
  const [start, setStart] = useState(0);

  // What the viewer posts is in what they follow, at once.
  usePosted({
    belongs: () => { return true; },
    put: prependList,
  });

  useEffect(() => {
    return () => {
      resetList();
    };
  }, []);

  useEffect(() => {
    if (!isFetching) {
      browseList({
        ...PARAMS,
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

  // The next page begins after what is held, which is more than whole
  // pages once new posts have been put at the top.
  const fetchList = () => {
    return setStart(Math.max(items.allIds.length, start + 1));
  };

  const { waiting, show } = useNewPosts({
    peek,
    known: items.byId,
    put: prependList,
    feedKey: 'leaders',
  });

  return (
    <>
      <NewPosts count={waiting} onShow={show} />
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
          columns={columns}
          isAuthenticated={isAuthenticated}
          viewer={viewer}
        />
      </InfiniteScroll>
    </>
  );
};

FeedLeadersBrowse.propTypes = {
  browseList: PropTypes.func.isRequired,
  resetList: PropTypes.func.isRequired,
  prependList: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
  items: NodesType.isRequired,
  hasMore: PropTypes.bool,
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.string.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  viewer: PersonType.isRequired,
  columns: PropTypes.bool,
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
    prependList: (nodes) => {
      return dispatch(actions.feed_leaders.prepend(nodes));
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
