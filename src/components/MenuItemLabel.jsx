import React from 'react';
import PropTypes from 'prop-types';

import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

// What goes inside a menu's item: an icon, then the words. Every item in
// the menus on posts, replies and feed items is written with it, so they
// line up and none is a bare line of text among ones with icons.
const MenuItemLabel = ({ icon, children }) => {
  return (
    <>
      <ListItemIcon>
        {icon}
      </ListItemIcon>
      <ListItemText>
        {children}
      </ListItemText>
    </>
  );
};

MenuItemLabel.propTypes = {
  // A small icon: <EditIcon fontSize="small" />.
  icon: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
};

export default MenuItemLabel;
