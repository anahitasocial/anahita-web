import React from 'react';
import PropTypes from 'prop-types';

import Typography from '@mui/material/Typography';

import i18n from '../languages';

const WINDOWS = ['daily', 'weekly', 'monthly', 'yearly'];

// Over what span of time a trending list is, above it: the installation's
// own, or wider where that held too few (anahita-libs/trending). Or, with
// nothing at all, that nothing has trended in a year.
const TrendingWindow = ({ window = '', empty = false }) => {
  if (!WINDOWS.includes(window)) {
    return null;
  }
  return (
    <Typography variant="body2" color="textSecondary" sx={{ px: 2, py: 1 }}>
      {empty ? i18n.t('commons:trending.none') : i18n.t(`commons:trending.${window}`)}
    </Typography>
  );
};

TrendingWindow.propTypes = {
  // `daily`, `weekly`, `monthly` or `yearly`, as the answer says.
  window: PropTypes.string,
  // Nothing trended even over the widest window.
  empty: PropTypes.bool,
};

export default TrendingWindow;
