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

// Whether search engines may index this profile and its posts
// (anahita-services roadmap row 174). Off, its pages ask them not to
// (`noindex`); who may see the profile is its access, above, unchanged.
// Off for somebody who signs up, on for everybody before and for a new
// group, event or channel.
//
// Saved as soon as it is switched: one choice, with nothing else to send
// along with it.
const ActorsSettingsSearchEngines = ({ namespace }) => {
  const { actor, isSaving, save } = useSaveSetting(namespace);

  const handleChange = (event) => {
    const allowed = event.target.checked;

    save(() => {
      return api.searchEngines.edit(namespace, actor, allowed);
    }, {
      saved: 'access:searchEngines.saved',
      notSaved: 'access:searchEngines.notSaved',
    });
  };

  return (
    <Card>
      <CardHeader title={i18n.t('access:searchEngines.title')} />
      <CardContent sx={{ pt: 0 }}>
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(actor.searchEngines)}
              onChange={handleChange}
              disabled={isSaving}
            />
          }
          label={i18n.t('access:searchEngines.label')}
        />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {i18n.t('access:searchEngines.help')}
        </Typography>
      </CardContent>
    </Card>
  );
};

ActorsSettingsSearchEngines.propTypes = {
  namespace: PropTypes.string.isRequired,
};

export default forNamespace(ActorsSettingsSearchEngines);
