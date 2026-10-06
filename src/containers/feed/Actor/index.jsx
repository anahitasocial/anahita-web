import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';

import actions from '../../../actions';

import ControlLike from '../../likes/controls/LikeFeed';
import ControlRepost from '../../controls/Repost';
import LikesStats from '../../likes';
import ReplyStats from '../../../components/ReplyStats';
import FeedMenu from '../Menu';

import Progress from '../../../components/Progress';
import FeedCardDefault from '../components/Default';
import FeedCardRepost from '../components/Repost';
import FeedReplyButton from '../components/ReplyButton';
import ActorType from '../../../proptypes/Actor';
import ActorDefault from '../../../proptypes/ActorDefault';
import NodesType from '../../../proptypes/Nodes';
import PersonType from '../../../proptypes/Person';
import { App as APP } from '../../../constants';
import utils from '../../../utils';

const {
  isRepost,
} = utils.node;

const { LIMIT } = APP.BROWSE;

// A profile's feed: what was posted on it, and what its owner reposted.
//
// A feed holds posts and reposts. Replies are not in it: they are read in
// their thread, on the post's own page, which is where the reply button
// goes.
const FeedActorBrowse = ({
  actor = { ...ActorDefault },
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
        id: actor.id,
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
      {items.allIds.map((itemId) => {
        const node = items.byId[itemId];
        const key = `feed_nodes_${node.id}`;
        const Like = ControlLike('feed_actor');

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
      })}
    </InfiniteScroll>
  );
};

FeedActorBrowse.propTypes = {
  actor: ActorType,
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
