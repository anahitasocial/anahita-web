import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';
import recommendations from '../../../utils/recommendations';

// Whether the viewer is suggested to other people: the one choice about
// recommendations that is about who can find them, and so the one that is
// with their privacy settings. What they are suggested themselves is chosen
// on the Recommendations page (suggestions/PreferencesDialog).
//
// Saved as it is switched. Their own, and shown on their own settings only.
// On an installation with no recommendation service nothing is drawn.
const ActorsSettingsSuggestions = ({ alertSuccess, alertError }) => {
  const [choices, setChoices] = useState(null);
  const [isAbsent, setIsAbsent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api.recommendations.preferences().then((result) => {
      setChoices(result.data);
    }).catch((error) => {
      setIsAbsent(recommendations.isAbsent(error));
    });
  }, []);

  if (isAbsent || !choices) {
    return null;
  }

  const handleChange = (event) => {
    setIsSaving(true);
    api.recommendations.setPreferences({ discoverable: event.target.checked }).then((result) => {
      setChoices(result.data);
      alertSuccess(i18n.t('recommendations:settings.saved'));
    }).catch(() => {
      alertError(i18n.t('recommendations:settings.notSaved'));
    }).finally(() => {
      setIsSaving(false);
    });
  };

  return (
    <Card>
      <CardHeader title={i18n.t('recommendations:settings.title')} />
      <CardContent sx={{ pt: 0 }}>
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(choices.discoverable)}
              disabled={isSaving}
              onChange={handleChange}
            />
          }
          label={i18n.t('recommendations:settings.discoverable')}
        />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {i18n.t('recommendations:settings.discoverableHelp')}
        </Typography>
      </CardContent>
    </Card>
  );
};

ActorsSettingsSuggestions.propTypes = {
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

export default connect(null, mapDispatchToProps)(ActorsSettingsSuggestions);
