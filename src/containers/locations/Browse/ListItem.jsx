import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
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
  detail = null,
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
          secondary={detail ?
            <>
              <Box component="span" sx={{ display: 'block' }}>
                {getAddress(location)}
              </Box>
              <Box component="span" sx={{ display: 'block' }}>
                {detail}
              </Box>
            </> :
            getAddress(location)}
        />
      </ListItemButton>
    </ListItem>
  );
};

LocationsListItem.propTypes = {
  location: LocationType.isRequired,
  actions: PropTypes.node,
  // A line under the address, such as how many profiles used it lately.
  // Words go here, not in actions, whose room is an icon's.
  detail: PropTypes.node,
};

export default LocationsListItem;
