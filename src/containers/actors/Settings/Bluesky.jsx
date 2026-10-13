import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import BlueskyIcon from '../../../components/BlueskyIcon';
import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';
import federation from '../../../utils/federation';
import { rememberOnBluesky } from '../../media/Composer/useOnFediverse';

// Where an account makes a password for an app, on Bluesky.
const APP_PASSWORDS = 'https://bsky.app/settings/app-passwords';

// The viewer's own Bluesky account, connected or not.
//
// Anybody here can follow accounts on Bluesky and read them. Somebody who
// connects the account they have there also answers: a like, a repost or a
// reply given here to something from Bluesky is made there too, as that
// account.
//
// It is connected with the handle and a password made for an app, which
// Bluesky lets an account make and take back without touching its own
// password. The card says to use one, and where to make it. The server
// keeps neither: it exchanges the password for a token and keeps that.
//
// Nothing is drawn on an installation that does not write to Bluesky.
const ActorsSettingsBluesky = ({ alertSuccess, alertError }) => {
  const [settings, setSettings] = useState(null);
  const [isAbsent, setIsAbsent] = useState(false);
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isImported, setIsImported] = useState(false);

  useEffect(() => {
    api.federation.blueskySettings().then((result) => {
      setSettings(result.data);
    }).catch((error) => {
      setIsAbsent(federation.isAbsent(error) || federation.reasonOf(error) === 'bluesky_writing_off');
    });
  }, []);

  if (isAbsent || !settings) {
    return null;
  }

  const took = (data) => {
    setSettings(data);
    // The reply box says whether a reply will reach Bluesky, from this.
    rememberOnBluesky(Boolean(data && data.connected && !data.broken));
  };

  const handleConnect = (event) => {
    event.preventDefault();
    setIsSaving(true);

    api.federation.connectBluesky({
      handle: handle.trim(),
      appPassword: password.trim(),
    }).then((result) => {
      took(result.data);
      setHandle('');
      setPassword('');
      alertSuccess(i18n.t('federation:bluesky.connected'));
    }).catch((error) => {
      const reason = federation.reasonOf(error);
      alertError(i18n.t(i18n.exists(`federation:bluesky.errors.${reason}`) ?
        `federation:bluesky.errors.${reason}` :
        'federation:bluesky.errors.failed'));
    }).finally(() => {
      setIsSaving(false);
    });
  };

  const handleDisconnect = () => {
    setIsLeaving(false);
    setIsSaving(true);

    api.federation.disconnectBluesky().then((result) => {
      took(result.data);
      alertSuccess(i18n.t('federation:bluesky.disconnected'));
    }).catch(() => {
      alertError(i18n.t('federation:bluesky.errors.failed'));
    }).finally(() => {
      setIsSaving(false);
    });
  };

  // Begun once: the server carries on with it after it has answered.
  const handleImport = () => {
    setIsSaving(true);

    api.federation.importBlueskyFollows().then(() => {
      setIsImported(true);
      alertSuccess(i18n.t('federation:bluesky.import.started'));
    }).catch((error) => {
      const reason = federation.reasonOf(error);
      alertError(i18n.t(i18n.exists(`federation:bluesky.errors.${reason}`) ?
        `federation:bluesky.errors.${reason}` :
        'federation:bluesky.errors.failed'));
    }).finally(() => {
      setIsSaving(false);
    });
  };

  const works = settings.connected && !settings.broken;

  return (
    <Card component={works ? 'div' : 'form'} onSubmit={works ? undefined : handleConnect}>
      <CardHeader
        avatar={<Avatar><BlueskyIcon /></Avatar>}
        title={i18n.t('federation:bluesky.title')}
      />
      <CardContent sx={{ pt: 0 }}>
        <Typography variant="body2" color="textSecondary">
          {i18n.t('federation:bluesky.help')}
        </Typography>

        {settings.connected &&
          <Typography variant="body2" sx={{ mt: 2 }}>
            {i18n.t('federation:bluesky.as')}
            {': '}
            <strong>{`@${settings.handle}`}</strong>
          </Typography>}

        {works &&
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            {i18n.t('federation:bluesky.import.help')}
          </Typography>}

        {settings.broken &&
          <Alert severity="warning" sx={{ mt: 2 }}>
            {i18n.t('federation:bluesky.broken')}
          </Alert>}

        {!works &&
          <>
            <TextField
              name="handle"
              label={i18n.t('federation:bluesky.handle.label')}
              helperText={i18n.t('federation:bluesky.handle.help')}
              value={handle}
              onChange={(event) => { setHandle(event.target.value); }}
              autoComplete="off"
              margin="normal"
              required
              fullWidth
            />
            <TextField
              name="app_password"
              type="password"
              label={i18n.t('federation:bluesky.password.label')}
              helperText={
                <>
                  {i18n.t('federation:bluesky.password.help')}
                  {' '}
                  <Link href={APP_PASSWORDS} target="_blank" rel="noopener noreferrer">
                    {i18n.t('federation:bluesky.password.where')}
                  </Link>
                </>
              }
              value={password}
              onChange={(event) => { setPassword(event.target.value); }}
              autoComplete="off"
              margin="normal"
              required
              fullWidth
            />
          </>}
      </CardContent>
      <CardActions>
        {works ?
          <>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              disabled={isSaving}
              onClick={() => { setIsLeaving(true); }}
            >
              {i18n.t('federation:bluesky.disconnect')}
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              disabled={isSaving || isImported}
              onClick={handleImport}
            >
              {i18n.t('federation:bluesky.import.action')}
            </Button>
          </> :
          <>
            {settings.connected &&
              <Button
                fullWidth
                variant="outlined"
                color="error"
                disabled={isSaving}
                onClick={() => { setIsLeaving(true); }}
              >
                {i18n.t('federation:bluesky.disconnect')}
              </Button>}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="secondary"
              disabled={isSaving || !handle.trim() || !password.trim()}
            >
              {i18n.t('federation:bluesky.connect')}
            </Button>
          </>}
      </CardActions>
      <Dialog
        open={isLeaving}
        onClose={() => { setIsLeaving(false); }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{i18n.t('federation:bluesky.leave.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {i18n.t('federation:bluesky.leave.body')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button fullWidth variant="outlined" onClick={() => { setIsLeaving(false); }}>
            {i18n.t('actions:cancel')}
          </Button>
          <Button fullWidth variant="contained" color="error" onClick={handleDisconnect}>
            {i18n.t('federation:bluesky.disconnect')}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

ActorsSettingsBluesky.propTypes = {
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertSuccess: (message) => {
      return dispatch(actions.app.alert.success(message));
    },
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(null, mapDispatchToProps)(ActorsSettingsBluesky);
