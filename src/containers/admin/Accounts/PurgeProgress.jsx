import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

import i18n from '../../../languages';

// How far a purge has got, and how it ended. Fed by usePurgeProgress.
//
// A bar while accounts are still queued, then one line saying how many
// went, and the ones that could not be deleted by name with the reason
// the server gave.
const PurgeProgress = ({
  batch = null,
  finished,
  slow,
  failing,
}) => {
  const total = batch ? batch.total : 0;
  const done = batch ? batch.done : 0;
  const settled = batch ? batch.done + batch.failed : 0;
  const failed = batch ? (batch.items || []).filter((item) => {
    return item.status === 'failed';
  }) : [];

  return (
    <Box aria-live="polite">
      {!finished &&
        <>
          <Typography variant="body2" gutterBottom>
            {batch ?
              i18n.t('accounts:purge.progress', { done, total }) :
              i18n.t('accounts:purge.working')}
          </Typography>
          <LinearProgress
            variant={batch ? 'determinate' : 'indeterminate'}
            value={total > 0 ? (settled / total) * 100 : 0}
          />
        </>}

      {finished &&
        <Typography variant="body2">
          {i18n.t('accounts:purge.finished', { count: done })}
        </Typography>}

      {failed.length > 0 &&
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="error">
            {i18n.t('accounts:purge.failed', { count: failed.length })}
          </Typography>
          {failed.map((item) => {
            return (
              <Typography key={item.id} variant="body2" color="textSecondary">
                {`@${item.alias}`}
                {item.error ? ` — ${item.error}` : ''}
              </Typography>
            );
          })}
        </Box>}

      {slow &&
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          {i18n.t('accounts:purge.slow')}
        </Typography>}

      {failing &&
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          {i18n.t('accounts:purge.errors.progress')}
        </Typography>}
    </Box>
  );
};

PurgeProgress.propTypes = {
  batch: PropTypes.shape({
    total: PropTypes.number,
    queued: PropTypes.number,
    done: PropTypes.number,
    failed: PropTypes.number,
    items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      alias: PropTypes.string,
      status: PropTypes.string,
      error: PropTypes.string,
    })),
  }),
  finished: PropTypes.bool.isRequired,
  slow: PropTypes.bool.isRequired,
  failing: PropTypes.bool.isRequired,
};

export default PurgeProgress;
