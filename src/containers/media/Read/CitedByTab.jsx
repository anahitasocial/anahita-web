import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';

import Progress from '../../../components/Progress';
import { PostRow } from '../../../components/PostEmbed';
import api from '../../../api';
import i18n from '../../../languages';

const LIMIT = 20;

// What cites a post here, in a tab of its own beside its replies and its
// places (the user, 2026-10-17: "citations are part of the article, cited
// by are relations"): newest first, as the viewer may see them, more as
// they scroll. What an article cites stays at the end of its text.
// scrollableTarget is the id of the element that scrolls, where that is not
// the window: the stepper's side panel.
const CitedByTab = ({ medium, scrollableTarget = undefined }) => {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const load = (start) => {
    return api.citations.citedBy(medium, { start, limit: LIMIT }).then((result) => {
      const page = (result.data && result.data.data) || [];
      setPosts((before) => { return start === 0 ? page : before.concat(page); });
      setTotal((result.data && result.data.pagination && result.data.pagination.total) || 0);
    }).catch(() => {
      setTotal(0);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    setPosts([]);
    setIsLoading(true);
    load(0);
  }, [medium.id]);

  return (
    <Card sx={{ py: 1 }}>
      {isLoading && <Progress />}
      {!isLoading && posts.length === 0 &&
        <CardContent>
          <Typography variant="body2" color="textSecondary">
            {i18n.t('media:citations.noneCitedBy')}
          </Typography>
        </CardContent>}
      {posts.length > 0 &&
        <InfiniteScroll
          dataLength={posts.length}
          next={() => {
            load(posts.length);
          }}
          hasMore={posts.length < total}
          loader={<Progress key="cited-by-progress" />}
          scrollableTarget={scrollableTarget}
          style={{ overflow: 'visible' }}
        >
          <List>
            {posts.map((post) => {
              return <PostRow key={`cited-by-${post.id}`} post={post} />;
            })}
          </List>
        </InfiniteScroll>}
    </Card>
  );
};

CitedByTab.propTypes = {
  medium: PropTypes.object.isRequired,
  scrollableTarget: PropTypes.string,
};

export default CitedByTab;
