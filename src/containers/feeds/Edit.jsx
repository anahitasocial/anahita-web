import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate, useParams } from 'react-router-dom';

import Typography from '@mui/material/Typography';

import CustomFeedForm from './Form';
import useFeed from './useFeed';
import Progress from '../../components/Progress';
import i18n from '../../languages';
import customFeeds from '../../utils/customFeeds';

// Changing a custom feed. Its owner's to do: anybody else who can see the
// feed is sent to read it, where they can copy it and change the copy.
const CustomFeedEdit = () => {
  const { id } = useParams();
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
      <CustomFeedForm key={feed.id} feed={feed} />
    </>
  );
};

export default CustomFeedEdit;
