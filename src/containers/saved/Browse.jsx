import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Masonry from '../../components/BreakpointMasonry';
import MediumCard from '../../components/MediumCard';
import Progress from '../../components/Progress';
import ReplyStats from '../../components/ReplyStats';
import LikesStats from '../likes';
import api from '../../api';
import i18n from '../../languages';

const LIMIT = 20;

// Saved: the posts the viewer saved, most recently saved first. On their own
// profile only, and theirs alone to see.
//
// Kept here and not in the store: nothing else on the page shows this list,
// and it is read again each time the tab is opened. A post that its saver
// can no longer see is not sent, so the list can be shorter than what was
// saved.
const SavedBrowse = () => {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);

  const load = (start) => {
    return api.saved.list({ start, limit: LIMIT }).then((result) => {
      const page = result.data.data || [];
      setTotal((result.data.pagination && result.data.pagination.total) || 0);
      setPosts((before) => {
        const known = {};
        before.forEach((post) => {
          known[post.id] = true;
        });
        return start === 0 ? page : [...before, ...page.filter((post) => {
          return !known[post.id];
        })];
      });
    }).catch(() => {
      setHasFailed(true);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    load(0);
  }, []);

  const handleRemove = (post) => {
    api.saved.set(post, false).then(() => {
      setPosts((before) => {
        return before.filter((each) => {
          return each.id !== post.id;
        });
      });
      setTotal((before) => {
        return Math.max(before - 1, 0);
      });
    }).catch(() => {
      setHasFailed(true);
    });
  };

  if (isLoading) {
    return <Progress />;
  }

  if (hasFailed && posts.length === 0) {
    return (
      <Typography variant="body2" color="error" role="alert" sx={{ p: 2 }}>
        {i18n.t('media:saved.loadFailed')}
      </Typography>
    );
  }

  if (posts.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1">
          {i18n.t('media:saved.empty')}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {i18n.t('media:saved.private')}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Typography variant="body2" color="textSecondary" sx={{ pb: 2 }}>
        {i18n.t('media:saved.private')}
      </Typography>
      <InfiniteScroll
        dataLength={posts.length}
        next={() => {
          load(posts.length);
        }}
        hasMore={posts.length < total}
        loader={<Progress key="saved-progress" />}
      >
        <Masonry>
          {posts.map((post) => {
            return (
              <Box key={`saved-${post.id}`} sx={{ mb: 2 }}>
                <MediumCard
                  medium={post}
                  stats={
                    <>
                      <LikesStats node={post} />
                      <ReplyStats node={post} />
                    </>
                  }
                  actions={
                    <Button
                      fullWidth
                      onClick={() => {
                        handleRemove(post);
                      }}
                    >
                      {i18n.t('media:saved.remove')}
                    </Button>
                  }
                />
              </Box>
            );
          })}
        </Masonry>
      </InfiniteScroll>
    </>
  );
};

export default SavedBrowse;
