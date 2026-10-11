import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import Grid from '@mui/material/Grid';

import CustomFeedForm from './Form';
import i18n from '../../languages';
import customFeeds from '../../utils/customFeeds';

// Making a custom feed, on a page of its own beside the list of feeds.
//
// Cancelled, it goes back to the list. Saved, it opens the feed: Home on
// its tab, where the server has put it, or its own page with the home page
// full.
const CustomFeedAdd = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>{i18n.t('customFeeds:form.titleAdd')}</title>
      </Helmet>
      <Grid container sx={{ justifyContent: 'center' }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <CustomFeedForm
            onClose={() => {
              navigate('/feeds');
            }}
            onSaved={(feed) => {
              navigate(customFeeds.whereToRead(feed));
            }}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default CustomFeedAdd;
