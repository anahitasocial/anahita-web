import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';

import actions from '../../../actions';

import tabIcon from '../../actors/Read/tabIcons';
import EmptyList from '../../../components/EmptyList';
import Progress from '../../../components/Progress';
import ActorItems, { FILTER } from '../components/ActorItems';
import useBrowse from '../../browse/useBrowse';
import usePosted from '../usePosted';
import ActorType from '../../../proptypes/Actor';
import ActorDefault from '../../../proptypes/ActorDefault';

const select = (state) => {
  const {
    feed_actor: items, hasMore, error, isFetching,
  } = state.feedActor;
  return {
    items, hasMore, error, isFetching,
  };
};

// One of a profile's lists, chosen by `filter`:
//
//   posts     what was posted on it. Also what its owner reposted, when
//             they have asked for that. The server decides.
//   replies   the replies its owner wrote, each under a line saying what it
//             answers. A reply links to its own page, where its thread is.
//   reposts   what its owner reposted.
//   tagged    the photos and videos the person is in.
//
// The lists share one place in the store, so the page shows one at a time
// and gives each its own key: changing tab empties the list and reads the
// next. How each is drawn is ActorItems'.
const FeedActorBrowse = ({
  actor = { ...ActorDefault },
  filter = FILTER.POSTS,
  columns = false,
}) => {
  const { isAuthenticated, viewer } = useSelector((state) => { return state.session; });
  const {
    items, hasMore, isEmpty, next, prepend,
  } = useBrowse({
    browse: actions.feed_actor.browse,
    reset: actions.feed_actor.reset,
    prepend: actions.feed_actor.prepend,
    select,
    params: { id: actor.id, filter },
    queryKey: `${actor.id}|${filter}`,
  });

  // What the viewer posts to this profile is at the head of its posts at
  // once.
  usePosted({
    belongs: (post) => {
      const owner = (post.owner && post.owner.id) || post.ownerId;
      return filter === FILTER.POSTS && owner === actor.id;
    },
    put: prepend,
  });

  // A list with nothing in it says so. An empty tab with nothing to see
  // reads as one that failed to load.
  if (isEmpty) {
    return <EmptyList icon={tabIcon(filter === FILTER.POSTS ? 'feed' : filter)} />;
  }

  return (
    <InfiniteScroll
      dataLength={items.allIds.length}
      next={next}
      hasMore={hasMore}
      loader={
        <Progress key="feed-progress" />
      }
    >
      <ActorItems
        items={items}
        actor={actor}
        filter={filter}
        columns={columns}
        isAuthenticated={isAuthenticated}
        viewer={viewer}
      />
    </InfiniteScroll>
  );
};

FeedActorBrowse.propTypes = {
  actor: ActorType,
  filter: PropTypes.oneOf(Object.values(FILTER)),
  columns: PropTypes.bool,
};

export default FeedActorBrowse;
