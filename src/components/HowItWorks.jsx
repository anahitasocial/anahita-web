import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import InfoIcon from '@mui/icons-material/InfoOutlined';

import i18n from '../languages';

// The (i) beside a dialog's title that opens how what it adjusts works
// (the user, 2026-10-17: in the settings of suggestions and of search).
const HowItWorksButton = ({ open, onToggle, controls }) => {
  const label = i18n.t('commons:howItWorks');
  return (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        aria-expanded={open}
        aria-controls={controls}
        color={open ? 'primary' : 'default'}
        onClick={onToggle}
        edge="end"
      >
        <InfoIcon />
      </IconButton>
    </Tooltip>
  );
};

HowItWorksButton.propTypes = {
  open: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  // The id of the panel it opens.
  controls: PropTypes.string.isRequired,
};

// How it works, in a few plain sentences, at the top of the dialog while
// its button is on. It opens only when asked, so nothing moves otherwise.
const HowItWorksPanel = ({ open, id, points }) => {
  return (
    <Collapse in={open} id={id}>
      <Box
        sx={{
          mb: 2, p: 2, borderRadius: 1, bgcolor: 'action.hover',
        }}
      >
        {points.map((point) => {
          return (
            <Typography key={point} variant="body2" sx={{ '&:not(:last-of-type)': { mb: 1 } }}>
              {point}
            </Typography>
          );
        })}
      </Box>
    </Collapse>
  );
};

HowItWorksPanel.propTypes = {
  open: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  // What to say, a paragraph each.
  points: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export { HowItWorksButton, HowItWorksPanel };
