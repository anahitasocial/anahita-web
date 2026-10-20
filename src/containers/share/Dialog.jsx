import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import BlueskyIcon from '@mui/icons-material/CloudOutlined';
import CopyIcon from '@mui/icons-material/ContentCopyOutlined';
import DeviceIcon from '@mui/icons-material/IosShareOutlined';
import EmailIcon from '@mui/icons-material/EmailOutlined';
import MastodonIcon from '@mui/icons-material/AlternateEmailOutlined';

import actions from '../../actions';
import i18n from '../../languages';
import share from '../../utils/share';
import visitor from '../../utils/visitor';

// The share dialog: one for the whole app, opened by any share button or
// menu item through `utils/share.open`.
//
// It shows the link and the ways to send it: copy it, email it, post it on
// Mastodon or Bluesky, or hand it to the device's own share sheet where
// there is one, which has every app the person uses. Something that is not
// public, or anything on a members-only site, is offered to copy and
// nothing else, with a note saying who can open it.
//
// Nothing is sent to the server and nothing is counted.
const ShareDialog = ({
  readAccess,
  alertSuccess,
}) => {
  // What is being shared: { path, title, text, access }. Null when closed.
  const [what, setWhat] = useState(null);
  const [server, setServer] = useState('');
  const [isAskingServer, setIsAskingServer] = useState(false);

  useEffect(() => {
    return share.listen((asked) => {
      setServer(share.rememberedServer());
      setIsAskingServer(false);
      setWhat(asked);
    });
  }, []);

  if (!what) {
    return null;
  }

  const close = () => {
    setWhat(null);
  };

  const url = share.linkOf(what.path);
  const link = { url, title: what.title, text: what.text };
  const isOpen = share.isOpen(what.access, readAccess);
  const canCopy = Boolean(navigator.clipboard && navigator.clipboard.writeText);
  const hasDeviceSheet = typeof navigator.share === 'function';
  const mastodon = share.mastodonURL(link, server);

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      alertSuccess(i18n.t('share:copied'));
      close();
    }).catch(() => {
      // The link is in the field above, to be copied by hand.
    });
  };

  const handleDevice = () => {
    navigator.share({ title: share.messageOf(link), url }).then(close).catch(() => {
      // Dismissed, which is not an error.
    });
  };

  const handleMastodon = () => {
    if (!mastodon) {
      setIsAskingServer(true);
      return;
    }

    share.rememberServer(server);
    window.open(mastodon, '_blank', 'noopener,noreferrer');
    close();
  };

  return (
    <Dialog
      open
      fullWidth
      maxWidth="xs"
      onClose={close}
      aria-labelledby="share-dialog-title"
    >
      <DialogTitle id="share-dialog-title">
        {i18n.t('share:title')}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label={i18n.t('share:link')}
            value={url}
            onFocus={(event) => {
              event.target.select();
            }}
            slotProps={{ htmlInput: { readOnly: true } }}
            sx={{ mt: 1 }}
          />
          {!isOpen &&
            <Typography variant="body2" color="textSecondary">
              {i18n.t(readAccess === 'registered' ? 'share:membersOnly' : 'share:notPublic')}
            </Typography>}
        </Stack>
        <List sx={{ mx: -2 }}>
          {canCopy &&
            <ListItemButton onClick={handleCopy}>
              <ListItemIcon>
                <CopyIcon />
              </ListItemIcon>
              <ListItemText primary={i18n.t('share:copy')} />
            </ListItemButton>}
          {isOpen &&
            <>
              <ListItemButton component="a" href={share.emailURL(link)} onClick={close}>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText primary={i18n.t('share:email')} />
              </ListItemButton>
              <ListItemButton onClick={handleMastodon}>
                <ListItemIcon>
                  <MastodonIcon />
                </ListItemIcon>
                <ListItemText
                  primary={i18n.t('share:mastodon')}
                  secondary={server && !isAskingServer ? server : undefined}
                />
              </ListItemButton>
              {isAskingServer &&
                <Stack direction="row" spacing={1} sx={{ px: 2, pb: 1 }}>
                  <TextField
                    fullWidth
                    autoFocus
                    size="small"
                    label={i18n.t('share:mastodonServer')}
                    placeholder="mastodon.social"
                    value={server}
                    onChange={(event) => {
                      setServer(event.target.value);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && mastodon) {
                        handleMastodon();
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    disabled={!mastodon}
                    onClick={handleMastodon}
                  >
                    {i18n.t('share:open')}
                  </Button>
                </Stack>}
              <ListItemButton
                component="a"
                href={share.blueskyURL(link)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
              >
                <ListItemIcon>
                  <BlueskyIcon />
                </ListItemIcon>
                <ListItemText primary={i18n.t('share:bluesky')} />
              </ListItemButton>
              {hasDeviceSheet &&
                <ListItemButton onClick={handleDevice}>
                  <ListItemIcon>
                    <DeviceIcon />
                  </ListItemIcon>
                  <ListItemText primary={i18n.t('share:device')} />
                </ListItemButton>}
            </>}
        </List>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={close}>
          {i18n.t('share:close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ShareDialog.propTypes = {
  // What a visitor may read on this site: public, preview or registered.
  readAccess: PropTypes.string.isRequired,
  alertSuccess: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    readAccess: visitor.readAccessOf(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertSuccess: (message) => {
      return dispatch(actions.app.alert.success(message));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ShareDialog);
