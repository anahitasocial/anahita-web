import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ChevronIcon from '@mui/icons-material/ChevronRight';

// One choice on a post's Details page (roadmap row 114): its icon, what it
// is, what it is now, and a chevron to say that it opens; or, for a choice
// that is only on or off, a switch in place of the chevron (`end`). The same
// menus and dialogs open from it as from the small buttons it stands for.
const DetailRow = forwardRef(({
  icon,
  label,
  value = '',
  end = null,
  disabled = false,
  onClick,
  ...rest
}, ref) => {
  return (
    <ListItemButton
      ref={ref}
      disabled={disabled}
      onClick={onClick}
      sx={{ minHeight: 56 }}
      {...rest}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
      <ListItemText
        primary={label}
        secondary={value || null}
        slotProps={{ secondary: { noWrap: true } }}
        sx={{ minWidth: 0 }}
      />
      {end || <ChevronIcon color="action" />}
    </ListItemButton>
  );
});

DetailRow.displayName = 'DetailRow';

DetailRow.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  // What it is now, under its name; left out when nothing is chosen.
  value: PropTypes.string,
  // In place of the chevron: a switch, for a choice that is on or off.
  end: PropTypes.node,
  disabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

export default DetailRow;
