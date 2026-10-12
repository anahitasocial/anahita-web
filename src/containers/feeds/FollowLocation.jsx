import React from 'react';

import FollowFeed from './FollowFeed';
import i18n from '../../languages';
import customFeeds from '../../utils/customFeeds';
import LocationType from '../../proptypes/Location';

// The most of a place's name a feed is called by: a feed's name is a
// hundred characters at most.
const NAME_MAX = 100;

// Following a place: a feed of what was posted there, on the home page.
//
// It shows only what the viewer could see anyway, as every feed does, and
// nobody is told: the feed is theirs alone, and who follows a place is not
// kept anywhere.
const FollowLocation = ({ location }) => {
  const name = (location.name || '').trim();

  return (
    <FollowFeed
      name={name.slice(0, NAME_MAX)}
      icon="place"
      definition={customFeeds.ofLocation(location.id)}
      label={i18n.t('customFeeds:actions.followPlace')}
      done={i18n.t('customFeeds:prompts.followedPlace', { name })}
    />
  );
};

FollowLocation.propTypes = {
  location: LocationType.isRequired,
};

export default FollowLocation;
