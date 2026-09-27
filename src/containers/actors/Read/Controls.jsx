import React, { useState } from 'react';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ControlBlock from '../../controls/Block';
import ControlFeature from '../../controls/Feature';

import ActorType from '../../../proptypes/Actor';
import PersonType from '../../../proptypes/Person';
import utils from '../../../utils';
import i18n from '../../../languages';
import perms from '../../../permissions/actor';

const ITEM_HEIGHT = 48;

const { node } = utils;

const ActorsReadControls = ({
  actor,
  isAuthenticated = false,
  viewer,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpen = (event) => {
    const { currentTarget } = event;
    setAnchorEl(currentTarget);
  };

  const showBlock = isAuthenticated && perms.canBlock(actor, viewer);
  const showEdit = perms.canEdit(actor);
  const showFeature = isAuthenticated && perms.canFeature(actor, viewer);

  return (
    <>
      <IconButton
        aria-label="More"
        aria-owns={anchorEl ? 'long-menu' : null}
        aria-haspopup="true"
        onClick={handleOpen}
        size="large"
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
            width: 200,
          },
        }}
      >
        {showBlock &&
          <ControlBlock
            actor={actor}
            key="actor-socialgraph-block"
            component="menuitem"
          />}
        {showFeature &&
          <ControlFeature
            actor={actor}
            key="actor-featured"
          />}
        {showEdit &&
          <MenuItem
            key={`actor-edit-${actor.id}`}
            component="a"
            href={`${node.getURL(actor)}settings`}
          >
            {i18n.t('commons:settings')}
          </MenuItem>}
        {/* No delete here. It deleted a whole profile behind a generic
            "Are you sure?", routing around the Danger zone card that states
            what is destroyed, what is recoverable and by when — so the
            ceremony there was decorative while this existed. Deleting a
            profile is now a deliberate trip to settings. */}
      </Menu>
    </>
  );
};

ActorsReadControls.propTypes = {
  actor: ActorType,
  isAuthenticated: PropTypes.bool,
  viewer: PersonType.isRequired,
};

export default ActorsReadControls;
