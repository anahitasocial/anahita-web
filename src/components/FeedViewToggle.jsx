import React from 'react';
import PropTypes from 'prop-types';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import ColumnsIcon from '@mui/icons-material/ViewColumnOutlined';
import StreamIcon from '@mui/icons-material/ViewStreamOutlined';

import { sideWidth } from './SideTabs';
import i18n from '../languages';
import { COLUMNS, STREAM } from '../containers/feeds/useFeedView';

// The pair of buttons that chooses how a feed is laid out, the same width
// wherever they are.
const FeedViewToggle = ({ view, onChoose, sx = null }) => {
  return (
    <ToggleButtonGroup
      exclusive
      fullWidth
      size="small"
      value={view}
      aria-label={i18n.t('customFeeds:home.view')}
      onChange={(event, chosen) => {
        // Pressing the one that is on leaves it on.
        if (chosen) {
          onChoose(chosen);
        }
      }}
      sx={{ width: sideWidth, flexShrink: 0, ...sx }}
    >
      <ToggleButton
        value={STREAM}
        aria-label={i18n.t('customFeeds:home.viewStream')}
        title={i18n.t('customFeeds:home.viewStream')}
      >
        <StreamIcon fontSize="small" />
      </ToggleButton>
      <ToggleButton
        value={COLUMNS}
        aria-label={i18n.t('customFeeds:home.viewColumns')}
        title={i18n.t('customFeeds:home.viewColumns')}
      >
        <ColumnsIcon fontSize="small" />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

FeedViewToggle.propTypes = {
  view: PropTypes.string.isRequired,
  onChoose: PropTypes.func.isRequired,
  sx: PropTypes.object,
};

export default FeedViewToggle;
