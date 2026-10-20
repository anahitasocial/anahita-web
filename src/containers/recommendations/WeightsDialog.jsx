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

import Progress from '../../components/Progress';
import { HowItWorksButton, HowItWorksPanel } from '../../components/HowItWorks';
import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import recommendations from '../../utils/recommendations';

const STEP = 0.5;

// How much each reason counts for when the viewer is suggested somebody: a
// slider a reason, from nothing, which leaves the reason out, to the most
// there is.
//
// Under them, one more that is not a reason: how lately a person must have
// been here to be suggested at all, from the last month to any time. It is
// a slider over the choices the server gives, not over days: the steps are
// a month, a season, a year, and so on, and the last is no limit.
//
// These are the viewer's own, and change only what they are suggested.
// Nothing is saved until Save; Reset puts the sliders back to the
// installation's own, to be saved or not.
const SuggestionWeightsDialog = ({
  onClose,
  onSaved,
  alertSuccess,
  alertError,
}) => {
  // What the server sent: the reasons in order, the most a weight may be,
  // and its own weights to go back to.
  const [settings, setSettings] = useState(null);
  const [weights, setWeights] = useState({});
  const [activeWithin, setActiveWithin] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  // How it works, opened from the (i) by the title.
  const [isExplained, setIsExplained] = useState(false);

  useEffect(() => {
    api.recommendations.preferences().then((result) => {
      setSettings(result.data);
      setWeights(result.data.weights || {});
      setActiveWithin(result.data.activeWithinDays);
    }).catch(() => {
      alertError(i18n.t('recommendations:weights.notSaved'));
      onClose();
    });
  }, []);

  const activeChoices = (settings && settings.activeWithinChoices) || [];
  // Where the slider stands: the place of the choice among the choices.
  const activeIndex = Math.max(activeChoices.indexOf(activeWithin), 0);
  const activeLabel = (days) => {
    return i18n.t(`recommendations:weights.activeWithin.days${days}`, {
      defaultValue: i18n.t('recommendations:weights.activeWithin.days', { count: days }),
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    const choices = { weights };

    // Left alone where the server does not know of it.
    if (activeChoices.length > 0) {
      choices.activeWithinDays = activeWithin;
    }

    api.recommendations.setPreferences(choices).then(() => {
      alertSuccess(i18n.t('recommendations:weights.saved'));
      onSaved();
    }).catch(() => {
      alertError(i18n.t('recommendations:weights.notSaved'));
      setIsSaving(false);
    });
  };

  const reasons = ((settings && settings.reasons) || []).map(recommendations.weightKey);
  const max = (settings && settings.maxWeight) || 10;

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
      aria-labelledby="suggestion-weights-title"
    >
      <DialogTitle
        id="suggestion-weights-title"
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1,
        }}
      >
        {i18n.t('recommendations:weights.title')}
        <HowItWorksButton
          open={isExplained}
          controls="suggestion-weights-how"
          onToggle={() => {
            setIsExplained(!isExplained);
          }}
        />
      </DialogTitle>
      <DialogContent dividers>
        <HowItWorksPanel
          open={isExplained}
          id="suggestion-weights-how"
          points={i18n.t('recommendations:weights.howItWorks', { returnObjects: true })}
        />
        {!settings && <Progress />}
        {settings &&
          <Stack spacing={2}>
            <Typography variant="body2" color="textSecondary">
              {i18n.t('recommendations:weights.help')}
            </Typography>
            {reasons.map((reason) => {
              const value = Number(weights[reason]) || 0;
              const labelId = `suggestion-weight-${reason}`;

              return (
                <div key={reason}>
                  <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
                    <Typography id={labelId} variant="body1">
                      {i18n.t(`recommendations:weights.${reason}`)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ flexShrink: 0 }}>
                      {value === 0 ? i18n.t('recommendations:weights.off') : value}
                    </Typography>
                  </Stack>
                  <Slider
                    aria-labelledby={labelId}
                    value={value}
                    min={0}
                    max={max}
                    step={STEP}
                    disabled={isSaving}
                    valueLabelDisplay="auto"
                    onChange={(event, chosen) => {
                      setWeights({ ...weights, [reason]: chosen });
                    }}
                  />
                </div>
              );
            })}
            {activeChoices.length > 1 &&
              <div>
                <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
                  <Typography id="suggestion-active-within" variant="body1">
                    {i18n.t('recommendations:weights.activeWithin.label')}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ flexShrink: 0 }}>
                    {activeLabel(activeChoices[activeIndex])}
                  </Typography>
                </Stack>
                <Slider
                  aria-labelledby="suggestion-active-within"
                  value={activeIndex}
                  min={0}
                  max={activeChoices.length - 1}
                  step={1}
                  marks
                  disabled={isSaving}
                  getAriaValueText={(index) => {
                    return activeLabel(activeChoices[index]);
                  }}
                  onChange={(event, index) => {
                    setActiveWithin(activeChoices[index]);
                  }}
                />
                <Typography variant="body2" color="textSecondary">
                  {i18n.t('recommendations:weights.activeWithin.help')}
                </Typography>
              </div>}
          </Stack>}
      </DialogContent>
      {/* Side by side: Cancel, Reset, then the one that saves. */}
      <DialogActions sx={{ p: 2 }}>
        <Button disabled={isSaving} onClick={onClose}>
          {i18n.t('recommendations:weights.cancel')}
        </Button>
        <Button
          disabled={isSaving || !settings}
          onClick={() => {
            setWeights({ ...(settings.defaultWeights || {}) });
            if (activeChoices.length > 0) {
              setActiveWithin(settings.activeWithinDefault);
            }
            // Everything as it was at the start: Who to follow on the home
            // page too, if it was put away.
            recommendations.unhide();
          }}
        >
          {i18n.t('recommendations:weights.reset')}
        </Button>
        <Button
          variant="contained"
          disabled={isSaving || !settings}
          onClick={handleSave}
        >
          {i18n.t('recommendations:weights.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

SuggestionWeightsDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  // Saved: whoever shows suggestions reads them again.
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

export default connect(null, mapDispatchToProps)(SuggestionWeightsDialog);
