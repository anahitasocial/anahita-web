import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';

import HomeIcon from '@mui/icons-material/Home';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SearchIcon from '@mui/icons-material/Search';

import ComposeButton from './media/Composer/ComposeButton';
import NotificationButton from './notifications/Button';
import ViewerType from '../proptypes/Viewer';
import actions from '../actions';
import i18n from '../languages';
import utils from '../utils';

const { getActorInitials, getAvatarURL } = utils.node;

// How tall the bar is, above the phone's own home bar: what the page leaves
// free at its foot (App.jsx).
export const MOBILE_BAR_HEIGHT = 56;

// The bar at the foot of the screen on a mobile (roadmap row 166, from
// Threads, Instagram and Flickr, and for anahita-mobile): Home, Search, +,
// Notifications and the viewer's own profile photo, five, with + in the
// middle. The rest is in the menu, ≡ at the top. A visitor has Home, Search
// and Sign in. Icons alone, each with its name for a screen reader; the one
// for the page that is open is in the text's own colour, the others quieter.
// It leaves room under it for the phone's home bar.
const MobileBar = ({
  isAuthenticated,
  viewer,
  searching,
  onSearch,
  login,
}) => {
  const { pathname } = useLocation();
  const atHome = pathname === '/';
  const profile = viewer.alias ? `/people/${viewer.alias}/` : '';
  const atProfile = Boolean(profile) && pathname.startsWith(profile);

  const shade = (isOpen) => {
    return { color: isOpen ? 'text.primary' : 'text.secondary' };
  };

  const slots = [
    <IconButton
      key="home"
      component={Link}
      to="/"
      aria-label={i18n.t('home:cTitle')}
      aria-current={atHome ? 'page' : undefined}
      sx={shade(atHome)}
    >
      {atHome ? <HomeIcon /> : <HomeOutlinedIcon />}
    </IconButton>,
    <IconButton
      key="search"
      aria-label={i18n.t('search:cTitle')}
      aria-current={searching ? 'page' : undefined}
      onClick={onSearch}
      sx={shade(searching)}
    >
      <SearchIcon />
    </IconButton>,
  ];

  if (isAuthenticated) {
    slots.push(
      <Box key="compose" sx={shade(false)}>
        <ComposeButton inBar />
      </Box>,
      <Box key="notifications" sx={shade(pathname.startsWith('/notifications'))}>
        <NotificationButton />
      </Box>,
      <IconButton
        key="profile"
        component={Link}
        to={profile}
        aria-label={i18n.t('commons:yourProfile')}
        aria-current={atProfile ? 'page' : undefined}
      >
        <Avatar
          alt=""
          src={getAvatarURL(viewer) || undefined}
          sx={{
            width: 28,
            height: 28,
            fontSize: 12,
            outline: atProfile ? 2 : 0,
            outlineColor: 'text.primary',
            outlineOffset: 2,
          }}
        >
          {getActorInitials(viewer)}
        </Avatar>
      </IconButton>,
    );
  } else {
    slots.push(
      <Button
        key="login"
        color="inherit"
        onClick={() => {
          login();
        }}
        sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}
      >
        {i18n.t('actions:login')}
      </Button>,
    );
  }

  return (
    <Paper
      component="nav"
      square
      elevation={0}
      aria-label={i18n.t('commons:mainNavigation')}
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: (theme) => { return theme.zIndex.appBar; },
        borderTop: 1,
        borderColor: 'divider',
        pb: 'env(safe-area-inset-bottom)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', height: MOBILE_BAR_HEIGHT }}>
        {slots.map((slot) => {
          return (
            <Box
              key={slot.key}
              sx={{ flex: '1 1 0', display: 'flex', justifyContent: 'center' }}
            >
              {slot}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

MobileBar.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  viewer: ViewerType.isRequired,
  // The search box is open in the top bar.
  searching: PropTypes.bool.isRequired,
  onSearch: PropTypes.func.isRequired,
  login: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    login: () => {
      return dispatch(actions.session.add());
    },
  };
};

export default connect(null, mapDispatchToProps)(MobileBar);
