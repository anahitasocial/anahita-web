import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PinIcon from '@mui/icons-material/PushPin';

import i18n from '../languages';

// The line at the top of a pinned post's card, saying why it comes first.
const PinnedLabel = ({ show = false }) => {
  if (!show) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        pt: 1,
        color: 'text.secondary',
      }}
    >
      <PinIcon sx={{ fontSize: 16 }} />
      <Typography variant="caption">
        {i18n.t('media:pin.label')}
      </Typography>
    </Box>
  );
};

PinnedLabel.propTypes = {
  show: PropTypes.bool,
};

export default PinnedLabel;
