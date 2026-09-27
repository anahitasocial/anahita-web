import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const DialogAlert = ({
  title,
  content,
  confirm = 'Confirm',
  dismiss = 'Dismiss',
  handleConfirm,
  handleDismiss,
  open = false,
}) => {
  return (
    <Dialog
      open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth
    >
      <DialogTitle id="alert-dialog-title">
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleDismiss}
          fullWidth
        >
          {dismiss}
        </Button>
        <Button
          onClick={handleConfirm}
          color="primary"
          autoFocus
          fullWidth
          variant="contained"
        >
          {confirm}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DialogAlert.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  confirm: PropTypes.string,
  dismiss: PropTypes.string,
  handleConfirm: PropTypes.func.isRequired,
  handleDismiss: PropTypes.func.isRequired,
  open: PropTypes.bool,
};

export default DialogAlert;
