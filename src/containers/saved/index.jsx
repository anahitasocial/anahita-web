import React from 'react';
import { Helmet } from 'react-helmet-async';

import Box from '@mui/material/Box';

import SavedIcon from '@mui/icons-material/Bookmark';

import SavedBrowse from './Browse';
import BrowseHeader from '../../components/BrowseHeader';
import i18n from '../../languages';

// Saved, a page of its own in the left menu: the posts the viewer saved.
//
// It was a tab on the viewer's own profile first. A profile is what other
// people look at, so a list nobody else sees sat oddly there and had to say
// that it was private. Here it does not have to. Collections, to group what
// is saved, would be added to this page.
const SavedPage = () => {
  return (
    <>
      <Helmet>
        <title>{i18n.t('media:saved.title')}</title>
      </Helmet>
      <Box sx={{ mb: 2 }}>
        <BrowseHeader
          icon={<SavedIcon />}
          title={i18n.t('media:saved.title')}
        />
      </Box>
      <SavedBrowse />
    </>
  );
};

export default SavedPage;
