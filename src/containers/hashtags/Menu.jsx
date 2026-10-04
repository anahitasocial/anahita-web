import React from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import PropTypes from 'prop-types';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import utils from '../../utils';
import i18n from '../../languages';

import ControlDelete from '../controls/Delete';
import LocationType from '../../proptypes/Location';
import PersonType from '../../proptypes/Person';
import useReport from '../reports/useReport';

const { withRef } = utils.component;

const DeleteActionWithRef = withRef(ControlDelete);

// Shown to administrators, who may delete a hashtag, and to anybody
// signed in, who may report one.
const HashtagMenu = ({
  hashtag,
  viewer,
  canAdminister = false,
}) => {
  const report = useReport(viewer, hashtag);

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
        aria-owns={menuAnchorEl ? `hashtag-card-menu-${hashtag.id}` : undefined}
        aria-haspopup="true"
        onClick={handleOpenMenu}
        size="large"
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id={`hashtag-menu-${hashtag.id}`}
        anchorEl={menuAnchorEl}
        keepMounted
        open={Boolean(menuAnchorEl)}
        onClose={handleClose}
      >
        {canAdminister &&
          <DeleteActionWithRef
            node={hashtag}
            redirect="/hashtags/"
            key={`hashtag-delete-${hashtag.id}`}
            confirmMessage={i18n.t('hashtags:confirm.delete')}
          />}
        {report.canReport &&
          <MenuItem
            onClick={() => {
              handleClose();
              report.open();
            }}
          >
            {i18n.t('abuseReports:report')}
          </MenuItem>}
      </Menu>
      {report.dialog}
    </>
  );
};

HashtagMenu.propTypes = {
  hashtag: LocationType.isRequired,
  viewer: PersonType.isRequired,
  canAdminister: PropTypes.bool,
};

export default HashtagMenu;
