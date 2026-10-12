import React from 'react';
import PropTypes from 'prop-types';

import FollowFeed from './FollowFeed';
import i18n from '../../languages';
import customFeeds from '../../utils/customFeeds';

// Following a hashtag: a feed of that one hashtag on the home page.
const FollowHashtag = ({ tag }) => {
  return (
    <FollowFeed
      name={`#${tag}`}
      definition={customFeeds.ofHashtag(tag)}
      label={i18n.t('customFeeds:actions.follow', { tag })}
      done={i18n.t('customFeeds:prompts.followed', { tag })}
    />
  );
};

FollowHashtag.propTypes = {
  // The hashtag as it is kept: no "#", lower case.
  tag: PropTypes.string.isRequired,
};

export default FollowHashtag;
