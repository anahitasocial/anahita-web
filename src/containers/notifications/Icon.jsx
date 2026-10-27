import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';

// The bell in its circle, with how many are unread on the circle's edge, in
// the secondary colour, which shows on the top bar's primary. The badge is
// outside the Avatar: inside, the circle clips it.
const NotificationsBell = ({ count = 0 }) => {
  return (
    <Badge badgeContent={count} color="secondary" overlap="circular">
      <Avatar color="inherit">
        <NotificationsIcon />
      </Avatar>
    </Badge>
  );
};

NotificationsBell.propTypes = {
  count: PropTypes.number,
};

export default NotificationsBell;
