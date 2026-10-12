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
import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import recommendations from '../../utils/recommendations';

const STEP = 0.5;

// How much each reason counts for when the viewer is suggested somebody: a
// slider a reason, from nothing, which leaves the reason out, to the most
// there is.
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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api.recommendations.preferences().then((result) => {
      setSettings(result.data);
      setWeights(result.data.weights || {});
    }).catch(() => {
      alertError(i18n.t('recommendations:weights.notSaved'));
      onClose();
    });
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    api.recommendations.setPreferences({ weights }).then(() => {
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
      <DialogTitle id="suggestion-weights-title">
        {i18n.t('recommendations:weights.title')}
      </DialogTitle>
      <DialogContent dividers>
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
          </Stack>}
      </DialogContent>
      {/* Side by side: Cancel, Reset, then the one that saves. */}
      <DialogActions sx={{ p: 2 }}>
        <Button fullWidth disabled={isSaving} onClick={onClose}>
          {i18n.t('recommendations:weights.cancel')}
        </Button>
        <Button
          fullWidth
          disabled={isSaving || !settings}
          onClick={() => {
            setWeights({ ...(settings.defaultWeights || {}) });
            // Everything as it was at the start: Who to follow on the home
            // page too, if it was put away.
            recommendations.unhide();
          }}
        >
          {i18n.t('recommendations:weights.reset')}
        </Button>
        <Button
          fullWidth
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
