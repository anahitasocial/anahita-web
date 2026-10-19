import React from 'react';
import PropTypes from 'prop-types';

import Chip from '@mui/material/Chip';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';

import deletion from '../utils/deletion';
import i18n from '../languages';

// "Scheduled for deletion · 27 days left", on a profile that was deleted and
// is not yet purged (the user, 2026-10-18). Its followers and administrators
// still find it, in their lists and on its page, and an administrator can
// restore it from its settings until then. Nothing when it is not scheduled.
const ScheduledDeletion = ({ actor, sx = {} }) => {
  const days = deletion.daysLeft(actor);
  if (days === null) {
    return null;
  }

  return (
    <Chip
      size="small"
      color="warning"
      variant="outlined"
      icon={<DeleteIcon />}
      label={i18n.t('actor:scheduledDeletion', { count: days })}
      // Wraps rather than cutting off the days left, which are the point,
      // in a narrow list on a phone.
      sx={{
        maxWidth: '100%',
        height: 'auto',
        py: 0.25,
        '& .MuiChip-label': { whiteSpace: 'normal' },
        ...sx,
      }}
    />
  );
};

ScheduledDeletion.propTypes = {
  actor: PropTypes.shape({
    deletedAt: PropTypes.string,
  }).isRequired,
  sx: PropTypes.objectOf(PropTypes.any),
};

export default ScheduledDeletion;
