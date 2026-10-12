import React from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';

import ShareIcon from '@mui/icons-material/SendOutlined';

import MenuItemLabel from '../../components/MenuItemLabel';
import i18n from '../../languages';
import share from '../../utils/share';
import utils from '../../utils';

const { getActorName, getURL, isActor } = utils.node;

// What to share of a node: where it is, what to call it, and who can see
// it. A post is called by its title, or by the start of its text; a profile
// by its name.
const ofNode = (node) => {
  return {
    path: getURL(node),
    title: isActor(node) ? getActorName(node) : (node.name || ''),
    text: isActor(node) ? '' : (node.body || ''),
    access: node.access,
  };
};

// Share, as a button: the paper plane. Opens the app's one share dialog on
// `what` ({ path, title, text, access }).
const ShareButton = ({ what, ...other }) => {
  const label = i18n.t('share:action');

  return (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        onClick={() => {
          share.open(what);
        }}
        {...other}
      >
        <ShareIcon />
      </IconButton>
    </Tooltip>
  );
};

ShareButton.propTypes = {
  what: PropTypes.object.isRequired,
};

// Share, in the row of buttons under a post, beside like, reply and
// repost and drawn as they are: the width of its place in the row.
const ShareAction = ({ what }) => {
  const label = i18n.t('share:action');

  return (
    <Button
      onClick={() => {
        share.open(what);
      }}
      startIcon={<ShareIcon />}
      color="default"
      aria-label={label}
      title={label}
      fullWidth
    />
  );
};

ShareAction.propTypes = {
  what: PropTypes.object.isRequired,
};

// Share, as an item in a menu. `onDone` closes the menu: the dialog is the
// app's and stays when the menu goes.
const ShareMenuItem = React.forwardRef(({ what, onDone = null }, ref) => {
  return (
    <MenuItem
      ref={ref}
      onClick={() => {
        share.open(what);
        if (onDone) {
          onDone();
        }
      }}
    >
      <MenuItemLabel icon={<ShareIcon fontSize="small" />}>
        {i18n.t('share:action')}
      </MenuItemLabel>
    </MenuItem>
  );
});

ShareMenuItem.propTypes = {
  what: PropTypes.object.isRequired,
  onDone: PropTypes.func,
};

export {
  ShareAction,
  ShareButton,
  ShareMenuItem,
  ofNode,
};
