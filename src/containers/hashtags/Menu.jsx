import React from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import utils from '../../utils';
import i18n from '../../languages';

import ControlDelete from '../controls/Delete';
import LocationType from '../../proptypes/Location';

const { withRef } = utils.component;

const DeleteActionWithRef = withRef(ControlDelete);

const LocationMenu = (props) => {
  const {
    hashtag,
  } = props;

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
        <DeleteActionWithRef
          node={hashtag}
          redirect="/hashtags/"
          key={`hashtag-delete-${hashtag.id}`}
          confirmMessage={i18n.t('hashtags:confirm.delete')}
        />
      </Menu>
    </>
  );
};

LocationMenu.propTypes = {
  hashtag: LocationType.isRequired,
};

export default LocationMenu;
