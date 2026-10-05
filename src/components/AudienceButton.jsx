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
import LeadersIcon from '@mui/icons-material/PersonSearch';
import MutualsIcon from '@mui/icons-material/SyncAlt';
import AdminsIcon from '@mui/icons-material/SupervisorAccount';
import MyselfIcon from '@mui/icons-material/Lock';

import audience from '../utils/audience';
import i18n from '../languages';
import ActorType from '../proptypes/Actor';
import PersonType from '../proptypes/Person';

const ICONS = {
  public: PublicIcon,
  registered: RegisteredIcon,
  followers: FollowersIcon,
  leaders: LeadersIcon,
  mutuals: MutualsIcon,
  admins: AdminsIcon,
  myself: MyselfIcon,
};

// The audience button: who can see a post.
//
// One control for the two places the question comes up: beside the Post
// button while a post is being written, and on a post that exists, for
// somebody who may change who sees it. They used to look different, a
// labelled button in one place and a bare globe or padlock in the other,
// for what is the same choice.
//
// A button that names the current choice, opening a short menu. Not an
// icon alone: the difference between a globe and a padlock is the
// difference between everybody and nobody, and it should not depend on
// reading a 20-pixel glyph.
//
// It only draws. Which options there are and which are disabled is the
// caller's to say: see utils/audience, and the two callers,
// containers/media/Composer and containers/controls/medium/Access.
const AudienceButton = ({
  actor,
  viewer,
  options,
  value,
  onChange,
  disabled = false,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  // Whose profile it is decides the wording: "people who follow you" on
  // your own, "people who follow Ada" on hers, "members" in a group.
  const place = audience.placeOf(actor, viewer);
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

AudienceButton.propTypes = {
  // The profile the post is on.
  actor: ActorType.isRequired,
  viewer: PersonType.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    level: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
  })).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default AudienceButton;
