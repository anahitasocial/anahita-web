import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import i18n from '../../../languages';

// What can be recorded as having been done. "none" is not offered: that is
// what dismissing means.
const ACTIONS = ['deleted', 'disabled', 'archived', 'blocked', 'other'];

const NOTE_MAX = 2000;

// Closes a case, one of two ways: dismissed (nothing needed doing) or
// actioned (something was done, and here is what).
//
// It records a decision and nothing else. Whatever was done to the
// reported thing was done on its own page, before this.
//
// Rendered only while open, so it starts empty each time.
const ResolveDialog = ({
  status,
  submitting = false,
  onClose,
  onConfirm,
}) => {
  const [action, setAction] = useState(ACTIONS[0]);
  const [note, setNote] = useState('');

  const dismissing = status === 'dismissed';

  return (
    <Dialog open onClose={submitting ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {dismissing ?
          i18n.t('abuseReports:resolve.dismissTitle') :
          i18n.t('abuseReports:resolve.actionTitle')}
      </DialogTitle>
      <DialogContent>
        <DialogContentText variant="body2">
          {dismissing ?
            i18n.t('abuseReports:resolve.dismissDescription') :
            i18n.t('abuseReports:resolve.actionDescription')}
        </DialogContentText>
        {!dismissing &&
          <TextField
            select
            variant="outlined"
            margin="normal"
            name="action"
            label={i18n.t('abuseReports:resolve.whatWasDone')}
            value={action}
            onChange={(event) => {
              setAction(event.target.value);
            }}
            disabled={submitting}
            fullWidth
          >
            {ACTIONS.map((value) => {
              return (
                <MenuItem key={value} value={value}>
                  {i18n.t(`abuseReports:actions.${value}`)}
                </MenuItem>
              );
            })}
          </TextField>}
        <TextField
          variant="outlined"
          margin="normal"
          name="note"
          label={i18n.t('abuseReports:resolve.note')}
          value={note}
          onChange={(event) => {
            setNote(event.target.value.slice(0, NOTE_MAX));
          }}
          disabled={submitting}
          fullWidth
          multiline
          minRows={2}
        />
      </DialogContent>
      <DialogActions>
        <Button fullWidth onClick={onClose} disabled={submitting}>
          {i18n.t('actions:cancel')}
        </Button>
        <Button
          fullWidth
          color="primary"
          variant="contained"
          disabled={submitting}
          onClick={() => {
            onConfirm({
              status,
              action: dismissing ? 'none' : action,
              note: note.trim(),
            });
          }}
        >
          {dismissing ?
            i18n.t('abuseReports:resolve.confirmDismiss') :
            i18n.t('abuseReports:resolve.confirmAction')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ResolveDialog.propTypes = {
  status: PropTypes.oneOf(['dismissed', 'actioned']).isRequired,
  submitting: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default ResolveDialog;
