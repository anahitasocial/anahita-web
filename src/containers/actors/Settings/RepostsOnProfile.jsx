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
import api from '../../../api';
import i18n from '../../../languages';

// Whether what this person reposts is also shown among the posts on their
// profile. For people only: nothing else reposts.
// Off unless they say otherwise: a profile's posts are what was
// posted on it, and reposts have a tab of their own.
//
// Saved as soon as it is switched: one choice, with nothing else to send
// along with it.
const ActorsSettingsRepostsOnProfile = ({
  actor,
  namespace,
  read,
  alertSuccess,
  alertError,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const shown = Boolean(actor.showRepostsOnProfile);

  const handleChange = (event) => {
    const show = event.target.checked;

    setIsSaving(true);
    api.reposts.setOnProfile(namespace, actor, show).then(() => {
      return read(actor);
    }).then(() => {
      alertSuccess(i18n.t('replies:repostsOnProfile.saved'));
    }).catch(() => {
      alertError(i18n.t('replies:repostsOnProfile.notSaved'));
    })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <Card>
      <CardHeader title={i18n.t('replies:repostsOnProfile.title')} />
      <CardContent sx={{ pt: 0 }}>
        <FormControlLabel
          control={
            <Switch
              checked={shown}
              onChange={handleChange}
              disabled={isSaving}
            />
          }
          label={i18n.t('replies:repostsOnProfile.label')}
        />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {i18n.t('replies:repostsOnProfile.help')}
        </Typography>
      </CardContent>
    </Card>
  );
};

ActorsSettingsRepostsOnProfile.propTypes = {
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
  )(ActorsSettingsRepostsOnProfile);
};
