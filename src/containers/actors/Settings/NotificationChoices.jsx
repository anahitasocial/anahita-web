import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import Progress from '../../../components/Progress';
import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';

// What the viewer is told about (roadmap row 97, part 5): eight kinds of
// thing, all on to begin with, each saved as it is switched. Turned off, a
// notification of that kind is not made at all. Their own, on their own
// settings only.
const ActorsSettingsNotificationChoices = ({ alertSuccess, alertError }) => {
  const [topics, setTopics] = useState(null);
  const [saving, setSaving] = useState('');

  useEffect(() => {
    api.notifications.settings().then(({ data }) => {
      setTopics(data.topics || []);
    }).catch(() => {
      alertError(i18n.t('prompts:saved.error'));
    });
  }, []);

  const handleChange = (topic, on) => {
    setSaving(topic);
    api.notifications.editSettings(topic, on).then(({ data }) => {
      setTopics(data.topics || []);
      alertSuccess(i18n.t('prompts:saved.success'));
    }).catch(() => {
      alertError(i18n.t('prompts:saved.error'));
    }).finally(() => {
      setSaving('');
    });
  };

  return (
    <Card>
      <CardHeader
        title={i18n.t('notifications:choices.title')}
        subheader={i18n.t('notifications:choices.help')}
      />
      <CardContent sx={{ pt: 0 }}>
        {!topics && <Progress />}
        {topics &&
          <Stack>
            {topics.map(({ topic, on }) => {
              return (
                <FormControlLabel
                  key={`notifications-${topic}`}
                  control={
                    <Switch
                      checked={on}
                      disabled={saving !== ''}
                      onChange={(event) => {
                        handleChange(topic, event.target.checked);
                      }}
                    />
                  }
                  label={
                    <Typography variant="body1">
                      {i18n.t(`notifications:choices.topics.${topic}`)}
                    </Typography>
                  }
                />
              );
            })}
          </Stack>}
      </CardContent>
    </Card>
  );
};

ActorsSettingsNotificationChoices.propTypes = {
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

export default connect(null, mapDispatchToProps)(ActorsSettingsNotificationChoices);
