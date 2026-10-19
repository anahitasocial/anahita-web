import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import utils from '../../utils';

const { isAdmin, isPerson } = utils.node;

// "Remove as spam", for an administrator, on a person or a group (roadmap
// row 102): at once and for good, without the thirty days a deleted account
// waits, since "by the time we get to it, it might be too late" (the user,
// 2026-10-19). Asked once more, saying it cannot be undone.
//
//   const spam = useRemoveAsSpam(viewer, actor, onRemoved);
//   {spam.canRemove && <MenuItem onClick={() => { close(); spam.open(); }}>…}
//   {spam.dialog}     <- beside the menu, not inside it, as useReport's
//
// Never offered on oneself, nor on somebody who runs the site: the server
// refuses both.
const useRemoveAsSpam = (viewer, actor, onRemoved = null) => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const kind = actor && String(actor.type || '');
  const canRemove = Boolean(viewer && actor && actor.id) &&
    isAdmin(viewer) &&
    actor.id !== viewer.id &&
    (kind.includes('person') || kind.includes('group')) &&
    !(isPerson(actor) && isAdmin(actor));

  const remove = () => {
    setSending(true);
    api.spam.remove(actor)
      .then(() => {
        setIsOpen(false);
        dispatch(actions.app.alert.success(i18n.t('abuseReports:spam.removed')));
        if (onRemoved) {
          onRemoved();
        }
      })
      .catch(() => {
        dispatch(actions.app.alert.error(i18n.t('abuseReports:spam.failed')));
      })
      .finally(() => {
        setSending(false);
      });
  };

  return {
    canRemove,
    open: () => {
      setIsOpen(true);
    },
    dialog: isOpen && canRemove ?
      <Dialog
        open
        onClose={sending ? undefined : () => { setIsOpen(false); }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{i18n.t('abuseReports:spam.confirmTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {i18n.t('abuseReports:spam.confirmText', { name: actor.name || actor.alias })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button fullWidth disabled={sending} onClick={() => { setIsOpen(false); }}>
            {i18n.t('actions:cancel')}
          </Button>
          <Button fullWidth color="error" variant="contained" disabled={sending} onClick={remove}>
            {i18n.t('abuseReports:spam.confirm')}
          </Button>
        </DialogActions>
      </Dialog> :
      null,
  };
};

export default useRemoveAsSpam;
