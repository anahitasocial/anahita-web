import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import FediverseIcon from '@mui/icons-material/Hub';

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
//
// A website (`profile`) is the same, off until one of its administrators
// turns it on, and said in a website's words.
const ActorsSettingsFediverse = ({ profile = null, alertSuccess, alertError }) => {
  const [settings, setSettings] = useState(null);
  const [isAbsent, setIsAbsent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    api.federation.settings(profile).then((result) => {
      setSettings(result.data);
    }).catch((error) => {
      setIsAbsent(federation.isAbsent(error));
    });
  }, [profile && profile.id]);

  if (isAbsent || !settings) {
    return null;
  }

  // A person's words, or a website's.
  const words = profile ? 'websites:settings.fediverseCard' : 'federation:settings';

  const save = (enabled) => {
    setIsSaving(true);
    setIsLeaving(false);
    api.federation.setEnabled(enabled, profile).then((result) => {
      setSettings(result.data);
      // The composer says whether a note will be shared, from this. A
      // website's notes are not written in it.
      if (!profile) {
        rememberOnFediverse(result.data && result.data.enabled);
      }
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
      <CardHeader
        avatar={<Avatar><FediverseIcon /></Avatar>}
        title={i18n.t('federation:settings.title')}
      />
      <Divider />
      <CardContent>
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(settings.enabled)}
              disabled={isSaving || !canSwitch}
              onChange={handleChange}
            />
          }
          label={i18n.t(`${words}.enable`)}
        />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {i18n.t(`${words}.help`)}
        </Typography>
        {settings.handle &&
          <Typography variant="body2" sx={{ mt: 2 }}>
            {i18n.t(`${words}.handle`)}
            {': '}
            <strong>{`@${settings.handle}`}</strong>
          </Typography>}
        {!settings.available && settings.reason &&
          <Alert severity="info" sx={{ mt: 2 }}>
            {i18n.t(`${words}.unavailable.${settings.reason}`)}
          </Alert>}
        {settings.available &&
          <Alert severity="warning" sx={{ mt: 2 }}>
            {i18n.t('federation:settings.warning')}
          </Alert>}
        {settings.enabled &&
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            {i18n.t(`${words}.leavesWhenPrivate`)}
          </Typography>}
      </CardContent>
      <Dialog
        open={isLeaving}
        onClose={() => { setIsLeaving(false); }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{i18n.t(`${words}.leave.title`)}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {i18n.t(`${words}.leave.body`)}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setIsLeaving(false); }}>
            {i18n.t('actions:cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => { save(false); }}
          >
            {i18n.t(`${words}.leave.confirm`)}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

ActorsSettingsFediverse.propTypes = {
  // A website, whose card this is; the viewer's own when left out.
  profile: PropTypes.shape({ id: PropTypes.number }),
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
