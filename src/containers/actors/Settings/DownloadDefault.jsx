import React from 'react';
import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import api from '../../../api/downloads';
import i18n from '../../../languages';
import useSaveSetting, { forNamespace } from './useSaveSetting';

// Whether the photos and videos posted on this profile start out
// downloadable: a person's own, or what is posted in a group.
//
// Off unless they say otherwise. It is where a new post starts and no
// more: each post has its own switch, and changing this changes nothing
// already posted.
//
// Saved as soon as it is switched: one choice, with nothing else to send
// along with it.
const ActorsSettingsDownloadDefault = ({ namespace }) => {
  const { actor, isSaving, save } = useSaveSetting(namespace);

  const handleChange = (event) => {
    const allow = event.target.checked;

    save(() => {
      return api.setDefault(namespace, actor, allow);
    }, {
      saved: 'media:download.default.saved',
      notSaved: 'media:download.default.notSaved',
    });
  };

  return (
    <Card>
      <CardHeader
        title={i18n.t('media:download.default.title')}
        slotProps={{
          title: { variant: 'subtitle1', sx: { fontWeight: 500 } },
        }}
      />
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
  namespace: PropTypes.string.isRequired,
};

export default forNamespace(ActorsSettingsDownloadDefault);
