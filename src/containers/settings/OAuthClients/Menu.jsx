import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import makeStyles from '@mui/styles/makeStyles';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RotateIcon from '@mui/icons-material/VpnKey';

import i18n from '../../../languages';
import OAuthClientType from '../../../proptypes/OAuthClient';

const useStyles = makeStyles((theme) => {
  return {
    destructive: {
      color: theme.palette.error.main,
    },
  };
});

// Row actions for one client.
//
// The two destructive ones confirm, and they are confirmed by dialogs
// rendered as SIBLINGS of the Menu rather than inside it. A dialog
// nested in the menu's popover unmounts the moment the menu closes, so
// the menu has to be left open underneath it — which is what the screen
// this replaces did. Closing the menu first and owning the dialog here
// costs a little state and behaves the way a menu should.
//
// Rotate is a confirmation rather than a plain click because it revokes
// every outstanding refresh token for the client: anything already
// deployed with the old secret stops being able to refresh, and there
// is no undo.
const OAuthClientMenu = ({
  client,
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete,
  onRotate,
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirming, setConfirming] = useState(null);

  const closeMenu = () => {
    setAnchorEl(null);
  };

  // Rotation is offered only where there is a secret to rotate. The
  // server answers 400 for a public client, whose identity rests on
  // PKCE rather than on a credential.
  const canRotate = canEdit && client.confidential;

  if (!canEdit && !canDelete) {
    return null;
  }

  const confirmations = {
    delete: {
      title: i18n.t('settings:oauthClients.confirmDelete.cTitle'),
      message: i18n.t('settings:oauthClients.confirmDelete.cDescription', {
        name: client.name,
      }),
      confirm: i18n.t('settings:oauthClients.actions.delete'),
      onConfirm: () => {
        return onDelete(client);
      },
    },
    rotate: {
      title: i18n.t('settings:oauthClients.confirmRotate.cTitle'),
      message: i18n.t('settings:oauthClients.confirmRotate.cDescription', {
        name: client.name,
      }),
      confirm: i18n.t('settings:oauthClients.actions.rotate'),
      onConfirm: () => {
        return onRotate(client);
      },
    },
  };

  const pending = confirming ? confirmations[confirming] : null;

  return (
    <>
      <IconButton
        size="small"
        aria-label={i18n.t('settings:oauthClients.actions.menu')}
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
      >
        {canEdit &&
          <MenuItem
            onClick={() => {
              closeMenu();
              onEdit(client);
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={i18n.t('settings:oauthClients.actions.edit')} />
          </MenuItem>}
        {canRotate &&
          <MenuItem
            onClick={() => {
              closeMenu();
              setConfirming('rotate');
            }}
          >
            <ListItemIcon>
              <RotateIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={i18n.t('settings:oauthClients.actions.rotate')} />
          </MenuItem>}
        {canDelete &&
          <MenuItem
            className={classes.destructive}
            onClick={() => {
              closeMenu();
              setConfirming('delete');
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" className={classes.destructive} />
            </ListItemIcon>
            <ListItemText primary={i18n.t('settings:oauthClients.actions.delete')} />
          </MenuItem>}
      </Menu>

      <Dialog
        open={Boolean(pending)}
        onClose={() => {
          setConfirming(null);
        }}
        fullWidth
        maxWidth="xs"
      >
        {pending &&
          <>
            <DialogTitle>{pending.title}</DialogTitle>
            <DialogContent>
              <DialogContentText variant="body2">
                {pending.message}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                fullWidth
                onClick={() => {
                  setConfirming(null);
                }}
              >
                {i18n.t('commons:dismiss')}
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => {
                  setConfirming(null);
                  pending.onConfirm();
                }}
              >
                {pending.confirm}
              </Button>
            </DialogActions>
          </>}
      </Dialog>
    </>
  );
};

OAuthClientMenu.propTypes = {
  client: OAuthClientType.isRequired,
  canEdit: PropTypes.bool,
  canDelete: PropTypes.bool,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onRotate: PropTypes.func.isRequired,
};

export default OAuthClientMenu;
