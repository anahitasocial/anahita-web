import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import CustomFeedForm from './Form';
import useFeed from './useFeed';
import Progress from '../../components/Progress';
import i18n from '../../languages';
import customFeeds from '../../utils/customFeeds';

// Changing a custom feed, on a page of its own beside the list of feeds,
// which is where it is reached from.
//
// Its owner's to do. Anybody else who can see the feed is sent to read it,
// where they can copy it and change the copy. Cancelled, or with the feed
// deleted, it goes back to the list. Saved, it opens the feed.
const CustomFeedEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { feed, isMissing } = useFeed(id);

  if (isMissing) {
    return (
      <Typography variant="body1" sx={{ p: 2 }}>
        {i18n.t('customFeeds:read.notFound')}
      </Typography>
    );
  }

  if (!feed) {
    return <Progress />;
  }

  if (!feed.authorized || !feed.authorized.edit) {
    return <Navigate to={customFeeds.urlOf(feed)} replace />;
  }

  return (
    <>
      <Helmet>
        <title>{i18n.t('customFeeds:form.titleEdit')}</title>
      </Helmet>
      <Grid container sx={{ justifyContent: 'center' }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <CustomFeedForm
            key={feed.id}
            feed={feed}
            onClose={() => {
              navigate('/feeds');
            }}
            onSaved={(saved) => {
              navigate(customFeeds.whereToRead(saved));
            }}
            onDeleted={() => {
              navigate('/feeds', { replace: true });
            }}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default CustomFeedEdit;
