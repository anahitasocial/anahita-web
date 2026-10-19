import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';

import Bell from './Icon';
import NotificationsMenu from './Menu';
import useUnreadCount from './useUnreadCount';

import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';

// The bell in the top bar, for somebody signed in: how many notifications
// are unread, kept current as useUnreadCount says, and the way to them. On
// a desktop it opens the latest few in a menu (roadmap row 97, part 4); on
// a phone it goes to the page.
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

  const phone = useMediaQuery((theme) => { return theme.breakpoints.down('sm'); });
  const [menuAt, setMenuAt] = useState(null);

  // Signed out, the count goes with the session.
  useEffect(() => {
    return () => {
      resetUnread();
    };
  }, []);

  const label = count > 0 ?
    i18n.t('notifications:bell', { count }) :
    i18n.t('notifications:cTitle');
  const bell = (
    <Avatar color="inherit">
      <Bell count={count} />
    </Avatar>
  );

  if (phone) {
    return (
      <IconButton component={Link} to="/notifications" color="inherit" size="small" aria-label={label}>
        {bell}
      </IconButton>
    );
  }

  return (
    <>
      <IconButton
        color="inherit"
        size="small"
        aria-label={label}
        aria-haspopup="true"
        aria-expanded={Boolean(menuAt)}
        onClick={(event) => {
          setMenuAt(event.currentTarget);
        }}
      >
        {bell}
      </IconButton>
      <NotificationsMenu
        anchorEl={menuAt}
        onClose={() => {
          setMenuAt(null);
        }}
      />
    </>
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
