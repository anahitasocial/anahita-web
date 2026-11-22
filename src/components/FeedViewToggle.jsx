import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

import ColumnsIcon from '@mui/icons-material/ViewColumnOutlined';
import StreamIcon from '@mui/icons-material/ViewStreamOutlined';

import i18n from '../languages';
import { COLUMNS, STREAM } from '../containers/feeds/useFeedView';

// The pair of buttons that chooses how a feed is laid out: two icons, the
// chosen one in the text's colour and the other quieter, with no outline.
// Outlined, beside the tabs' own line, they were one line too many (the
// user, 2026-11-21).
const FeedViewToggle = ({ view, onChoose, sx = null }) => {
  const choice = (value, label, Icon) => {
    const chosen = view === value;
    return (
      <IconButton
        size="small"
        aria-label={label}
        title={label}
        aria-pressed={chosen}
        onClick={() => {
          // Pressing the one that is on leaves it on.
          if (!chosen) {
            onChoose(value);
          }
        }}
        sx={{ color: chosen ? 'text.primary' : 'text.disabled' }}
      >
        <Icon fontSize="small" />
      </IconButton>
    );
  };

  return (
    <Box
      role="group"
      aria-label={i18n.t('customFeeds:home.view')}
      sx={{
        display: 'flex', gap: 1, flexShrink: 0, ...sx,
      }}
    >
      {choice(STREAM, i18n.t('customFeeds:home.viewStream'), StreamIcon)}
      {choice(COLUMNS, i18n.t('customFeeds:home.viewColumns'), ColumnsIcon)}
    </Box>
  );
};

FeedViewToggle.propTypes = {
  view: PropTypes.string.isRequired,
  onChoose: PropTypes.func.isRequired,
  sx: PropTypes.object,
};

export default FeedViewToggle;
