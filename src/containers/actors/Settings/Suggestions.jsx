import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import FormControlLabel from '@mui/material/FormControlLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import ActorAvatar from '../../../components/ActorAvatar';
import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';
import recommendations from '../../../utils/recommendations';
import utils from '../../../utils';

const { getActorName } = utils.node;

// The choices, in the order they are shown.
const CHOICES = ['suggestPeople', 'suggestGroups', 'useActivity', 'discoverable'];

// What the viewer has chosen about suggestions of who to follow, and the
// suggestions they turned down, each to be taken back.
//
// Each choice is saved as it is switched. Their own, and shown on their own
// settings only. On an installation with no recommendation service nothing
// is drawn: there is nothing to choose.
const ActorsSettingsSuggestions = ({ alertSuccess, alertError }) => {
  const [choices, setChoices] = useState(null);
  const [dismissed, setDismissed] = useState([]);
  const [isAbsent, setIsAbsent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api.recommendations.preferences().then((result) => {
      setChoices(result.data);
    }).catch((error) => {
      setIsAbsent(recommendations.isAbsent(error));
    });

    api.recommendations.dismissals().then((result) => {
      setDismissed(result.data.data || []);
    }).catch(() => {
      setDismissed([]);
    });
  }, []);

  if (isAbsent || !choices) {
    return null;
  }

  const handleChange = (choice, isOn) => {
    setIsSaving(true);
    api.recommendations.setPreferences({ [choice]: isOn }).then((result) => {
      setChoices(result.data);
      alertSuccess(i18n.t('recommendations:settings.saved'));
    }).catch(() => {
      alertError(i18n.t('recommendations:settings.notSaved'));
    }).finally(() => {
      setIsSaving(false);
    });
  };

  const handleUndo = (actor) => {
    api.recommendations.setDismissed(actor, false).then(() => {
      setDismissed((before) => {
        return before.filter((each) => {
          return each.id !== actor.id;
        });
      });
    }).catch(() => {
      alertError(i18n.t('recommendations:settings.notSaved'));
    });
  };

  return (
    <Card>
      <CardHeader title={i18n.t('recommendations:settings.title')} />
      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={1}>
          <Typography variant="body2" color="textSecondary">
            {i18n.t('recommendations:settings.help')}
          </Typography>
          {CHOICES.map((choice) => {
            return (
              <div key={choice}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(choices[choice])}
                      disabled={isSaving}
                      onChange={(event) => {
                        handleChange(choice, event.target.checked);
                      }}
                    />
                  }
                  label={i18n.t(`recommendations:settings.${choice}`)}
                />
                {choice === 'useActivity' &&
                  <Typography variant="body2" color="textSecondary" sx={{ pl: 6 }}>
                    {i18n.t('recommendations:settings.useActivityHelp')}
                  </Typography>}
              </div>
            );
          })}
          <Typography variant="subtitle2" component="h3" sx={{ pt: 2 }}>
            {i18n.t('recommendations:settings.dismissedTitle')}
          </Typography>
          {dismissed.length === 0 &&
            <Typography variant="body2" color="textSecondary">
              {i18n.t('recommendations:settings.dismissedEmpty')}
            </Typography>}
        </Stack>
        {dismissed.length > 0 &&
          <List disablePadding>
            {dismissed.map((actor) => {
              return (
                <ListItem
                  key={`dismissed-${actor.id}`}
                  disableGutters
                  secondaryAction={
                    <Button
                      onClick={() => {
                        handleUndo(actor);
                      }}
                    >
                      {i18n.t('recommendations:settings.undo')}
                    </Button>
                  }
                >
                  <ListItemAvatar>
                    <ActorAvatar actor={actor} linked />
                  </ListItemAvatar>
                  <ListItemText
                    primary={getActorName(actor)}
                    slotProps={{ primary: { noWrap: true } }}
                  />
                </ListItem>
              );
            })}
          </List>}
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
