import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import StepUp from '../../auth/StepUp';
import PurgeProgress from '../../admin/Accounts/PurgeProgress';
import usePurgeProgress from '../../admin/Accounts/usePurgeProgress';
import api from '../../../api';
import actions from '../../../actions';
import i18n from '../../../languages';
import ActorType from '../../../proptypes/Actor';

// Delete permanently: one account, now, with no thirty days.
//
// Super administrators only, and never on their own profile; sections.js
// keeps the card from anybody else, and the server refuses them.
//
// It sits below Delete and has to be told apart from it at a glance:
// Delete can be taken back for thirty days and this cannot, so that is
// the first thing the card says. The second is what it is for. It is a
// cleanup tool, and somebody reaching for it to deal with a person
// behaving badly wants Disable.
//
// The same request the accounts list makes, for one account. Unlike the
// list, it may remove an administrator: here the account was chosen by
// name, not swept up by a filter.
//
// The server answers before the work is done, so the card shows the
// progress and only leaves the page once the account is gone.
const ActorsSettingsPurge = (props) => {
  const {
    actor,
    namespace,
    alertSuccess,
    alertError,
  } = props;

  const navigate = useNavigate();

  const [confirmation, setConfirmation] = useState('');
  const [stepUpOpen, setStepUpOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [batchId, setBatchId] = useState('');

  const progress = usePurgeProgress(namespace, batchId);

  const isPerson = namespace === 'people';

  const copy = (key, options) => {
    return i18n.t(`accounts:single.${key}`, options);
  };

  // Trimmed and case-insensitive, matching the delete card. A typo guard
  // and a moment to stop, not an authorisation check.
  const typed = confirmation.trim().toLowerCase();
  const expected = (actor.alias || '').trim().toLowerCase();
  const started = Boolean(batchId);
  const enabled = typed !== '' && typed === expected && !submitting && !started;

  const leave = () => {
    alertSuccess(copy('done', { name: actor.name }));
    navigate('/admin/accounts', { replace: true });
  };

  // Gone: nothing is left on this page to look at.
  useEffect(() => {
    if (!progress.finished) {
      return;
    }

    if (progress.batch.failed > 0) {
      const [item] = progress.batch.items || [];
      alertError((item && item.error) || i18n.t('accounts:purge.errors.generic'));
      setBatchId('');
      return;
    }

    leave();
  }, [progress.finished]);

  const submit = () => {
    setSubmitting(true);

    return api.accounts.purgeOne(namespace, actor.id)
      .then(({ status, data }) => {
        // 200: it was already gone, or is already on its way.
        if (status === 200 || !data.batchId) {
          leave();
          return;
        }

        setBatchId(data.batchId);
      })
      .catch((err) => {
        const status = err && err.response && err.response.status;
        const body = (err && err.response && err.response.data) || {};

        // The same two meanings of 403 as the delete card: prove yourself,
        // or you may not do this at all.
        if (status === 403 && body.error === 'step_up_required') {
          setStepUpOpen(true);
          return;
        }

        if (status === 403) {
          alertError(i18n.t('accounts:purge.errors.forbidden'));
          return;
        }

        // Refused, with the reason: the only super administrator, say.
        if (status === 409 && Array.isArray(body.refused) && body.refused.length > 0) {
          const { reason } = body.refused[0];
          alertError(`@${actor.alias} ${i18n.t(`accounts:purge.reasons.${reason}`, {
            defaultValue: reason,
          })}`);
          return;
        }

        alertError(i18n.t('accounts:purge.errors.generic'));
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <>
      <CardContent>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ marginBottom: '16px' }}
        >
          <strong>{copy('permanent')}</strong>
        </Typography>

        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ marginBottom: '16px' }}
        >
          {copy(isPerson ? 'personDescription' : 'groupDescription', {
            name: actor.name,
          })}
        </Typography>

        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ marginBottom: '16px' }}
        >
          {copy('notModeration')}
        </Typography>

        {started ?
          <PurgeProgress
            batch={progress.batch}
            finished={progress.finished}
            slow={progress.slow}
            failing={progress.failing}
          /> :
          <TextField
            name="purgeConfirmation"
            label={copy('confirmLabel', { alias: actor.alias })}
            value={confirmation}
            onChange={(event) => {
              return setConfirmation(event.target.value);
            }}
            autoComplete="off"
            variant="outlined"
            margin="normal"
            fullWidth
          />}
      </CardContent>
      <CardActions>
        {/* Proof first, then the request: every purge is refused without
            one, so sending it first would only be a refused request. */}
        <Button
          onClick={() => {
            setStepUpOpen(true);
          }}
          color="secondary"
          variant="contained"
          disabled={!enabled}
          fullWidth
        >
          {started || submitting ? i18n.t('accounts:purge.working') : copy('action')}
        </Button>
      </CardActions>
      <StepUp
        open={stepUpOpen}
        onVerified={() => {
          setStepUpOpen(false);
          submit();
        }}
        onCancel={() => {
          return setStepUpOpen(false);
        }}
      />
    </>
  );
};

ActorsSettingsPurge.propTypes = {
  actor: ActorType.isRequired,
  namespace: PropTypes.string.isRequired,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapStateToProps = (namespace) => {
  return (state) => {
    const { [namespace]: { current: actor } } = state[namespace];
    return { actor, namespace };
  };
};

const mapDispatchToProps = () => {
  return (dispatch) => {
    return {
      alertSuccess: (message) => {
        return dispatch(actions.app.alert.success(message));
      },
      alertError: (message) => {
        return dispatch(actions.app.alert.error(message));
      },
    };
  };
};

export default (namespace) => {
  return connect(
    mapStateToProps(namespace),
    mapDispatchToProps(namespace),
  )(ActorsSettingsPurge);
};
