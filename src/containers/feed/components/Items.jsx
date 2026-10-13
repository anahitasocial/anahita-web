import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import ControlLike from '../../likes/controls/LikeFeed';
import ControlRepost from '../../controls/Repost';
import { ShareAction, ofNode } from '../../controls/Share';
import { DownloadAction } from '../../controls/medium/Download';
import LikesStats from '../../likes';
import FeedMenu from '../Menu';

import Masonry from '../../../components/BreakpointMasonry';
import FeedCardDefault from './Default';
import FeedCardRepost from './Repost';
import FeedReplyButton from './ReplyButton';
import NodesType from '../../../proptypes/Nodes';
import PersonType from '../../../proptypes/Person';
import utils from '../../../utils';

const {
  isPerson,
  isRepost,
} = utils.node;

// The cards of a feed: a post, or a repost of one, each with its menu, its
// counts and its buttons. Every feed is drawn with this, the one of people
// the viewer follows and the ones they build, so a post looks and works the
// same in all of them.
//
// `namespace` is the feed's place in the store, which is where liking a post
// writes its answer back to.
const FeedItems = ({
  items,
  namespace,
  isAuthenticated,
  viewer,
  columns = false,
}) => {
  const Like = useMemo(() => {
    return ControlLike(namespace);
  }, [namespace]);

  const cards = items.allIds.map((itemId) => {
    const node = items.byId[itemId];
    const key = `feed_nodes_${node.id}`;

    if (isRepost(node)) {
      return (
        <FeedCardRepost
          node={node}
          key={key}
          menu={isAuthenticated &&
          <FeedMenu
            node={node.parent}
            viewer={viewer}
          />}
          stats={[
            <LikesStats
              key={`node-like-stat-${node.parent.id}`}
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
            <DownloadAction
              key={`node-download-${node.id}`}
              node={node.parent}
            />,
            // Share is last, after whatever else there is: it is the one
            // that leads away from the post.
            <ShareAction
              key={`node-share-${node.id}`}
              what={ofNode(node.parent)}
            />,
          ]}
          showOwner={node.parent && node.parent.owner && !isPerson(node.parent.owner)}
        />
      );
    }

    return (
      <FeedCardDefault
        node={node}
        key={key}
        menu={isAuthenticated &&
        <FeedMenu
          node={node}
          viewer={viewer}
        />}
        stats={[
          <LikesStats
            key={`node-like-stat-${node.id}`}
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
          <DownloadAction
            key={`node-download-${node.id}`}
            node={node}
          />,
          <ShareAction
            key={`node-share-${node.id}`}
            what={ofNode(node)}
          />,
        ]}
        showOwner={node.owner && !isPerson(node.owner)}
      />
    );
  });

  // In columns, each card takes the width of its column and the cards run
  // across them in order.
  return columns ? <Masonry>{cards}</Masonry> : cards;
};

FeedItems.propTypes = {
  items: NodesType.isRequired,
  namespace: PropTypes.string.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  viewer: PersonType.isRequired,
  // Laid out in columns across the page, and not one under another.
  columns: PropTypes.bool,
};

export default FeedItems;
