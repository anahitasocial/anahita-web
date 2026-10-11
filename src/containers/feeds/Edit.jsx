import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import CustomFeedForm from './Form';
import CustomFeedRead from './Read';
import useFeed from './useFeed';
import i18n from '../../languages';
import customFeeds from '../../utils/customFeeds';

// Changing a custom feed: the editor, in a dialog over the feed's own page.
//
// Its owner's to do. Anybody else who can see the feed is sent to read it,
// where they can copy it and change the copy. Until the feed has been read,
// and when there is none, the page behind says so by itself.
const CustomFeedEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { feed } = useFeed(id);

  if (feed && (!feed.authorized || !feed.authorized.edit)) {
    return <Navigate to={customFeeds.urlOf(feed)} replace />;
  }

  return (
    <>
      <CustomFeedRead />
      {feed &&
        <>
          <Helmet>
            <title>{i18n.t('customFeeds:form.titleEdit')}</title>
          </Helmet>
          <CustomFeedForm
            key={feed.id}
            feed={feed}
            onClose={() => {
              customFeeds.leave(navigate, customFeeds.urlOf(feed));
            }}
            onSaved={(saved) => {
              navigate(customFeeds.urlOf(saved));
            }}
          />
        </>}
    </>
  );
};

export default CustomFeedEdit;
