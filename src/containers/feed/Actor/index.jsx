import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import Typography from '@mui/material/Typography';

import actions from '../../../actions';

import ControlLike from '../../likes/controls/LikeFeed';
import ControlRepost from '../../controls/Repost';
import LikesStats from '../../likes';
import ReplyStats from '../../../components/ReplyStats';
import FeedMenu from '../Menu';

import Masonry from '../../../components/BreakpointMasonry';
import Progress from '../../../components/Progress';
import FeedCardDefault from '../components/Default';
import FeedCardRepost from '../components/Repost';
import FeedReplyButton from '../components/ReplyButton';
import ReplyContext from '../../replies/ReplyContext';
import ActorType from '../../../proptypes/Actor';
import ActorDefault from '../../../proptypes/ActorDefault';
import NodesType from '../../../proptypes/Nodes';
import PersonType from '../../../proptypes/Person';
import { App as APP } from '../../../constants';
import i18n from '../../../languages';
import utils from '../../../utils';

const {
  isRepost,
  getURL,
} = utils.node;

const { LIMIT } = APP.BROWSE;

const FILTER = {
  POSTS: 'posts',
  REPLIES: 'replies',
  REPOSTS: 'reposts',
};

// One of a profile's three lists, chosen by `filter`:
//
//   posts     what was posted on it. Also what its owner reposted, when
//             they have asked for that. The server decides.
//   replies   the replies its owner wrote, each under a line saying what it
//             answers. A reply links to its own page, where its thread is.
//   reposts   what its owner reposted.
//
// Posts are a single column, beside the profile's own details. Replies and
// reposts fill the width of the page in a masonry, like the lists of notes,
// articles and photos.
//
// The three share one place in the store, so the page shows one at a time
// and gives each its own key: changing tab empties the list and reads the
// next.
const FeedActorBrowse = ({
  actor = { ...ActorDefault },
  filter = FILTER.POSTS,
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
    // The first page is always asked for. A list that was being read when
    // the tab changed is still marked as reading, and waiting for it would
    // leave this one empty.
    if (!isFetching || start === 0) {
      browseList({
        id: actor.id,
        filter,
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

  // The lists of replies and of reposts are often empty, and an empty
  // tab with nothing in it reads as one that failed to load.
  if (!isFetching && !hasMore && items.allIds.length === 0 && filter !== FILTER.POSTS) {
    return (
      <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
        {i18n.t(`replies:none.${filter}`)}
      </Typography>
    );
  }

  const cards = items.allIds.map((itemId) => {
    const node = items.byId[itemId];
    const key = `feed_nodes_${node.id}`;
    const Like = ControlLike('feed_actor');

    // A reply, in the list of somebody's replies. Shown with what it
    // answers, and without the menu and the repost button a post has:
    // a reply is edited, removed and hidden in its thread.
    if (node.rootId) {
      return (
        <FeedCardDefault
          node={node}
          key={key}
          context={
            <ReplyContext
              answered={node.parent}
              owner={node.root && node.root.owner}
              href={getURL(node)}
            />
            }
          stats={[
            <LikesStats
              key={`node-like-stat-${node.id}`}
              node={node}
            />,
            <ReplyStats
              key={`node-reply-stat-${node.id}`}
              node={node}
            />,
          ]}
          actions={isAuthenticated && [
            <Like
              node={node}
              repostNode={null}
              key={`node-like-${node.id}`}
            />,
            <FeedReplyButton
              key={`node-reply-${node.id}`}
              post={node}
            />,
          ]}
        />
      );
    }

    // In the list of reposts, the post that was reposted is shown as
    // itself. Everything in that list is a repost by this person, so a
    // frame around each one saying so adds nothing.
    if (isRepost(node) && filter === FILTER.REPOSTS && node.parent) {
      return (
        <FeedCardDefault
          node={node.parent}
          key={key}
          showOwner={Boolean(
            node.parent.owner &&
            node.parent.author &&
            node.parent.owner.id !== node.parent.author.id,
          )}
          stats={[
            <LikesStats
              key={`node-like-stat-${node.parent.id}`}
              node={node.parent}
            />,
            <ReplyStats
              key={`node-reply-stat-${node.parent.id}`}
              node={node.parent}
            />,
          ]}
          actions={isAuthenticated && [
            <Like
              node={node.parent}
              repostNode={node}
              key={`node-like-${node.id}`}
            />,
            <FeedReplyButton
              key={`node-reply-${node.id}`}
              post={node.parent}
            />,
            <ControlRepost
              key={`node-repost-${node.id}`}
              parent={node.parent}
            />,
          ]}
        />
      );
    }

    if (isRepost(node)) {
      return (
        <FeedCardRepost
          node={{
            ...node,
            owner: actor,
          }}
          key={key}
          menu={isAuthenticated &&
          <FeedMenu
            node={{
              ...node.parent,
              owner: actor,
            }}
            viewer={viewer}
          />}
          stats={[
            <LikesStats
              key={`node-like-stat-${node.parent.id}`}
              node={node.parent}
            />,
            <ReplyStats
              key={`node-reply-stat-${node.parent.id}`}
              node={node.parent}
            />,
          ]}
          actions={isAuthenticated && [
            <Like
              node={node.parent}
              repostNode={node}
              key={`node-like-${node.id}`}
            />,
            <FeedReplyButton
              key={`node-reply-${node.id}`}
              post={node.parent}
            />,
            <ControlRepost
              key={`node-repost-${node.id}`}
              parent={node.parent}
            />,
          ]}
        />
      );
    }

    return (
      <FeedCardDefault
        node={{
          ...node,
          owner: actor,
        }}
        key={key}
        menu={isAuthenticated &&
        <FeedMenu
          node={{
            ...node,
            owner: actor,
          }}
          viewer={viewer}
        />}
        stats={[
          <LikesStats
            key={`node-like-stat-${node.id}`}
            node={node}
          />,
          <ReplyStats
            key={`node-reply-stat-${node.id}`}
            node={node}
          />,
        ]}
        actions={isAuthenticated && [
          <Like
            node={node}
            repostNode={null}
            key={`node-like-${node.id}`}
          />,
          <FeedReplyButton
            key={`node-reply-${node.id}`}
            post={node}
          />,
          <ControlRepost
            key={`node-repost-${node.id}`}
            parent={node}
          />,
        ]}
      />
    );
  });

  return (
    <InfiniteScroll
      dataLength={items.allIds.length}
      next={fetchList}
      hasMore={hasMore}
      loader={
        <Progress key="feed-progress" />
      }
    >
      {/* Posts are read in a column beside what the profile says about
          itself. Replies and reposts have the width of the page, and are
          laid out like the lists of notes, articles and photos. */}
      {filter === FILTER.POSTS ? cards : <Masonry>{cards}</Masonry>}
    </InfiniteScroll>
  );
};

FeedActorBrowse.propTypes = {
  actor: ActorType,
  filter: PropTypes.oneOf(['posts', 'replies', 'reposts']),
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
    feed_actor: items,
    hasMore,
    error,
    isFetching,
  } = state.feedActor;

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
      return dispatch(actions.feed_actor.browse(params));
    },
    resetList: () => {
      return dispatch(actions.feed_actor.reset());
    },
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default (connect(
  mapStateToProps,
  mapDispatchToProps,
)(FeedActorBrowse));
