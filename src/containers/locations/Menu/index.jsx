import React from 'react';
import PropTypes from 'prop-types';

import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/EditOutlined';
import ReportIcon from '@mui/icons-material/FlagOutlined';

import MenuItemLabel from '../../../components/MenuItemLabel';

import permissions from '../../../permissions/node';
import utils from '../../../utils';
import i18n from '../../../languages';

import ControlDelete from '../../controls/Delete';

import PersonType from '../../../proptypes/Person';
import LocationType from '../../../proptypes/Location';
import useReport from '../../reports/useReport';

const { withRef } = utils.component;

const DeleteActionWithRef = withRef(ControlDelete);

const LocationMenu = ({
  location,
  viewer,
  handleEdit = null,
  canAdminister = false,
}) => {
  const canEdit = permissions.canEdit(viewer, location);
  const report = useReport(viewer, location);
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
        {canAdminister && handleEdit &&
          <MenuItem
            onClick={() => {
              handleEdit();
              handleClose();
            }}
            disabled={!canEdit}
          >
            <MenuItemLabel icon={<EditIcon fontSize="small" />}>
              {i18n.t('actions:edit')}
            </MenuItemLabel>
          </MenuItem>}
        {canAdminister &&
          <DeleteActionWithRef
            node={location}
            redirect="/locations/"
            key={`location-delete-${location.id}`}
            component="menuitem"
            confirmMessage={i18n.t('locations:confirm.delete')}
          />}
        {report.canReport &&
          <MenuItem
            onClick={() => {
              handleClose();
              report.open();
            }}
          >
            <MenuItemLabel icon={<ReportIcon fontSize="small" />}>
              {i18n.t('abuseReports:report')}
            </MenuItemLabel>
          </MenuItem>}
      </Menu>
      {report.dialog}
    </>
  );
};

LocationMenu.propTypes = {
  location: LocationType.isRequired,
  viewer: PersonType.isRequired,
  handleEdit: PropTypes.func,
  // Administrators edit and delete; anybody signed in may report.
  canAdminister: PropTypes.bool,
};

export default LocationMenu;
