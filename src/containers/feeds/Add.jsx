import React from 'react';
import { Helmet } from 'react-helmet-async';

import CustomFeedForm from './Form';
import i18n from '../../languages';

// Making a custom feed.
const CustomFeedAdd = () => {
  return (
    <>
      <Helmet>
        <title>{i18n.t('customFeeds:form.titleAdd')}</title>
      </Helmet>
      <CustomFeedForm />
    </>
  );
};

export default CustomFeedAdd;
