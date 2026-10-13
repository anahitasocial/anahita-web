import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';

import Typography from '@mui/material/Typography';

import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';

import Progress from '../../../components/Progress';
import FeedItems from '../components/Items';
import NewPosts from '../components/NewPosts';
import useNewPosts from '../useNewPosts';
import NodesType from '../../../proptypes/Nodes';
import PersonType from '../../../proptypes/Person';
import { App as APP } from '../../../constants';

const { LIMIT } = APP.BROWSE;

// A custom feed's posts.
//
// Drawn with the cards every feed uses. Newest first, a page at a time as
// the reader scrolls. Whatever the feed asks for, the server sends each
// reader only what they could have seen anyway.
const FeedCustomBrowse = ({
  feed,
  emptyText = '',
  browseList,
  resetList,
  prependList,
  items,
  hasMore = true,
  isFetching,
  isAuthenticated,
  viewer,
  columns = false,
}) => {
  // Why the feed could not be read, as the server's word for it.
  const [failure, setFailure] = useState('');

  // One list in the store for whichever feed is on the page: begun again
  // when the feed changes.
  const key = `feed-${feed.id}`;

  const load = (start) => {
    browseList({
      feed,
      start,
      limit: LIMIT,
    }).catch((response) => {
      const data = (response && response.response && response.response.data) || {};
      setFailure(data.error || 'generic');
    });
  };

  useEffect(() => {
    setFailure('');
    resetList();
    load(0);

    return () => {
      resetList();
    };
  }, [key]);

  // What is posted while it is open is put at its top.
  const { waiting, show } = useNewPosts({
    peek: () => {
      return api.customFeeds.peek({ feed, limit: LIMIT }).then((result) => {
        return result.data.data || [];
      });
    },
    known: items.byId,
    put: prependList,
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

  if (!isFetching && !hasMore && items.allIds.length === 0) {
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
        next={() => {
          if (!isFetching) {
            load(items.allIds.length);
          }
        }}
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
  browseList: PropTypes.func.isRequired,
  resetList: PropTypes.func.isRequired,
  prependList: PropTypes.func.isRequired,
  items: NodesType.isRequired,
  hasMore: PropTypes.bool,
  isFetching: PropTypes.bool.isRequired,
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
    feed_custom: items,
    hasMore,
    isFetching,
  } = state.feedCustom;

  return {
    items,
    hasMore,
    isFetching,
    isAuthenticated,
    viewer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    browseList: (params) => {
      return dispatch(actions.feed_custom.browse(params));
    },
    resetList: () => {
      return dispatch(actions.feed_custom.reset());
    },
    prependList: (nodes) => {
      return dispatch(actions.feed_custom.prepend(nodes));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(FeedCustomBrowse);
