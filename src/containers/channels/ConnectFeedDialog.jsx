import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

import CopyValue from '../../components/CopyValue';
import api from '../../api';
import i18n from '../../languages';

// What a refusal says, as syndication-service names it in `error`.
export const refusalOf = (failure) => {
  const response = failure && failure.response;
  if (response && response.status === 429) {
    return i18n.t('channels:connect.errors.tooMany');
  }
  const reason = response && response.data && response.data.error;
  const key = `channels:connect.errors.${reason}`;
  return reason && i18n.exists(key) ? i18n.t(key) : i18n.t('channels:connect.errors.generic');
};

// Connecting a website's feed to a channel, from its settings (anahita-
// services roadmap row 147, phase 4). Two steps in one dialog: the site's
// address, to find its feed; then the token, put in a DNS record or a
// file on the site, checked, and the feed connected. The one button at
// the right is the step's: Find, then Check, then Connect.
const ConnectFeedDialog = ({
  channel, open, onClose, onConnected,
}) => {
  const mobile = useMediaQuery((theme) => { return theme.breakpoints.down('sm'); });
  const [busy, setBusy] = useState(false);
  const [siteUrl, setSiteUrl] = useState('');
  const [siteError, setSiteError] = useState('');
  const [connection, setConnection] = useState(null);
  const [proved, setProved] = useState(false);
  const [status, setStatus] = useState('');

  const close = () => {
    if (busy) {
      return;
    }
    setSiteUrl('');
    setSiteError('');
    setConnection(null);
    setProved(false);
    setStatus('');
    onClose();
  };

  const find = () => {
    if (!siteUrl.trim()) {
      return;
    }
    setBusy(true);
    setSiteError('');
    api.channelConnect.start(siteUrl.trim()).then((result) => {
      setConnection(result.data);
      setStatus('');
    }).catch((failure) => {
      setSiteError(refusalOf(failure));
    }).finally(() => {
      setBusy(false);
    });
  };

  const check = () => {
    setBusy(true);
    api.channelConnect.check(connection).then((result) => {
      const { proved: yes, method } = result.data;
      setProved(Boolean(yes));
      setStatus(yes ?
        i18n.t('channels:connect.proof.proved', {
          method: i18n.t(`channels:connect.proof.methods.${method}`),
        }) :
        i18n.t('channels:connect.proof.notYet'));
    }).catch((failure) => {
      setStatus(refusalOf(failure));
    }).finally(() => {
      setBusy(false);
    });
  };

  const connect = () => {
    setBusy(true);
    api.channelConnect.feed.connect(channel, connection).then((result) => {
      setBusy(false);
      onConnected(result.data);
      close();
    }).catch((failure) => {
      setStatus(refusalOf(failure));
      setBusy(false);
    });
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (busy) {
      return;
    }
    if (!connection) {
      find();
    } else if (!proved) {
      check();
    } else {
      connect();
    }
  };

  let main = i18n.t('channels:connect.site.find');
  if (connection) {
    main = proved ? i18n.t('channels:feed.connect') : i18n.t('channels:connect.proof.check');
  }

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm" fullScreen={mobile}>
      <form onSubmit={onSubmit} noValidate>
        <DialogTitle>{i18n.t('channels:connect.cTitle')}</DialogTitle>
        <DialogContent>
          {!connection &&
            <>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {i18n.t('channels:connect.intro')}
              </Typography>
              <TextField
                variant="standard"
                label={i18n.t('channels:connect.site.label')}
                placeholder={i18n.t('channels:connect.site.placeholder')}
                value={siteUrl}
                onChange={(event) => { setSiteUrl(event.target.value); }}
                error={siteError !== ''}
                helperText={siteError || i18n.t('channels:connect.site.help')}
                disabled={busy}
                fullWidth
                autoFocus
                slotProps={{ htmlInput: { inputMode: 'url', maxLength: 2000 } }}
              />
            </>}
          {connection &&
            <>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {connection.feedTitle ?
                  i18n.t('channels:connect.found', { title: connection.feedTitle }) :
                  connection.feedUrl}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {i18n.t('channels:connect.proof.intro', { domain: connection.domain })}
              </Typography>
              <CopyValue label={i18n.t('channels:connect.proof.token')} value={connection.token} />
              <Typography variant="subtitle2">
                {i18n.t('channels:connect.proof.dnsTitle')}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {i18n.t('channels:connect.proof.dns')}
              </Typography>
              <CopyValue value={connection.recordName} />
              <Typography variant="subtitle2">
                {i18n.t('channels:connect.proof.fileTitle')}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {i18n.t('channels:connect.proof.file')}
              </Typography>
              <CopyValue value={connection.fileUrl} />
              {/* The line the answer is written on is kept, so the buttons
                  do not move when it is. */}
              <Typography variant="body2" sx={{ minHeight: 8 * 5 }} role="status">
                {status || (proved ? '' : ' ')}
                {proved && ` ${i18n.t('channels:connect.seen')}`}
              </Typography>
            </>}
        </DialogContent>
        <DialogActions>
          <Button fullWidth onClick={close} disabled={busy}>
            {i18n.t('actions:cancel')}
          </Button>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            disabled={busy || (!connection && !siteUrl.trim())}
          >
            {main}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

ConnectFeedDialog.propTypes = {
  channel: PropTypes.shape({ id: PropTypes.number.isRequired }).isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConnected: PropTypes.func.isRequired,
};

export default ConnectFeedDialog;
