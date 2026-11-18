import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import i18n from '../../../languages';

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString(i18n.language);
};

// Where an account's own page is.
export const profilePath = (account) => {
  if (account.kind === 'group') {
    return `/groups/${account.id}/`;
  }
  if (account.kind === 'event' || account.kind === 'channel') {
    return `/@${account.alias}/`;
  }
  return `/people/${account.alias}/`;
};

// Where an account's settings are, for appointing an administrator, and for
// restoring a deleted group or event or removing it for good.
export const settingsPath = (account) => {
  return `/${account.kind}s/${account.id}/settings`;
};

// What the viewer is to an account, when it is somebody nobody may remove:
// themselves, or an administrator.
const roleLabel = (account, viewer) => {
  if (account.id === viewer.id) {
    return i18n.t('accounts:list.you');
  }
  if (account.personType === 'super-administrator') {
    return i18n.t('accounts:list.superAdministrator');
  }
  if (account.personType === 'administrator') {
    return i18n.t('accounts:list.administrator');
  }
  return '';
};

// One of the small outlined chips under an account, each saying one thing
// about it.
const Tag = (props) => {
  return (
    <Chip
      size="small"
      variant="outlined"
      sx={{ mr: 0.5, mb: 0.5 }}
      {...props}
    />
  );
};

// One account in the list: a tick to select it, unless accounts of its kind
// are removed one at a time; its name, leading to its page; when it was last
// active and made, how much it holds, and chips for what else is worth
// knowing about it.
const AccountItem = ({
  account,
  viewer,
  hasAdmins,
  oneAtATime,
  canSelect,
  isSelected,
  onToggle,
}) => {
  const role = roleLabel(account, viewer);

  return (
    <ListItem divider alignItems="flex-start">
      {!oneAtATime &&
      <ListItemIcon sx={{ minWidth: 40 }}>
        <Checkbox
          edge="start"
          size="small"
          disabled={!canSelect}
          checked={isSelected}
          onChange={() => {
            onToggle(account);
          }}
          slotProps={{
            input: {
              'aria-label': i18n.t('accounts:list.select', {
                name: account.name || account.alias,
              }),
            },
          }}
        />
      </ListItemIcon>}
      <ListItemText
        disableTypography
        primary={
          <Typography variant="subtitle1">
            <MuiLink
              component={Link}
              to={profilePath(account)}
              underline="hover"
              color="inherit"
            >
              {account.name || account.alias}
            </MuiLink>
            <Typography
              component="span"
              variant="body2"
              color="textSecondary"
            >
              {` @${account.alias}`}
            </Typography>
          </Typography>
        }
        secondary={
          <>
            <Typography variant="body2" color="textSecondary">
              {i18n.t('accounts:list.lastActive', {
                date: formatDate(account.lastActiveAt),
              })}
              {` · ${i18n.t('accounts:list.created', {
                date: formatDate(account.createdAt),
              })}`}
              {` · ${i18n.t(hasAdmins ? 'accounts:list.contentGroup' : 'accounts:list.content', {
                count: account.contentCount,
              })}`}
              {` · ${i18n.t('accounts:list.followers', {
                count: account.followerCount,
              })}`}
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <Tag label={i18n.t(`accounts:tiers.${account.tier}`)} />
              {/* A deleted group or event leads to its settings, to
                  restore it or remove it for good. */}
              {account.state !== 'active' &&
                <Tag
                  label={i18n.t(`accounts:states.${account.state}`)}
                  {...(account.state === 'deleted' && hasAdmins ? {
                    component: Link,
                    to: settingsPath(account),
                    clickable: true,
                  } : {})}
                />}
              {role &&
                <Tag color="primary" label={role} />}
              {account.emailVerified === false &&
                <Tag label={i18n.t('accounts:list.unverified')} />}
              {account.onboarded === false &&
                <Tag label={i18n.t('accounts:list.notOnboarded')} />}
              {/* A group nobody runs. Its settings are where an
                  administrator is appointed. */}
              {account.adminCount === 0 &&
                <Tag
                  color="warning"
                  label={`${i18n.t('accounts:list.noAdmin')} · ${i18n.t('accounts:list.appointAdmin')}`}
                  component={Link}
                  to={settingsPath(account)}
                  clickable
                />}
            </Box>
          </>
        }
      />
    </ListItem>
  );
};

AccountItem.propTypes = {
  account: PropTypes.object.isRequired,
  viewer: PropTypes.object.isRequired,
  // Groups, events and websites: content posted in them, and admins of
  // their own.
  hasAdmins: PropTypes.bool.isRequired,
  // No tick: accounts of this kind are removed one at a time.
  oneAtATime: PropTypes.bool.isRequired,
  canSelect: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default AccountItem;
