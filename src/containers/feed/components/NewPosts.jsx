import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import NewIcon from '@mui/icons-material/ArrowUpward';

import i18n from '../../../languages';

// Says that there are new posts above, to somebody reading further down,
// and takes them there. It stays in sight as the page is scrolled. Nothing
// is drawn when nothing waits.
const NewPosts = ({ count, onShow }) => {
  if (!count) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 80,
        zIndex: 2,
        height: 0,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Button
        variant="contained"
        color="secondary"
        size="small"
        startIcon={<NewIcon />}
        onClick={onShow}
        sx={{ height: 32, borderRadius: 16, whiteSpace: 'nowrap' }}
      >
        {i18n.t('feed:newPosts', { count })}
      </Button>
    </Box>
  );
};

NewPosts.propTypes = {
  count: PropTypes.number.isRequired,
  onShow: PropTypes.func.isRequired,
};

export default NewPosts;
