import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

import LocationIcon from '@mui/icons-material/LocationOn';

import utils from '../../../utils';
import LocationType from '../../../proptypes/Location';

const { getAddress } = utils.node;

const LocationsListItem = ({
  location,
  actions = null,
}) => {
  return (
    <ListItem
      key={`locations-list-item-${location.id}`}
      divider
      disablePadding
      secondaryAction={actions}
    >
      <ListItemButton
        component="a"
        href={`/locations/${location.id}-${location.alias}/`}
      >
        <ListItemAvatar>
          <Avatar>
            <LocationIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={location.name}
          secondary={getAddress(location)}
        />
      </ListItemButton>
    </ListItem>
  );
};

LocationsListItem.propTypes = {
  location: LocationType.isRequired,
  actions: PropTypes.node,
};

export default LocationsListItem;
