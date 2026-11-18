import React from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

import i18n from '../../languages';

// The question asked before something in a thread that cannot be taken
// back, or takes more with it than it seems: deleting a reply, hiding one,
// blocking its writer. `asking` is what useThread holds, or null while
// nothing is asked.
const ConfirmDialog = ({ asking = null, onCancel, onConfirm }) => {
  return (
    <Dialog
      open={Boolean(asking)}
      onClose={onCancel}
      aria-describedby="reply-confirm-message"
      fullWidth
      maxWidth="xs"
    >
      <DialogContent>
        <DialogContentText id="reply-confirm-message">
          {asking && asking.message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button fullWidth onClick={onCancel}>
          {i18n.t('actions:cancel')}
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={onConfirm}
        >
          {asking && asking.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ConfirmDialog.propTypes = {
  // What is asked, and the label of the button that says yes.
  asking: PropTypes.shape({
    message: PropTypes.string,
    confirm: PropTypes.string,
  }),
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default ConfirmDialog;
