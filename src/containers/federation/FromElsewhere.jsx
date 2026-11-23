import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import FediverseIcon from '@mui/icons-material/Hub';

import api from '../../api';
import i18n from '../../languages';
import useFediverseHandle from '../actors/Read/useFediverseHandle';

// The handle somebody gave last, in this browser alone, for next time.
const HANDLE_KEY = 'handle_elsewhere';

const rememberedHandle = () => {
  try {
    return window.localStorage.getItem(HANDLE_KEY) || '';
  } catch (e) {
    return '';
  }
};

// Somebody from another server, on a page here and not signed in (roadmap
// row 134): + Follow on a profile, or a line under a post, opening a dialog
// that asks their handle and sends them to their own server's page for it,
// where they follow, answer, like or repost. Shown only for a profile on
// the fediverse, and a post of one.
//
// `node` is what they act on; `profile`, whose it is, asked whether it is on
// the fediverse; `kind`, follow or post.
const FromElsewhere = ({ node, profile = null, kind }) => {
  const onFediverse = Boolean(useFediverseHandle(profile));
  const [open, setOpen] = useState(false);
  const [handle, setHandle] = useState(rememberedHandle);
  const [said, setSaid] = useState({ error: '', address: '' });
  const [waiting, setWaiting] = useState(false);

  if (!onFediverse || !node || !node.id) {
    return null;
  }

  const close = () => {
    setOpen(false);
    setSaid({ error: '', address: '' });
  };

  const go = (event) => {
    event.preventDefault();
    setWaiting(true);
    setSaid({ error: '', address: '' });
    api.federation.intent(handle.trim(), node.id).then((result) => {
      const { url, address } = result.data || {};
      try {
        window.localStorage.setItem(HANDLE_KEY, handle.trim());
      } catch (e) {
        // Not kept: asked again next time.
      }
      if (url) {
        window.location.assign(url);
        return;
      }
      setSaid({ error: 'none', address: address || '' });
      setWaiting(false);
    }).catch((failure) => {
      const code = failure.response && failure.response.data && failure.response.data.error;
      setSaid({
        error: {
          intent_handle: 'badHandle',
          intent_not_out: 'notOut',
        }[code] || 'failed',
        address: '',
      });
      setWaiting(false);
    });
  };

  const opener = kind === 'follow' ? (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={() => { setOpen(true); }}
    >
      {i18n.t('actions:follow')}
    </Button>
  ) : (
    // An action of the post's row, an icon as the others are, so that it
    // never wraps; its words in its label and its tooltip.
    <Tooltip title={i18n.t('federation:interaction.line')}>
      <IconButton
        aria-label={i18n.t('federation:interaction.line')}
        onClick={() => { setOpen(true); }}
      >
        <FediverseIcon />
      </IconButton>
    </Tooltip>
  );

  return (
    <>
      {opener}
      <Dialog open={open} onClose={close} fullWidth maxWidth="xs">
        <form onSubmit={go}>
          <DialogTitle>
            {i18n.t(kind === 'follow' ? 'federation:interaction.follow' : 'federation:interaction.post')}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              margin="dense"
              label={i18n.t('federation:interaction.handle')}
              placeholder="@name@mastodon.social"
              value={handle}
              onChange={(event) => { setHandle(event.target.value); }}
              error={Boolean(said.error) && said.error !== 'none'}
              helperText={said.error && said.error !== 'none' ?
                i18n.t(`federation:interaction.${said.error}`) :
                i18n.t('federation:interaction.handleHelp')}
              slotProps={{ htmlInput: { autoCapitalize: 'none', autoCorrect: 'off', spellCheck: false } }}
            />
            {said.error === 'none' &&
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1, overflowWrap: 'anywhere' }}>
                {i18n.t('federation:interaction.none')}
                {' '}
                <strong>{said.address}</strong>
              </Typography>}
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              {i18n.t('federation:interaction.here')}
              {' '}
              <Button size="small" onClick={() => { api.session.login(); }}>
                {i18n.t('actions:login')}
              </Button>
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button fullWidth onClick={close}>
              {i18n.t('actions:cancel')}
            </Button>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={waiting || !handle.trim()}
            >
              {i18n.t('federation:interaction.continue')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

FromElsewhere.propTypes = {
  node: PropTypes.shape({ id: PropTypes.number }).isRequired,
  profile: PropTypes.shape({ type: PropTypes.string, alias: PropTypes.string }),
  kind: PropTypes.oneOf(['follow', 'post']).isRequired,
};

export default FromElsewhere;
