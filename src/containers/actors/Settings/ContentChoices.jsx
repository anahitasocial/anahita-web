import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

import actions from '../../../actions';
import i18n from '../../../languages';
import contentChoices from '../../../utils/contentChoices';
import warnings from '../../../utils/warnings';
import PersonType from '../../../proptypes/Person';

// What the viewer sees of a post with a content warning, kind by kind
// (anahita-services row 122, phase 2): Show, Warn or Hide, each saved as it
// is chosen. Every kind starts at Warn. Their own, on their own settings
// only.
const ActorsSettingsContentChoices = ({ viewer, alertSuccess, alertError }) => {
  const choices = contentChoices.useContentChoices();

  const handleChange = (kind, choice) => {
    // Pressing the chosen one again chooses nothing: it stays.
    if (!choice || choice === contentChoices.of(choices, kind)) {
      return;
    }
    contentChoices.choose(viewer.id, kind, choice).then(() => {
      alertSuccess(i18n.t('prompts:saved.success'));
    }).catch(() => {
      alertError(i18n.t('prompts:saved.error'));
    });
  };

  return (
    <Card>
      <CardHeader
        title={i18n.t('warnings:choices.title')}
        subheader={i18n.t('warnings:choices.help')}
      />
      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={3}>
          {warnings.KINDS.map((kind) => {
            const labelId = `content-choice-${kind}`;
            return (
              <Box key={kind}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                  {warnings.iconOf(kind, { fontSize: 'small', color: 'action' })}
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" id={labelId}>
                      {i18n.t(`warnings:kinds.${kind}`)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {kind === warnings.OTHER ? i18n.t('warnings:choices.otherLine') : i18n.t(`warnings:lines.${kind}`)}
                    </Typography>
                  </Box>
                </Stack>
                <ToggleButtonGroup
                  exclusive
                  fullWidth
                  size="small"
                  color="primary"
                  aria-labelledby={labelId}
                  value={contentChoices.of(choices, kind)}
                  onChange={(event, choice) => {
                    handleChange(kind, choice);
                  }}
                >
                  {contentChoices.CHOICES.map((choice) => {
                    return (
                      <ToggleButton key={choice} value={choice} sx={{ textTransform: 'none' }}>
                        {i18n.t(`warnings:choices.${choice}`)}
                      </ToggleButton>
                    );
                  })}
                </ToggleButtonGroup>
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
};

ActorsSettingsContentChoices.propTypes = {
  viewer: PersonType.isRequired,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    viewer: state.session.viewer,
  };
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

export default connect(mapStateToProps, mapDispatchToProps)(ActorsSettingsContentChoices);
