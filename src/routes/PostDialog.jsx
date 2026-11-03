import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import CloseIcon from '@mui/icons-material/Close';

import i18n from '../languages';
import InPostDialog from './postDialogContext';

// A post read over the list it was opened from, so that answering it does not
// lose somebody's place (the user, 2026-11-01). It has the post's own address:
// a link to it opens the page, and going back closes this. On a phone it
// fills the screen, and looks like the page. It is about answering the post:
// its places and what cites it are on its own page, not here.
const PostDialog = ({ children }) => {
  const navigate = useNavigate();
  const phone = useMediaQuery((theme) => { return theme.breakpoints.down('sm'); });

  const close = () => {
    navigate(-1);
  };

  return (
    <Dialog
      open
      fullWidth
      maxWidth="md"
      fullScreen={phone}
      scroll={phone ? 'paper' : 'body'}
      onClose={close}
      aria-label={i18n.t('replies:cTitle')}
      slotProps={{
        paper: { sx: { bgcolor: 'background.default', ...(phone ? {} : { maxWidth: 720 }) } },
      }}
    >
      <Box sx={{
        position: 'sticky', top: 0, zIndex: 1, height: 0, textAlign: 'right',
      }}
      >
        <IconButton
          onClick={close}
          aria-label={i18n.t('actions:close')}
          title={i18n.t('actions:close')}
          sx={{ m: 1, bgcolor: 'background.paper' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      {/* The dialog is the column here: the page's goes the full width. */}
      <Box sx={{
        p: phone ? 0 : 2,
        '& > .MuiGrid-container > .MuiGrid-root': { width: '100%' },
      }}
      >
        <InPostDialog.Provider value>
          {children}
        </InPostDialog.Provider>
      </Box>
    </Dialog>
  );
};

PostDialog.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PostDialog;
