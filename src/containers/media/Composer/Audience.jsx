import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import PublicIcon from '@mui/icons-material/Public';
import RegisteredIcon from '@mui/icons-material/HowToReg';
import FollowersIcon from '@mui/icons-material/People';
import MutualsIcon from '@mui/icons-material/SyncAlt';
import AdminsIcon from '@mui/icons-material/SupervisorAccount';
import MyselfIcon from '@mui/icons-material/Lock';

import audience from '../../../utils/audience';
import i18n from '../../../languages';
import ActorType from '../../../proptypes/Actor';
import PersonType from '../../../proptypes/Person';

const ICONS = {
  public: PublicIcon,
  registered: RegisteredIcon,
  followers: FollowersIcon,
  mutuals: MutualsIcon,
  admins: AdminsIcon,
  myself: MyselfIcon,
};

// The audience picker: who can see the post being written.
//
// A post used to be public the moment it was sent, and could only be
// narrowed afterwards, by which time it had been in every follower's
// feed. This puts the choice next to the Post button, where it is made
// before anybody sees anything.
//
// A button that names the current choice, opening a short menu. Not an
// icon alone: the difference between a globe and a padlock is the
// difference between everybody and nobody, and it should not depend on
// reading a 20-pixel glyph.
//
// Which options appear, which are disabled and where it starts are all
// in utils/audience. This only draws them.
const ComposerAudience = ({
  actor,
  viewer,
  value,
  onChange,
  disabled = false,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const place = audience.placeOf(actor, viewer);
  const options = audience.optionsFor(actor, viewer);
  const isGroup = place === audience.PLACE.GROUP;

  // In a group, the followers are its members, and are called that.
  const nameOf = (level) => {
    const key = isGroup && level === 'followers' ? 'members' : level;
    return i18n.t(`access:audience.names.${key}`);
  };

  // Public and registered mean the same everywhere. The rest depend on
  // whose profile it is.
  const describe = (level) => {
    if (level === 'public' || level === 'registered') {
      return i18n.t(`access:audience.descriptions.${level}`);
    }
    return i18n.t(`access:audience.descriptions.${place}.${level}`, {
      name: actor.name,
    });
  };

  const Icon = ICONS[value] || PublicIcon;

  return (
    <>
      <Button
        size="small"
        color="inherit"
        startIcon={<Icon fontSize="small" />}
        aria-haspopup="menu"
        aria-expanded={anchorEl ? 'true' : undefined}
        aria-label={i18n.t('access:audience.label', { name: nameOf(value) })}
        title={describe(value)}
        disabled={disabled}
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
        }}
        // Stays one line beside a full-width Post button.
        sx={{ flexShrink: 0, whiteSpace: 'nowrap', textTransform: 'none' }}
      >
        {nameOf(value)}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null);
        }}
      >
        {options.map((option) => {
          const OptionIcon = ICONS[option.level] || PublicIcon;

          return (
            <MenuItem
              key={option.level}
              role="menuitemradio"
              selected={option.level === value}
              disabled={option.disabled}
              onClick={() => {
                onChange(option.level);
                setAnchorEl(null);
              }}
            >
              <ListItemIcon>
                <OptionIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={nameOf(option.level)}
                // A disabled option says why, where the others say whom.
                secondary={option.disabled ?
                  i18n.t('access:audience.capped', { name: actor.name }) :
                  describe(option.level)}
                slotProps={{
                  secondary: { sx: { whiteSpace: 'normal' } },
                }}
              />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

ComposerAudience.propTypes = {
  actor: ActorType.isRequired,
  viewer: PersonType.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default ComposerAudience;
