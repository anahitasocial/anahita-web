import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';

import Typography from '@mui/material/Typography';

import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';

import Progress from '../../../components/Progress';
import FeedItems from '../components/Items';
import NewPosts from '../components/NewPosts';
import useBrowse from '../../browse/useBrowse';
import useNewPosts from '../useNewPosts';
import { App as APP } from '../../../constants';

const { LIMIT } = APP.BROWSE;

// No error here: a feed that cannot be read says why in its own place, not
// in an alert as well (`failed` below).
const select = (state) => {
  const { feed_custom: items, hasMore, isFetching } = state.feedCustom;
  return { items, hasMore, isFetching };
};

// The next page begins after what is held, as new posts go on top.
const nextStart = (start, held) => {
  return held;
};

// A custom feed's posts.
//
// Drawn with the cards every feed uses. Newest first, a page at a time as
// the reader scrolls. Whatever the feed asks for, the server sends each
// reader only what they could have seen anyway.
const FeedCustomBrowse = ({
  feed,
  emptyText = '',
  columns = false,
}) => {
  const { isAuthenticated, viewer } = useSelector((state) => { return state.session; });

  // Why the feed could not be read, as the server's word for it.
  const [failure, setFailure] = useState('');

  // One list in the store for whichever feed is on the page: begun again
  // when the feed changes.
  const key = `feed-${feed.id}`;
  useEffect(() => {
    setFailure('');
  }, [key]);

  const {
    items, hasMore, isEmpty, next, prepend,
  } = useBrowse({
    browse: actions.feed_custom.browse,
    reset: actions.feed_custom.reset,
    prepend: actions.feed_custom.prepend,
    select,
    params: { feed },
    queryKey: key,
    nextStart,
    failed: (response) => {
      const data = (response && response.response && response.response.data) || {};
      setFailure(data.error || 'generic');
    },
  });

  // What is posted while it is open is put at its top.
  const { waiting, show } = useNewPosts({
    peek: () => {
      return api.customFeeds.peek({ feed, limit: LIMIT }).then((result) => {
        return result.data.data || [];
      });
    },
    known: items.byId,
    put: prepend,
    feedKey: key,
  });

  if (failure) {
    return (
      <Typography variant="body2" color="error" role="alert" sx={{ p: 2 }}>
        {i18n.t(i18n.exists(`customFeeds:form.errors.${failure}`) ?
          `customFeeds:form.errors.${failure}` :
          'customFeeds:prompts.failed')}
      </Typography>
    );
  }

  if (isEmpty) {
    return (
      <Typography variant="body1" color="textSecondary" sx={{ p: 2 }}>
        {emptyText || i18n.t('customFeeds:read.empty')}
      </Typography>
    );
  }

  return (
    <>
      <NewPosts count={waiting} onShow={show} />
      <InfiniteScroll
        dataLength={items.allIds.length}
        next={next}
        hasMore={hasMore}
        loader={<Progress key="feed-custom-progress" />}
      >
        <FeedItems
          items={items}
          namespace="feed_custom"
          columns={columns}
          isAuthenticated={isAuthenticated}
          viewer={viewer}
        />
      </InfiniteScroll>
    </>
  );
};

FeedCustomBrowse.propTypes = {
  feed: PropTypes.object.isRequired,
  emptyText: PropTypes.string,
  columns: PropTypes.bool,
};

export default FeedCustomBrowse;
