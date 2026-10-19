import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';

import Bell from './Icon';
import useUnreadCount from './useUnreadCount';

import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';

// The bell in the top bar, for somebody signed in: how many notifications
// are unread, kept current as useUnreadCount says, and the way to them.
const NotificationButton = ({ count, setUnread, resetUnread }) => {
  useUnreadCount({
    ask: () => {
      return api.notifications.count().then(({ data }) => {
        return {
          count: Number(data.count) || 0,
          newestAt: data.newestAt || '',
        };
      });
    },
    onCount: setUnread,
  });

  // Signed out, the count goes with the session.
  useEffect(() => {
    return () => {
      resetUnread();
    };
  }, []);

  return (
    <IconButton
      component={Link}
      to="/notifications"
      color="inherit"
      size="small"
      aria-label={count > 0 ?
        i18n.t('notifications:bell', { count }) :
        i18n.t('notifications:cTitle')}
    >
      <Avatar color="inherit">
        <Bell count={count} />
      </Avatar>
    </IconButton>
  );
};

NotificationButton.propTypes = {
  count: PropTypes.number.isRequired,
  setUnread: PropTypes.func.isRequired,
  resetUnread: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    count: state.notificationsUnread.count,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setUnread: (count, newestAt) => {
      return dispatch(actions.notifications.unread.set(count, newestAt));
    },
    resetUnread: () => {
      return dispatch(actions.notifications.unread.reset());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(NotificationButton);
