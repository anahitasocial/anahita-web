import React from 'react';
import PropTypes from 'prop-types';

import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import permissions from '../../../permissions/node';
import utils from '../../../utils';
import i18n from '../../../languages';

import ControlDelete from '../../controls/Delete';

import PersonType from '../../../proptypes/Person';
import LocationType from '../../../proptypes/Location';

const { withRef } = utils.component;

const DeleteActionWithRef = withRef(ControlDelete);

const LocationMenu = ({
  location,
  viewer,
  handleEdit = null,
}) => {
  const canEdit = permissions.canEdit(viewer, location);
  const [menuAnchorEl, setAnchorEl] = React.useState(null);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        aria-owns={menuAnchorEl ? `location-card-menu-${location.id}` : undefined}
        aria-haspopup="true"
        onClick={handleOpenMenu}
        size="large"
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id={`location-menu-${location.id}`}
        anchorEl={menuAnchorEl}
        keepMounted
        open={Boolean(menuAnchorEl)}
        onClose={handleClose}
      >
        {handleEdit &&
          <MenuItem
            onClick={() => {
              handleEdit();
              handleClose();
            }}
            disabled={!canEdit}
          >
            Edit
          </MenuItem>}
        <DeleteActionWithRef
          node={location}
          redirect="/locations/"
          key={`location-delete-${location.id}`}
          confirmMessage={i18n.t('locations:confirm.delete')}
        />
      </Menu>
    </>
  );
};

LocationMenu.propTypes = {
  location: LocationType.isRequired,
  viewer: PersonType.isRequired,
  handleEdit: PropTypes.func,
};

export default LocationMenu;
