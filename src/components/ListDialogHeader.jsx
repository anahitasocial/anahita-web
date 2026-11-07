import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';

import i18n from '../languages';

// The top of a dialog that is a list, such as a profile's followers: Close
// at the start, as the media library has it, the title on one line, and
// anything else at the end. Full screen on a mobile, such a dialog has no
// row of actions at its foot to take room from the list.
const ListDialogHeader = ({
  id,
  title,
  onClose,
  children = null,
}) => {
  return (
    <Toolbar sx={{ gap: 1, px: 1 }}>
      <IconButton edge="start" aria-label={i18n.t('commons:close')} onClick={onClose}>
        <CloseIcon />
      </IconButton>
      <Typography id={id} variant="h6" component="h2" noWrap sx={{ flexGrow: 1, minWidth: 0 }}>
        {title}
      </Typography>
      {children}
    </Toolbar>
  );
};

ListDialogHeader.propTypes = {
  // For the dialog's aria-labelledby.
  id: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
  // At the end of the row, such as the order of the list.
  children: PropTypes.node,
};

export default ListDialogHeader;
