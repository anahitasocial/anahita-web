import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import ActorType from '../../../proptypes/Actor';
import actions from '../../../actions';
import api from '../../../api/downloads';
import i18n from '../../../languages';

// Whether the photos and videos posted on this profile start out
// downloadable: a person's own, or what is posted in a group.
//
// Off unless they say otherwise. It is where a new post starts and no
// more: each post has its own switch, and changing this changes nothing
// already posted.
//
// Saved as soon as it is switched: one choice, with nothing else to send
// along with it.
const ActorsSettingsDownloadDefault = ({
  actor,
  namespace,
  read,
  alertSuccess,
  alertError,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (event) => {
    const allow = event.target.checked;

    setIsSaving(true);
    api.setDefault(namespace, actor, allow).then(() => {
      return read(actor);
    }).then(() => {
      alertSuccess(i18n.t('media:download.default.saved'));
    }).catch(() => {
      alertError(i18n.t('media:download.default.notSaved'));
    })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <Card>
      <CardHeader title={i18n.t('media:download.default.title')} />
      <CardContent sx={{ pt: 0 }}>
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(actor.allowDownload)}
              onChange={handleChange}
              disabled={isSaving}
            />
          }
          label={i18n.t('media:download.default.label')}
        />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {i18n.t('media:download.default.help')}
        </Typography>
      </CardContent>
    </Card>
  );
};

ActorsSettingsDownloadDefault.propTypes = {
  actor: ActorType.isRequired,
  namespace: PropTypes.string.isRequired,
  read: PropTypes.func.isRequired,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapStateToProps = (namespace) => {
  return (state) => {
    return {
      actor: state[namespace][namespace].current,
      namespace,
    };
  };
};

const mapDispatchToProps = (namespace) => {
  return (dispatch) => {
    return {
      read: (actor) => {
        return dispatch(actions[namespace].read(actor.id, namespace));
      },
      alertSuccess: (message) => {
        return dispatch(actions.app.alert.success(message));
      },
      alertError: (message) => {
        return dispatch(actions.app.alert.error(message));
      },
    };
  };
};

export default (namespace) => {
  return connect(
    mapStateToProps(namespace),
    mapDispatchToProps(namespace),
  )(ActorsSettingsDownloadDefault);
};
