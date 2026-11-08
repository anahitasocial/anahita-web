import React from 'react';
import { useSelector } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import PropTypes from 'prop-types';

import actions from '../../../actions';
import api from '../../../api';

import Progress from '../../../components/Progress';
import FeedItems from '../components/Items';
import NewPosts from '../components/NewPosts';
import useBrowse from '../../browse/useBrowse';
import useNewPosts from '../useNewPosts';
import usePosted from '../usePosted';
import { App as APP } from '../../../constants';

const { LIMIT } = APP.BROWSE;

// What they posted and reposted, and nothing they only liked: a post liked
// by somebody one follows, by people one does not, is not theirs to put in
// a chronological feed of the people one follows (the user, 2026-10-29).
const PARAMS = {
  include_reposts: true,
};

// The head of the feed, asked for again while it is open.
const peek = () => {
  return api.feed_leaders.browse({ ...PARAMS, start: 0, limit: LIMIT }).then((result) => {
    return result.data.data || [];
  });
};

const select = (state) => {
  const {
    feed_leaders: items, hasMore, error, isFetching,
  } = state.feedLeaders;
  return {
    items, hasMore, error, isFetching,
  };
};

// The next page begins after what is held, which is more than whole pages
// once new posts have been put at the top.
const nextStart = (start, held) => {
  return Math.max(held, start + 1);
};

// The home feed: posts and reposts by the people and groups the viewer follows.
//
// What is posted while it is open is put at its top: see useNewPosts.
//
// A feed holds posts and reposts. Replies are not in it: they are read in
// their thread, on the post's own page, which is where the reply button
// goes.
const FeedLeadersBrowse = ({ columns = false }) => {
  const { isAuthenticated, viewer } = useSelector((state) => { return state.session; });
  const {
    items, hasMore, next, prepend,
  } = useBrowse({
    browse: actions.feed_leaders.browse,
    reset: actions.feed_leaders.reset,
    prepend: actions.feed_leaders.prepend,
    select,
    params: PARAMS,
    nextStart,
  });

  // What the viewer posts is in what they follow, at once.
  usePosted({
    belongs: () => { return true; },
    put: prepend,
  });

  const { waiting, show } = useNewPosts({
    peek,
    known: items.byId,
    put: prepend,
    feedKey: 'leaders',
  });

  return (
    <>
      <NewPosts count={waiting} onShow={show} />
      <InfiniteScroll
        dataLength={items.allIds.length}
        next={next}
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
  columns: PropTypes.bool,
};

export default FeedLeadersBrowse;
