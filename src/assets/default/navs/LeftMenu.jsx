import React from 'react';
import PropTypes from 'prop-types';

import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

// import BlogsIcon from '@mui/icons-material/RssFeedOutlined';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import GroupsIcon from '@mui/icons-material/GroupWork';
// ExitToApp, not LockOpen.
//
// An open padlock pictures an account that is NOT secured, which is the
// opposite of what signing out does — and it sat two entries from a
// Password card whose icon is a closed Lock, so the pair read as a
// state toggle between secure and insecure rather than as an action.
// A door with an arrow through it says leave.
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LabelIcon from '@mui/icons-material/Label';
import LocationIcon from '@mui/icons-material/LocationOn';
import SettingsIcon from '@mui/icons-material/Settings';
import SignupRequestsIcon from '@mui/icons-material/HowToReg';
import InvitesIcon from '@mui/icons-material/MailOutlined';
import LegalIcon from '@mui/icons-material/MenuBook';
import SupportIcon from '@mui/icons-material/ContactSupport';
import AboutIcon from '@mui/icons-material/Info';

import { Link, useLocation } from 'react-router-dom';

import i18n from '../../../languages';
import PersonType from '../../../proptypes/Person';
import NodeInfoType from '../../../proptypes/NodeInfo';
import permissions from '../../../permissions';

const LeftMenu = ({
  isAuthenticated,
  viewer,
  nodeInfo = null,
  onLogoutClick = null,
}) => {
  const location = useLocation();
  const { pathname = '/' } = location;

  // Whether invitations are being issued at all, and who may issue one.
  // Both are server settings published through NodeInfo, and both are
  // absent until that answers — which ranks as "nobody", so the entry
  // appears once the answer arrives rather than flashing in and out for
  // somebody who cannot use it.
  const inviteSettings = (nodeInfo && nodeInfo.metadata) || {};

  return (
    <List>
      <ListItemButton
        component={Link}
        to="/"
        selected={pathname === '/'}
      >
        <ListItemIcon>
          <HomeIcon />
        </ListItemIcon>
        <ListItemText primary={isAuthenticated ? i18n.t('dashboard:cTitle') : i18n.t('home:cTitle')} />
      </ListItemButton>
      <ListItemButton
        component={Link}
        to="/people/"
        selected={pathname === '/people/'}
      >
        <ListItemIcon>
          <PeopleIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('people:cTitle')} />
      </ListItemButton>
      <ListItemButton
        component={Link}
        to="/groups/"
        selected={pathname === '/groups/'}
      >
        <ListItemIcon>
          <GroupsIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('groups:cTitle')} />
      </ListItemButton>
      <ListItemButton
        component={Link}
        to="/hashtags/"
        selected={pathname === '/hashtags/'}
      >
        <ListItemIcon>
          <LabelIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('hashtags:cTitle')} />
      </ListItemButton>
      <ListItemButton
        component={Link}
        to="/locations/"
        selected={pathname === '/locations/'}
      >
        <ListItemIcon>
          <LocationIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('locations:cTitle')} />
      </ListItemButton>
      {/* Three separate gates, not one, because the three pages answer
          to three different rules. The queue is administrator-level,
          settings is super admin, and invites is whatever INVITES_FROM
          says — which is why that one is the only gate here that needs
          an answer from the server.

          Invites is gated on canAdd rather than canBrowse. Anybody
          registered may READ their own list, but a page that can only
          ever be empty is not worth a permanent menu entry; somebody
          who still has invitations from before a tightening can reach
          /invites directly. */}
      {isAuthenticated && permissions.signupRequest.canBrowse(viewer) &&
        <ListItemButton
          component={Link}
          to="/signup-requests"
          selected={pathname === '/signup-requests'}
        >
          <ListItemIcon>
            <SignupRequestsIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('signupRequests:mTitle')} />
        </ListItemButton>}
      {isAuthenticated && permissions.invite.canAdd(viewer, inviteSettings) &&
        <ListItemButton
          component={Link}
          to="/invites"
          selected={pathname === '/invites'}
        >
          <ListItemIcon>
            <InvitesIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('invites:mTitle')} />
        </ListItemButton>}
      {isAuthenticated && permissions.settings.canBrowse(viewer) &&
        <ListItemButton
          component={Link}
          to="/settings/"
          selected={pathname === '/settings/'}
        >
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('settings:mTitle')} />
        </ListItemButton>}
      {/* <ListItemButton
        component={Link}
        to="/blogs/"
        selected={pathname === '/blogs/'}
      >
        <ListItemIcon>
          <BlogsIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('blogs:cTitle')} />
      </ListItemButton> */}
      {/* Public, for everybody signed in or not. Support is where somebody
          who cannot sign in is sent, the terms are read before an account
          exists, and About is how a stranger decides whether to ask for one
          — hiding any of them behind authentication hides them from the
          people they are for. */}
      <ListItemButton
        component={Link}
        to="/about"
        selected={pathname === '/about'}
      >
        <ListItemIcon>
          <AboutIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('about:mTitle')} />
      </ListItemButton>
      <ListItemButton
        component={Link}
        to="/support"
        selected={pathname === '/support'}
      >
        <ListItemIcon>
          <SupportIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('pages:support')} />
      </ListItemButton>
      <ListItemButton
        component={Link}
        to="/legal/tos"
        selected={pathname.startsWith('/legal')}
      >
        <ListItemIcon>
          <LegalIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('legal:mTitle')} />
      </ListItemButton>
      {isAuthenticated &&
        <ListItemButton
          component="a"
          onClick={onLogoutClick}
        >
          <ListItemIcon>
            <ExitToAppIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('auth:logout')} />
        </ListItemButton>}
    </List>
  );
};

LeftMenu.propTypes = {
  onLogoutClick: PropTypes.func,
  viewer: PersonType.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  nodeInfo: NodeInfoType,
};

export default LeftMenu;
