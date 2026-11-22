import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import { alpha } from '@mui/material/styles';

import HomeIcon from '@mui/icons-material/Home';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import LoginIcon from '@mui/icons-material/Login';
import SearchIcon from '@mui/icons-material/Search';

import ComposeButton from './media/Composer/ComposeButton';
import NotificationButton from './notifications/Button';
import ViewerType from '../proptypes/Viewer';
import actions from '../actions';
import i18n from '../languages';
import utils from '../utils';

const { getActorInitials, getAvatarURL } = utils.node;

// Out of sight, still read by a screen reader: Material UI's own
// visuallyHidden, which the app does not depend on directly.
const visuallyHidden = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: '1px',
};

// How tall the bar is, above the phone's own home bar: what the page leaves
// free at its foot (App.jsx). Material UI's own BottomNavigation height.
export const MOBILE_BAR_HEIGHT = 56;

// The bar at the foot of the screen on a mobile (roadmap row 166, for
// anahita-mobile too): Home, Search, +, Notifications and the viewer's own
// profile photo, five, with + in the middle. The rest is in the menu, ≡ at
// the top. A visitor has Home, Search and Sign in.
//
// Material UI's own BottomNavigation (the user, 2026-11-21, after a
// floating pill was tried): across the foot of the screen, icons alone, the
// open page's in the theme's colour; their names are for screen readers. Its paper is 70%
// opaque and blurs what scrolls under it. Home, tapped at home, goes back to
// the top. The + and the bell are BottomNavigationActions drawn by their own
// components (`inBar`), which keep what they do: the composers, the count.
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
  // The viewer's own profile, at /people/<alias> or /@<alias>.
  const alias = (viewer.alias || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const ownProfile = alias ? new RegExp(`^/(people/|@)${alias}(/|$)`, 'i') : /^$/;

  let open = null;
  if (searching) {
    open = 'search';
  } else if (atHome) {
    open = 'home';
  } else if (pathname.startsWith('/notifications')) {
    open = 'notifications';
  } else if (ownProfile.test(pathname)) {
    open = 'profile';
  }

  const home = (
    <BottomNavigationAction
      key="home"
      value="home"
      label={i18n.t('home:cTitle')}
      icon={atHome ? <HomeIcon /> : <HomeOutlinedIcon />}
      component={Link}
      to="/"
      onClick={() => {
        // Home again, from home: back to the top of the feed.
        if (atHome) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }}
    />
  );
  const search = (
    <BottomNavigationAction
      key="search"
      value="search"
      label={i18n.t('search:cTitle')}
      icon={<SearchIcon />}
      onClick={onSearch}
    />
  );

  const items = isAuthenticated ? [
    home,
    search,
    <ComposeButton key="compose" value="compose" inBar />,
    <NotificationButton key="notifications" value="notifications" inBar />,
    <BottomNavigationAction
      key="profile"
      value="profile"
      label={i18n.t('commons:yourProfile')}
      icon={
        <Avatar
          alt=""
          src={getAvatarURL(viewer) || undefined}
          sx={{
            width: 24,
            height: 24,
            fontSize: 11,
            // A picture takes no colour: open, it is ringed instead.
            outline: open === 'profile' ? 2 : 0,
            outlineColor: 'primary.main',
            outlineOffset: 2,
          }}
        >
          {getActorInitials(viewer)}
        </Avatar>
      }
      component={Link}
      to={profile}
    />,
  ] : [
    home,
    search,
    <BottomNavigationAction
      key="login"
      value="login"
      label={i18n.t('actions:login')}
      icon={<LoginIcon />}
      onClick={() => {
        login();
      }}
    />,
  ];

  return (
    <Paper
      component="nav"
      square
      elevation={3}
      aria-label={i18n.t('commons:mainNavigation')}
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: (theme) => { return theme.zIndex.appBar; },
        backgroundColor: (theme) => { return alpha(theme.palette.background.paper, 0.7); },
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        pb: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Each action at least 80 pixels wide, Material UI's own, made five
          400, wider than many a mobile: they share the width instead. */}
      <BottomNavigation
        value={open}
        sx={{
          bgcolor: 'transparent',
          // Icons alone, the open one in the theme's colour, all on one
          // line: the names are for screen readers only (the user,
          // 2026-11-21), and the open one is not lifted to make room for
          // its name.
          '& .MuiBottomNavigationAction-root': { minWidth: 0, py: 0 },
          '& .MuiBottomNavigationAction-label': visuallyHidden,
        }}
      >
        {items}
      </BottomNavigation>
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
