import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Progress from '../../../components/Progress';
import { HowItWorksButton, HowItWorksPanel } from '../../../components/HowItWorks';
import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';

// The names of the steps the server gives, in order: 0 is off, 1 as the
// installation has it.
const STEP_NAMES = ['off', 'less', 'asIs', 'more', 'muchMore'];
const AS_IS = 1;

// How much each sign that something was found useful counts for the viewer
// in "Most relevant" (the user, 2026-10-16: as they adjust their
// suggestions). A slider a sign, over the steps the server gives, from Off
// to Much more; As is, in the middle, is the installation's own weight.
//
// These are the viewer's own, and change only what they find. Nothing is
// saved until Save; Reset puts every slider back to As is, to be saved or
// not.
const SearchWeightsDialog = ({
  onClose,
  onSaved,
  alertSuccess,
  alertError,
}) => {
  // What the server sent: what may be set, and to what.
  const [settings, setSettings] = useState(null);
  const [steps, setSteps] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  // How it works, opened from the (i) by the title.
  const [isExplained, setIsExplained] = useState(false);

  useEffect(() => {
    api.searchPreferences.read().then((result) => {
      setSettings(result.data);
      setSteps(result.data.steps || {});
    }).catch(() => {
      alertError(i18n.t('search:weights.notSaved'));
      onClose();
    });
  }, []);

  const options = (settings && settings.options) || [];
  const stepName = (value) => {
    const name = STEP_NAMES[options.indexOf(value)];
    return name ? i18n.t(`search:weights.steps.${name}`) : `${value}`;
  };

  const handleSave = () => {
    setIsSaving(true);
    // As is needs no keeping.
    const kept = Object.fromEntries(Object.entries(steps).filter(([, value]) => {
      return value !== AS_IS;
    }));
    api.searchPreferences.edit(kept).then(() => {
      alertSuccess(i18n.t('search:weights.saved'));
      onSaved();
    }).catch(() => {
      alertError(i18n.t('search:weights.notSaved'));
      setIsSaving(false);
    });
  };

  return (
    <Dialog
      open
      fullWidth
      maxWidth="sm"
      onClose={() => {
        if (!isSaving) {
          onClose();
        }
      }}
      aria-labelledby="search-weights-title"
    >
      <DialogTitle
        id="search-weights-title"
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1,
        }}
      >
        {i18n.t('search:weights.title')}
        <HowItWorksButton
          open={isExplained}
          controls="search-weights-how"
          onToggle={() => {
            setIsExplained(!isExplained);
          }}
        />
      </DialogTitle>
      <DialogContent dividers>
        <HowItWorksPanel
          open={isExplained}
          id="search-weights-how"
          points={i18n.t('search:weights.howItWorks', { returnObjects: true })}
        />
        {!settings && <Progress />}
        {settings &&
          <Stack spacing={2}>
            <Typography variant="body2" color="textSecondary">
              {i18n.t('search:weights.help')}
            </Typography>
            {(settings.adjustable || []).map((name) => {
              const value = name in steps ? steps[name] : AS_IS;
              // Where the slider stands: the place of the step among them.
              const index = Math.max(options.indexOf(value), 0);
              const labelId = `search-weight-${name}`;

              return (
                <div key={name}>
                  <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
                    <Typography id={labelId} variant="body1">
                      {i18n.t(`search:weights.names.${name}`)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ flexShrink: 0 }}>
                      {stepName(value)}
                    </Typography>
                  </Stack>
                  <Slider
                    aria-labelledby={labelId}
                    value={index}
                    min={0}
                    max={options.length - 1}
                    step={1}
                    marks
                    disabled={isSaving}
                    getAriaValueText={(at) => {
                      return stepName(options[at]);
                    }}
                    onChange={(event, at) => {
                      setSteps({ ...steps, [name]: options[at] });
                    }}
                  />
                </div>
              );
            })}
          </Stack>}
      </DialogContent>
      {/* Side by side: Cancel, Reset, then the one that saves. */}
      <DialogActions sx={{ p: 2 }}>
        <Button disabled={isSaving} onClick={onClose}>
          {i18n.t('search:weights.cancel')}
        </Button>
        <Button
          disabled={isSaving || !settings}
          onClick={() => {
            setSteps({});
          }}
        >
          {i18n.t('search:weights.reset')}
        </Button>
        <Button
          variant="contained"
          disabled={isSaving || !settings}
          onClick={handleSave}
        >
          {i18n.t('search:weights.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

SearchWeightsDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  // Saved: the results are read again.
  onSaved: PropTypes.func.isRequired,
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

export default connect(null, mapDispatchToProps)(SearchWeightsDialog);
