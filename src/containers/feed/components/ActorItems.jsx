import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import ControlLike from '../../likes/controls/LikeFeed';
import ControlRepost from '../../controls/Repost';
import LikesStats from '../../likes';
import FeedMenu from '../Menu';

import Masonry from '../../../components/BreakpointMasonry';
import FeedCardDefault from './Default';
import FeedCardRepost from './Repost';
import FeedReplyButton from './ReplyButton';
import ReplyContext from '../../replies/ReplyContext';
import ActorType from '../../../proptypes/Actor';
import NodesType from '../../../proptypes/Nodes';
import PersonType from '../../../proptypes/Person';
import postCounts from '../../../components/PostCounts';
import utils from '../../../utils';

const {
  isRepost,
  getURL,
} = utils.node;

export const FILTER = {
  POSTS: 'posts',
  REPLIES: 'replies',
  REPOSTS: 'reposts',
  // The photos and videos a person is in (roadmap row 103).
  TAGGED: 'tagged',
};

// The cards of one of a profile's lists: it draws what it is given, and
// fetches nothing (containers/feed/Actor holds the list).
//
// Posts are a single column, or with `columns` a masonry. Replies and reposts
// are always in a masonry, like the lists of notes, articles and photos, which
// the page may hold to one column.
const ActorItems = ({
  items,
  actor,
  filter,
  columns = false,
  isAuthenticated,
  viewer,
}) => {
  const Like = useMemo(() => {
    return ControlLike('feed_actor');
  }, []);

  const cards = items.allIds.map((itemId) => {
    const node = items.byId[itemId];
    const key = `feed_nodes_${node.id}`;

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
          ]}
          actions={!isAuthenticated ? postCounts(node) : [
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
          ]}
          actions={!isAuthenticated ? postCounts(node.parent) : [
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
          ]}
          actions={!isAuthenticated ? postCounts(node.parent) : [
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
        ]}
        actions={!isAuthenticated ? postCounts(node) : [
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

  return filter === FILTER.POSTS && !columns ?
    cards :
    <Masonry>{cards}</Masonry>;
};

ActorItems.propTypes = {
  items: NodesType.isRequired,
  actor: ActorType.isRequired,
  filter: PropTypes.oneOf(Object.values(FILTER)).isRequired,
  columns: PropTypes.bool,
  isAuthenticated: PropTypes.bool.isRequired,
  viewer: PersonType.isRequired,
};

export default ActorItems;
