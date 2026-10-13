import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';
import federation from '../../../utils/federation';
import { rememberOnFediverse } from '../../media/Composer/useOnFediverse';

// Whether people on other servers of the fediverse can find and follow the
// viewer, and are sent their public notes.
//
// Off until they turn it on, and theirs alone to turn on: what is sent to
// another server cannot be called back, which the card says. Only somebody
// whose profile everybody can see can turn it on; when they cannot, the
// switch is there, off and disabled, with the reason beside it.
//
// Turned on as it is switched. Turned off after asking: other servers are
// told to remove the person, and in the lab the one tried did not take them
// back when they turned it on again. On an installation with no fediverse service
// nothing is drawn.
const ActorsSettingsFediverse = ({ alertSuccess, alertError }) => {
  const [settings, setSettings] = useState(null);
  const [isAbsent, setIsAbsent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    api.federation.settings().then((result) => {
      setSettings(result.data);
    }).catch((error) => {
      setIsAbsent(federation.isAbsent(error));
    });
  }, []);

  if (isAbsent || !settings) {
    return null;
  }

  const save = (enabled) => {
    setIsSaving(true);
    setIsLeaving(false);
    api.federation.setEnabled(enabled).then((result) => {
      setSettings(result.data);
      // The composer says whether a note will be shared, from this.
      rememberOnFediverse(result.data && result.data.enabled);
      alertSuccess(i18n.t('federation:settings.saved'));
    }).catch(() => {
      alertError(i18n.t('federation:settings.notSaved'));
    }).finally(() => {
      setIsSaving(false);
    });
  };

  // Turning it on is done at once. Turning it off is asked about first: it
  // tells every server that knows them to remove them, and most will not
  // take the same person back.
  const handleChange = (event) => {
    if (event.target.checked) {
      save(true);
    } else {
      setIsLeaving(true);
    }
  };

  // Turning it off is always allowed. Turning it on, only when they could
  // be on the fediverse.
  const canSwitch = settings.enabled || settings.available;

  return (
    <Card>
      <CardHeader title={i18n.t('federation:settings.title')} />
      <CardContent sx={{ pt: 0 }}>
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(settings.enabled)}
              disabled={isSaving || !canSwitch}
              onChange={handleChange}
            />
          }
          label={i18n.t('federation:settings.enable')}
        />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {i18n.t('federation:settings.help')}
        </Typography>
        {settings.handle &&
          <Typography variant="body2" sx={{ mt: 2 }}>
            {i18n.t('federation:settings.handle')}
            {': '}
            <strong>{`@${settings.handle}`}</strong>
          </Typography>}
        {!settings.available && settings.reason &&
          <Alert severity="info" sx={{ mt: 2 }}>
            {i18n.t(`federation:settings.unavailable.${settings.reason}`)}
          </Alert>}
        {settings.available &&
          <Alert severity="warning" sx={{ mt: 2 }}>
            {i18n.t('federation:settings.warning')}
          </Alert>}
        {settings.enabled &&
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            {i18n.t('federation:settings.leavesWhenPrivate')}
          </Typography>}
      </CardContent>
      <Dialog
        open={isLeaving}
        onClose={() => { setIsLeaving(false); }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{i18n.t('federation:settings.leave.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {i18n.t('federation:settings.leave.body')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button fullWidth onClick={() => { setIsLeaving(false); }}>
            {i18n.t('actions:cancel')}
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="error"
            onClick={() => { save(false); }}
          >
            {i18n.t('federation:settings.leave.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

ActorsSettingsFediverse.propTypes = {
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

export default connect(null, mapDispatchToProps)(ActorsSettingsFediverse);
