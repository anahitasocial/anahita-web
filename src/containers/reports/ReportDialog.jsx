import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';

const DETAILS_MAX = 1000;

// The reasons for one kind of node in one language do not change while the
// app is open, so each list is fetched once. Keyed by both: switching
// language must not show the previous language's labels.
const reasonsCache = new Map();

const loadReasons = (type) => {
  const lang = i18n.language;
  const key = `${lang}:${type}`;

  if (!reasonsCache.has(key)) {
    reasonsCache.set(key, api.abuseReports.reasons(type, lang)
      .then(({ data }) => {
        return data.data || [];
      })
      .catch((err) => {
        // A failed load must not be remembered as the answer.
        reasonsCache.delete(key);
        throw err;
      }));
  }

  return reasonsCache.get(key);
};

const submitError = (err) => {
  const response = err && err.response;
  const status = response && response.status;
  const code = response && response.data && response.data.error;

  if (status === 404) {
    return i18n.t('abuseReports:errors.notFound');
  }
  if (status === 429) {
    return i18n.t('abuseReports:errors.tooMany');
  }
  if (code === 'own_content') {
    return i18n.t('abuseReports:errors.ownContent');
  }
  if (code === 'reason_not_applicable') {
    return i18n.t('abuseReports:errors.reasonNotApplicable');
  }
  if (code === 'details_required') {
    return i18n.t('abuseReports:errors.detailsRequired');
  }

  return i18n.t('abuseReports:errors.generic');
};

// The form somebody fills in to report a node: a reason from the
// installation's list, and, if they wish or the reason demands, a few
// words.
//
// Rendered only while open, so every opening starts from an empty form.
const ReportDialog = ({
  node,
  onClose,
  alertError,
  alertSuccess,
}) => {
  const [reasons, setReasons] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reasonKey, setReasonKey] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let current = true;

    loadReasons(node.type)
      .then((list) => {
        if (current) {
          setReasons(list);
        }
      })
      .catch(() => {
        if (current) {
          setLoadFailed(true);
        }
      });

    return () => {
      current = false;
    };
  }, [node.type]);

  const reason = (reasons || []).find((item) => {
    return item.key === reasonKey;
  });
  const detailsRequired = Boolean(reason && reason.requiresDetails);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }
    if (!reason) {
      setError(i18n.t('abuseReports:errors.chooseReason'));
      return;
    }
    if (detailsRequired && !details.trim()) {
      setError(i18n.t('abuseReports:errors.detailsRequired'));
      return;
    }

    setSubmitting(true);

    api.abuseReports.add({
      targetId: node.id,
      reasonKey,
      details: details.trim(),
    })
      .then((response) => {
        alertSuccess(response.status === 200 ?
          i18n.t('abuseReports:alerts.updated') :
          i18n.t('abuseReports:alerts.reported'));
        onClose();
      })
      .catch((err) => {
        setSubmitting(false);

        const status = err && err.response && err.response.status;
        if (status === 400) {
          setError(submitError(err));
          return;
        }

        // Nothing the form can fix: say so and get out of the way.
        alertError(submitError(err));
        onClose();
      });
  };

  return (
    <Dialog
      open
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="report-dialog-title"
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle id="report-dialog-title">
          {i18n.t('abuseReports:dialog.cTitle')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText variant="body2" gutterBottom>
            {i18n.t('abuseReports:dialog.cDescription')}
          </DialogContentText>

          {!reasons && !loadFailed &&
            <Typography variant="body2" color="textSecondary">
              {i18n.t('abuseReports:dialog.loading')}
            </Typography>}

          {loadFailed &&
            <Typography variant="body2" color="error">
              {i18n.t('abuseReports:dialog.loadError')}
            </Typography>}

          {reasons &&
            <FormControl
              variant="standard"
              margin="normal"
              error={Boolean(error) && !reason}
              fullWidth
            >
              <RadioGroup
                name="reason"
                value={reasonKey}
                onChange={(event) => {
                  setReasonKey(event.target.value);
                  setError('');
                }}
              >
                {reasons.map((item) => {
                  return (
                    <FormControlLabel
                      key={item.key}
                      value={item.key}
                      control={<Radio size="small" />}
                      label={item.label}
                      disabled={submitting}
                    />
                  );
                })}
              </RadioGroup>
              {/* What the chosen reason means, so the choice is not made on
                  a one-word label alone. */}
              {reason && reason.description &&
                <FormHelperText error={false}>
                  {reason.description}
                </FormHelperText>}
            </FormControl>}

          {reasons &&
            <TextField
              variant="outlined"
              name="details"
              label={detailsRequired ?
                i18n.t('abuseReports:dialog.detailsRequired') :
                i18n.t('abuseReports:dialog.details')}
              value={details}
              onChange={(event) => {
                setDetails(event.target.value.slice(0, DETAILS_MAX));
                setError('');
              }}
              helperText={i18n.t('abuseReports:dialog.detailsHint', {
                count: details.length,
                max: DETAILS_MAX,
              })}
              required={detailsRequired}
              disabled={submitting}
              margin="normal"
              fullWidth
              multiline
              minRows={2}
              slotProps={{
                htmlInput: { maxLength: DETAILS_MAX },
              }}
            />}

          {error &&
            <Typography variant="body2" color="error" role="alert">
              {error}
            </Typography>}
        </DialogContent>
        <DialogActions>
          <Button fullWidth onClick={onClose} disabled={submitting}>
            {i18n.t('actions:cancel')}
          </Button>
          <Button
            type="submit"
            fullWidth
            color="primary"
            variant="contained"
            disabled={submitting || !reasons}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {submitting ?
              i18n.t('abuseReports:dialog.submitting') :
              i18n.t('abuseReports:dialog.submit')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

ReportDialog.propTypes = {
  // Anything with an id and a type: a person, a group, a post, a comment,
  // a hashtag or a place.
  node: PropTypes.shape({
    id: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
  alertSuccess: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
    alertSuccess: (message) => {
      return dispatch(actions.app.alert.success(message));
    },
  };
};

export default connect(null, mapDispatchToProps)(ReportDialog);
