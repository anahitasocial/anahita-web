import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import StepUp from '../../auth/StepUp';
import api from '../../../api';
import i18n from '../../../languages';

import PurgeProgress from './PurgeProgress';
import usePurgeProgress from './usePurgeProgress';

// Confirms removing the selected accounts for good, does it, and shows
// how far it has got.
//
// Three things stand between the button on the list and the request:
// what will go, spelled out; the number of accounts, typed; and a proof
// of who is asking. The typed phrase is the count ("PURGE 37"), not a
// word like "delete", so somebody who selected more than they meant to
// meets the number before anything happens. The server checks the same
// phrase against the list it is sent.
//
// The proof comes before the request, not after a refusal: every purge
// is refused without one, so sending it first would only put a refused
// request on the wire.
//
// Once the request is accepted the dialog cannot be dismissed by
// clicking outside it, but it can be closed. The purge carries on
// whether or not anybody is watching.
const PurgeDialog = ({
  open,
  kind,
  accounts,
  onClose,
}) => {
  const [confirmation, setConfirmation] = useState('');
  const [stepUpOpen, setStepUpOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [batchId, setBatchId] = useState('');
  const [nothingToDo, setNothingToDo] = useState(false);
  const [refused, setRefused] = useState([]);
  const [error, setError] = useState('');

  const namespace = api.accounts.NAMESPACES[kind];
  const progress = usePurgeProgress(namespace, batchId);

  // A fresh dialog each time it opens: nothing typed for one selection
  // is carried onto the next.
  useEffect(() => {
    if (open) {
      setConfirmation('');
      setStepUpOpen(false);
      setSubmitting(false);
      setBatchId('');
      setNothingToDo(false);
      setRefused([]);
      setError('');
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const count = accounts.length;
  const phrase = `PURGE ${count}`;
  const isGroup = kind === 'group';
  const written = accounts.reduce((sum, account) => {
    return sum + (account.contentCount || 0);
  }, 0);

  const started = Boolean(batchId);
  const over = nothingToDo || (started && progress.finished);
  const confirmed = confirmation.trim() === phrase;

  const nameOf = (id) => {
    const account = accounts.find((item) => {
      return item.id === id;
    });
    return account ? `@${account.alias}` : `#${id}`;
  };

  const submit = () => {
    setSubmitting(true);
    setError('');
    setRefused([]);

    const ids = accounts.map((account) => {
      return account.id;
    });

    return api.accounts.purgeBatch(kind, ids)
      .then(({ status, data }) => {
        // 200: every one of them was already gone, or already queued.
        if (status === 200 || !data.batchId) {
          setNothingToDo(true);
          return;
        }

        setBatchId(data.batchId);
      })
      .catch((err) => {
        const status = err && err.response && err.response.status;
        const body = (err && err.response && err.response.data) || {};

        // The proof ran out, or was spent, between the dialog and here.
        if (status === 403 && body.error === 'step_up_required') {
          setStepUpOpen(true);
          return;
        }

        if (status === 403) {
          setError(i18n.t('accounts:purge.errors.forbidden'));
          return;
        }

        // Nothing was touched. Say which accounts stopped it and why, so
        // the selection can be put right.
        if (status === 409 && Array.isArray(body.refused)) {
          setRefused(body.refused);
          return;
        }

        setError(i18n.t('accounts:purge.errors.generic'));
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const close = () => {
    // What the list needs to know: whether anything was removed.
    onClose(started || nothingToDo);
  };

  return (
    <>
      <Dialog
        open
        // Before the request, clicking away cancels. After it, the result
        // is on screen and has to be closed on purpose.
        onClose={started ? undefined : close}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {i18n.t('accounts:purge.title', { count })}
        </DialogTitle>

        {!started && !nothingToDo &&
          <DialogContent>
            <DialogContentText variant="body2" color="error" gutterBottom>
              {i18n.t('accounts:purge.permanent')}
            </DialogContentText>
            <DialogContentText variant="body2" gutterBottom>
              {i18n.t(isGroup ? 'accounts:purge.whatGoesGroup' : 'accounts:purge.whatGoes')}
            </DialogContentText>
            <DialogContentText variant="body2" gutterBottom>
              {i18n.t(isGroup ? 'accounts:purge.writtenGroup' : 'accounts:purge.written', {
                count: written,
              })}
              {' '}
              {i18n.t('accounts:purge.whatStays')}
            </DialogContentText>

            {refused.length > 0 &&
              <>
                <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                  {i18n.t('accounts:purge.refused')}
                </Typography>
                {refused.map((item) => {
                  return (
                    <Typography key={item.id} variant="body2" color="textSecondary">
                      {`${nameOf(item.id)} ${i18n.t(`accounts:purge.reasons.${item.reason}`, {
                        defaultValue: item.reason,
                      })}`}
                    </Typography>
                  );
                })}
              </>}

            {error &&
              <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>}

            <TextField
              variant="standard"
              name="confirmation"
              label={i18n.t('accounts:purge.confirmLabel', { phrase })}
              value={confirmation}
              onChange={(event) => {
                setConfirmation(event.target.value);
              }}
              autoComplete="off"
              margin="normal"
              fullWidth
            />
          </DialogContent>}

        {nothingToDo &&
          <DialogContent>
            <DialogContentText variant="body2">
              {i18n.t('accounts:purge.nothingToDo')}
            </DialogContentText>
          </DialogContent>}

        {started &&
          <DialogContent>
            <PurgeProgress
              batch={progress.batch}
              finished={progress.finished}
              slow={progress.slow}
              failing={progress.failing}
            />
          </DialogContent>}

        <DialogActions>
          <Button onClick={close}>
            {started || nothingToDo ?
              i18n.t('accounts:purge.close') :
              i18n.t('accounts:purge.cancel')}
          </Button>
          {!over && !started &&
            <Button
              color="secondary"
              variant="contained"
              disabled={!confirmed || submitting}
              onClick={() => {
                setStepUpOpen(true);
              }}
            >
              {submitting ?
                i18n.t('accounts:purge.working') :
                i18n.t('accounts:purge.action')}
            </Button>}
        </DialogActions>
      </Dialog>
      <StepUp
        open={stepUpOpen}
        onVerified={() => {
          setStepUpOpen(false);
          submit();
        }}
        onCancel={() => {
          setStepUpOpen(false);
        }}
      />
    </>
  );
};

PurgeDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  kind: PropTypes.oneOf(['person', 'group']).isRequired,
  accounts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    alias: PropTypes.string,
    contentCount: PropTypes.number,
  })).isRequired,
  // Called with whether a purge was asked for, so the list knows to
  // read itself again.
  onClose: PropTypes.func.isRequired,
};

export default PurgeDialog;
