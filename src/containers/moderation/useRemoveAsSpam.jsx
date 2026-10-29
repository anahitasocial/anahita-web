import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

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
const { isRemote } = utils.federation;

// "Remove as spam", for an administrator, on a person or a group (roadmap
// row 102): at once and for good, without the thirty days a deleted account
// waits, since "by the time we get to it, it might be too late" (the user,
// 2026-10-19). Asked once more, saying it cannot be undone.
//
//   const spam = useRemoveAsSpam(viewer, actor, onRemoved);
//   {spam.canRemove && <MenuItem onClick={() => { close(); spam.open(); }}>…}
//   {spam.dialog}     <- beside the menu, not inside it, as useReport's
//
// Never offered on oneself, nor on somebody who runs the site, nor on an
// account here longer than the site allows (SPAM_REMOVAL_MAX_DAYS, NodeInfo's
// spamRemovalMaxDays, 30 unless said): spam is new, and an older account is
// disabled or deleted, with the thirty days to bring it back (the user,
// 2026-10-19). The server refuses all three; where the account's age is not
// known here, its answer is said in words. Nor on a profile from another
// network, which the purge is not for: that is refused instead
// (useRefuseAccount).

const DAY = 24 * 60 * 60 * 1000;
const useRemoveAsSpam = (viewer, actor, onRemoved = null) => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const maxDays = useSelector((state) => {
    const { metadata } = state.app.nodeInfo || {};
    return Number(metadata && metadata.spamRemovalMaxDays) || 30;
  });
  const made = actor && actor.createdAt ? Date.parse(actor.createdAt) : NaN;
  const tooOld = !Number.isNaN(made) && Date.now() - made > maxDays * DAY;

  const kind = actor && String(actor.type || '');
  const canRemove = Boolean(viewer && actor && actor.id) &&
    isAdmin(viewer) &&
    actor.id !== viewer.id &&
    (kind.includes('person') || kind.includes('group')) &&
    !isRemote(actor) &&
    !(isPerson(actor) && isAdmin(actor)) &&
    !tooOld;

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
      .catch((error) => {
        const data = error && error.response && error.response.data;
        const refused = (data && data.refused) || [];
        const old = refused.some((each) => { return each.reason === 'too_old'; });
        dispatch(actions.app.alert.error(old ?
          i18n.t('abuseReports:spam.tooOld', { days: maxDays }) :
          i18n.t('abuseReports:spam.failed')));
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
