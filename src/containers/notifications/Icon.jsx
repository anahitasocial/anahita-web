import React from 'react';
import PropTypes from 'prop-types';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';

// The bell, with how many are unread.
const NotificationsBell = ({ count = 0 }) => {
  return (
    <Badge badgeContent={count} color="primary" overlap="rectangular">
      <NotificationsIcon />
    </Badge>
  );
};

NotificationsBell.propTypes = {
  count: PropTypes.number,
};

export default NotificationsBell;
