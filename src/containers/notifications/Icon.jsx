import React from 'react';
import PropTypes from 'prop-types';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/NotificationsOutlined';

// The bell, with how many are unread at its corner, in the secondary
// colour, which shows on the top bar's primary. Plain, as the menu and
// search are: in a circle it was a second round picture beside the
// viewer's own (the user, 2026-11-07).
const NotificationsBell = ({ count = 0 }) => {
  return (
    <Badge badgeContent={count} color="secondary">
      <NotificationsIcon />
    </Badge>
  );
};

NotificationsBell.propTypes = {
  count: PropTypes.number,
};

export default NotificationsBell;
