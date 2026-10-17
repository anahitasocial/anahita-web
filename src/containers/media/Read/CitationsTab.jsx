import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';

import Progress from '../../../components/Progress';
import { Citation, PostRow, citedIn } from '../../../components/PostEmbed';
import api from '../../../api';
import i18n from '../../../languages';

const LIMIT = 20;

// A heading over one of the two lists.
const Heading = ({ children }) => {
  return (
    <Typography variant="subtitle2" component="h2" color="textSecondary" sx={{ px: 2, pt: 2 }}>
      {children}
    </Typography>
  );
};

Heading.propTypes = {
  children: PropTypes.node.isRequired,
};

// A post's relations by citation, in a tab of their own beside its replies
// and its places (the user, 2026-10-17: "citations are part of the
// article, cited by are relations"). First what cites it here, newest
// first, as the viewer may see them, more as they scroll; then, for an
// article or a topic, what it cites, as at the end of its text.
const CitationsTab = ({ medium }) => {
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

  const cites = /\.(article|topic)\.v1$/.test(medium.type || '') ? citedIn(medium.body) : [];

  return (
    <Card sx={{ pb: 1 }}>
      <Heading>{i18n.t('media:citations.citedBy')}</Heading>
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
          style={{ overflow: 'visible' }}
        >
          <List>
            {posts.map((post) => {
              return <PostRow key={`cited-by-${post.id}`} post={post} />;
            })}
          </List>
        </InfiniteScroll>}
      {cites.length > 0 &&
        <>
          <Heading>{i18n.t('media:citations.cites')}</Heading>
          <List component="ol">
            {cites.map((address) => {
              return (
                <Citation
                  key={address}
                  url={address}
                  cards={medium.linkPreviews || []}
                />
              );
            })}
          </List>
        </>}
    </Card>
  );
};

CitationsTab.propTypes = {
  medium: PropTypes.object.isRequired,
};

export default CitationsTab;
