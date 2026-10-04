import React from 'react';
import PropTypes from 'prop-types';

import Badge from '@mui/material/Badge';
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
import AdminIcon from '@mui/icons-material/AdminPanelSettings';
import InvitesIcon from '@mui/icons-material/MailOutlined';
import LegalIcon from '@mui/icons-material/MenuBook';
import SupportIcon from '@mui/icons-material/ContactSupport';
import AboutIcon from '@mui/icons-material/Info';

import { Link, useLocation } from 'react-router-dom';

import i18n from '../../../languages';
import PersonType from '../../../proptypes/Person';
import NodeInfoType from '../../../proptypes/NodeInfo';
import permissions from '../../../permissions';
import adminTabs from '../../../containers/admin/tabs';

const LeftMenu = ({
  isAuthenticated,
  viewer,
  nodeInfo = null,
  onLogoutClick = null,
  adminWaiting = 0,
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
      {/* One entry for everything administrators look after: the signup
          queue, invitations and site settings are tabs behind it. Shown to
          anybody who may see at least one of those tabs, with the number
          of things waiting for them. */}
      {isAuthenticated && adminTabs.canBrowse(viewer) &&
        <ListItemButton
          component={Link}
          to="/admin"
          selected={pathname.startsWith('/admin')}
        >
          <ListItemIcon>
            <Badge
              badgeContent={adminWaiting}
              color="primary"
              aria-label={adminWaiting > 0 ?
                i18n.t('admin:waiting', { count: adminWaiting }) :
                undefined}
            >
              <AdminIcon />
            </Badge>
          </ListItemIcon>
          <ListItemText primary={i18n.t('admin:mTitle')} />
        </ListItemButton>}
      {/* Invitations, for a member who may invite (INVITES_FROM) but is not
          an administrator: they have no administration area, so the page
          keeps its own entry for them. Gated on canAdd rather than
          canBrowse: anybody registered may READ their own list, but a page
          that can only ever be empty is not worth a permanent menu entry. */}
      {isAuthenticated && !adminTabs.canBrowse(viewer) &&
        permissions.invite.canAdd(viewer, inviteSettings) &&
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
  // How many things are waiting in the administration area.
  adminWaiting: PropTypes.number,
};

export default LeftMenu;
