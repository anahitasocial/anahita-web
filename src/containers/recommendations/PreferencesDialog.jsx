import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import ActorAvatar from '../../components/ActorAvatar';
import Progress from '../../components/Progress';
import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import utils from '../../utils';

const { getActorName } = utils.node;

// The choices, in the order they are shown.
const CHOICES = ['suggestPeople', 'suggestGroups', 'suggestEvents', 'useActivity'];

// What the viewer is recommended: whether people, groups and events are
// suggested to them at all, whether what they like and post is used to
// choose, and the suggestions they removed, each to be taken back.
//
// On the Recommendations page, where what it changes is in front of them.
// Whether they are suggested to others is a privacy choice and is with
// those, in their settings. How much each reason counts is the dialog
// beside this one.
//
// Each choice is saved as it is switched. `onChanged` is told when
// anything changed, for the list behind to be read again.
const SuggestionPreferencesDialog = ({
  onClose,
  onChanged = null,
  alertError,
}) => {
  const [choices, setChoices] = useState(null);
  const [dismissed, setDismissed] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    api.recommendations.preferences().then((result) => {
      setChoices(result.data);
    }).catch(() => {
      alertError(i18n.t('recommendations:failed'));
      onClose();
    });

    api.recommendations.dismissals().then((result) => {
      setDismissed(result.data.data || []);
    }).catch(() => {
      setDismissed([]);
    });
  }, []);

  const close = () => {
    if (hasChanged && onChanged) {
      onChanged();
    }
    onClose();
  };

  const handleChange = (choice, isOn) => {
    setIsSaving(true);
    api.recommendations.setPreferences({ [choice]: isOn }).then((result) => {
      setChoices(result.data);
      setHasChanged(true);
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
      setHasChanged(true);
    }).catch(() => {
      alertError(i18n.t('recommendations:settings.notSaved'));
    });
  };

  return (
    <Dialog
      open
      fullWidth
      maxWidth="sm"
      onClose={close}
      aria-labelledby="suggestion-preferences-title"
    >
      <DialogTitle id="suggestion-preferences-title">
        {i18n.t('recommendations:preferences.title')}
      </DialogTitle>
      <DialogContent dividers>
        {!choices && <Progress />}
        {choices &&
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
          </Stack>}
        {choices && dismissed.length > 0 &&
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
                    sx={{ pr: 12 }}
                  />
                </ListItem>
              );
            })}
          </List>}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button fullWidth onClick={close}>
          {i18n.t('commons:close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

SuggestionPreferencesDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  onChanged: PropTypes.func,
  alertError: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(null, mapDispatchToProps)(SuggestionPreferencesDialog);
