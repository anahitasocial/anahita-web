/* eslint-disable no-undef */
import React, { useEffect, useState } from 'react';
import Badge from '@mui/material/Badge';
import Icon from '@mui/icons-material/Notifications';
import ErrorIcon from '@mui/icons-material/Error';
import api from '../../api';

let interval = null;
const PERIOD = process.env.REACT_APP_NOTIFICATIONS_CHECK_INTERVAL || 15000;

const NotificationsIcon = () => {
  const [count, setCount] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!interval) {
      interval = setInterval(() => {
        api.notifications.count()
          .then((response) => {
            const { count: newCount } = response.data;
            setCount(newCount);
          }).catch((err) => {
            setError(err);
          });
      }, PERIOD);
    }

    // eslint-disable-next-line consistent-return
    return () => {
      clearInterval(interval);
    };
  }, []);

  if (error) {
    return (
      <ErrorIcon color="error" />
    );
  }

  return (
    <Badge badgeContent={count} color="primary" overlap="rectangular">
      <Icon />
    </Badge>
  );
};

export default NotificationsIcon;
