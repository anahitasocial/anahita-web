import React from 'react';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import PersonType from '../../proptypes/Person';
import Icon from './Icon';

const NotificationButton = ({ viewer }) => {
  return (
    <IconButton
      href="/notifications"
      color="inherit"
      size="small"
    >
      <Avatar color="inherit">
        <Icon viewer={viewer} />
      </Avatar>
    </IconButton>
  );
};

NotificationButton.propTypes = {
  viewer: PersonType.isRequired,
};

export default NotificationButton;
