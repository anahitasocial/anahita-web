import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import federation from '../../utils/federation';
import utils from '../../utils';

const { isAdmin } = utils.node;

// Whether the viewer may refuse this account for the whole site: an
// administrator, on a person from another network, the fediverse or
// Bluesky (anahita-services' docs/plans/refused-accounts.md). A profile
// made here is moderated otherwise: disabled, deleted, removed as spam.
export const canRefuseAccount = (viewer, actor) => {
  const kind = String((actor && actor.type) || '');
  return Boolean(viewer && actor && actor.id) &&
    isAdmin(viewer) &&
    federation.isRemote(actor) &&
    kind.includes('.person.');
};

// "Refuse on this site", for an administrator, on a profile from another
// network: nothing it sends is taken, nothing is sent to it, it cannot be
// followed, and it is removed with what is here of it. Asked once more,
// with a reason for the administrators who come after.
//
//   const refuse = useRefuseAccount(viewer, actor, onRefused);
//   {refuse.canRefuse && <MenuItem onClick={() => { close(); refuse.open(); }}>…}
//   {refuse.dialog}     <- beside the menu, not inside it, as useReport's
//
// `onRefused` is told once it is done: the profile is gone from here.
const useRefuseAccount = (viewer, actor, onRefused = null) => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [reason, setReason] = useState('');

  const canRefuse = canRefuseAccount(viewer, actor);
  const name = actor ? (actor.name || actor.alias) : '';

  const close = () => {
    setIsOpen(false);
    setReason('');
  };

  const refuse = () => {
    setSending(true);
    return api.federation.refuseAccount({ actorId: actor.id, reason: reason.trim() })
      .then(() => {
        close();
        dispatch(actions.app.alert.success(i18n.t('abuseReports:refuse.refused', { name })));
        if (onRefused) {
          onRefused();
        }
        return true;
      })
      .catch((error) => {
        const why = federation.reasonOf(error);
        dispatch(actions.app.alert.error(i18n.t(`abuseReports:refuse.errors.${why}`, {
          defaultValue: i18n.t('abuseReports:refuse.failed'),
        })));
        return false;
      })
      .finally(() => {
        setSending(false);
      });
  };

  return {
    canRefuse,
    open: () => {
      setIsOpen(true);
    },
    dialog: isOpen && canRefuse ?
      <Dialog
        open
        onClose={sending ? undefined : close}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{i18n.t('abuseReports:refuse.confirmTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {i18n.t('abuseReports:refuse.confirmText', { name })}
          </DialogContentText>
          <TextField
            name="reason"
            label={i18n.t('abuseReports:refuse.reason.label')}
            helperText={i18n.t('abuseReports:refuse.reason.help')}
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
            }}
            slotProps={{ htmlInput: { maxLength: 500 } }}
            autoComplete="off"
            margin="normal"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button fullWidth disabled={sending} onClick={close}>
            {i18n.t('actions:cancel')}
          </Button>
          <Button fullWidth color="error" variant="contained" disabled={sending} onClick={refuse}>
            {i18n.t('abuseReports:refuse.confirm')}
          </Button>
        </DialogActions>
      </Dialog> :
      null,
  };
};

export default useRefuseAccount;
