import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import CustomFeedForm from './Form';
import CustomFeedsManage from './Manage';
import i18n from '../../languages';
import customFeeds from '../../utils/customFeeds';

// Making a custom feed: the editor, in a dialog over the list of the
// viewer's feeds.
//
// It has an address of its own, so the menu's "Custom feed" is a link like
// any other and the browser's Back closes the dialog. Closed, it goes back
// to wherever it was opened from. Saved, it opens Home on the new feed,
// which the server has put there; with the home page full, the feed's own
// page.
const CustomFeedAdd = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>{i18n.t('customFeeds:form.titleAdd')}</title>
      </Helmet>
      <CustomFeedsManage />
      <CustomFeedForm
        onClose={() => {
          customFeeds.leave(navigate, '/feeds');
        }}
        onSaved={(feed) => {
          navigate(feed.isPinned ? `/?feed=${feed.id}` : customFeeds.urlOf(feed));
        }}
      />
    </>
  );
};

export default CustomFeedAdd;
