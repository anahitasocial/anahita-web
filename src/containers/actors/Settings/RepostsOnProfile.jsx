import React from 'react';
import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import api from '../../../api';
import i18n from '../../../languages';
import useSaveSetting, { forNamespace } from './useSaveSetting';

// Whether what this person reposts is also shown among the posts on their
// profile. For people only: nothing else reposts.
// Off unless they say otherwise: a profile's posts are what was
// posted on it, and reposts have a tab of their own.
//
// Saved as soon as it is switched: one choice, with nothing else to send
// along with it.
const ActorsSettingsRepostsOnProfile = ({ namespace }) => {
  const { actor, isSaving, save } = useSaveSetting(namespace);

  const shown = Boolean(actor.showRepostsOnProfile);

  const handleChange = (event) => {
    const show = event.target.checked;

    save(() => {
      return api.reposts.setOnProfile(namespace, actor, show);
    }, {
      saved: 'replies:repostsOnProfile.saved',
      notSaved: 'replies:repostsOnProfile.notSaved',
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
  namespace: PropTypes.string.isRequired,
};

export default forNamespace(ActorsSettingsRepostsOnProfile);
