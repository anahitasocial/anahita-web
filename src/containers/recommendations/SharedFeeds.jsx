import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import CustomFeedSearchCard from '../feeds/SearchCard';
import Masonry from '../../components/BreakpointMasonry';
import Progress from '../../components/Progress';
import PersonType from '../../proptypes/Person';
import api from '../../api';
import i18n from '../../languages';

const LIMIT = 20;

// Feeds people have shared, newest first, among the suggestions: each with
// the button that adds it to the home page. Each is one the viewer may
// open (feed-service, `GET /feeds/discover`); their own are left out,
// since they are on their list of feeds already.
const SharedFeeds = ({ viewer }) => {
  const [feeds, setFeeds] = useState([]);
  const [next, setNext] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  // Answers that come back after the list was left are not kept.
  const current = useRef(true);

  const load = (start) => {
    return api.customFeeds.discover({ start, limit: LIMIT }).then(({ data }) => {
      if (!current.current) {
        return;
      }
      const page = (data.data || []).filter((feed) => {
        return !feed.owner || feed.owner.id !== viewer.id;
      });
      const pagination = data.pagination || {};
      setFeeds((kept) => {
        return start === 0 ? page : kept.concat(page);
      });
      setNext(pagination.nextStart || 0);
      setHasMore(Boolean(pagination.hasMore));
    }).catch(() => {
      if (current.current) {
        setHasMore(false);
      }
    }).finally(() => {
      if (current.current) {
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    current.current = true;
    load(0);
    return () => {
      current.current = false;
    };
  }, []);

  if (isLoading) {
    return <Progress />;
  }

  if (feeds.length === 0 && !hasMore) {
    return (
      <Typography variant="body1" color="textSecondary" sx={{ p: 2 }}>
        {i18n.t('recommendations:empty.feed')}
      </Typography>
    );
  }

  return (
    <InfiniteScroll
      dataLength={feeds.length}
      next={() => {
        load(next);
      }}
      hasMore={hasMore}
      loader={<Progress key="shared-feeds-progress" />}
    >
      <Masonry>
        {feeds.map((feed) => {
          return (
            <Box key={`shared-feed-${feed.id}`} sx={{ mb: 2 }}>
              <CustomFeedSearchCard feed={feed} />
            </Box>
          );
        })}
      </Masonry>
    </InfiniteScroll>
  );
};

SharedFeeds.propTypes = {
  viewer: PersonType.isRequired,
};

const mapStateToProps = (state) => {
  return {
    viewer: state.session.viewer,
  };
};

export default connect(mapStateToProps)(SharedFeeds);
