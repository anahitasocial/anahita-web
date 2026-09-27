import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { makeStyles } from 'tss-react/mui';

import PasskeyIcon from '@mui/icons-material/Fingerprint';

import StepUp from '../../auth/StepUp';
import useStepUp from '../../settings/useStepUp';
import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';
import PersonType from '../../../proptypes/Person';

const useStyles = makeStyles()((theme) => {
  return {
    destructive: {
      color: theme.palette.error.main,
    },
  };
});

// Revoking every passkey belonging to somebody else.
//
// A COUNT, never a list, and that is the server's design rather than an
// omission here: listing would reveal which devices a person carries
// and when each was last used, which is device profiling that buys an
// administrator nothing — the action needs no enumeration.
//
// Administrator or super administrator. Authority divides by domain
// rather than seniority: this is people administration, not system
// configuration.
//
// It also needs a step-up, which the server asks for with a 403 the
// first time. An administrator session left open is not on its own
// enough to strip somebody's sign-in methods.
const RevokePasskeys = ({
  person,
  alertError,
  alertSuccess,
}) => {
  const { classes } = useStyles();
  const [count, setCount] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const {
    stepUpOpen,
    runGuarded,
    onVerified,
    onCancel,
  } = useStepUp();

  useEffect(() => {
    let cancelled = false;

    api.webauthn.countForPerson(person.id)
      .then(({ data }) => {
        if (!cancelled) {
          const value = data && data.data && data.data.count;
          setCount(typeof value === 'number' ? value : 0);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCount(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsFetching(false);
        }
      });

    // The flag is only worth having with this: without a cleanup it
    // never becomes true, and a response arriving after the card
    // unmounts sets state on nothing.
    return () => {
      cancelled = true;
    };
  }, [person.id]);

  const handleRevoke = () => {
    return runGuarded(
      () => {
        return api.webauthn.deleteAllForPerson(person.id)
          .then(() => {
            setCount(0);
            alertSuccess(i18n.t('people:revokePasskeys.alerts.revoked', {
              name: person.name,
            }));
          });
      },
      () => {
        alertError(i18n.t('people:revokePasskeys.errors.revoke'));
      },
    );
  };

  // Nothing to revoke is worth saying, and worth disabling the button
  // over: an administrator clicking it would get a success message for
  // having done nothing.
  const hasPasskeys = count !== null && count > 0;

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar>
            <PasskeyIcon />
          </Avatar>
        }
        title={
          <Typography variant="h5">
            {i18n.t('people:revokePasskeys.cTitle')}
          </Typography>
        }
        subheader={i18n.t('people:revokePasskeys.cDescription')}
      />
      <Divider />

      {isFetching && <LinearProgress />}

      <CardContent>
        <Typography variant="body2" color="textSecondary">
          {count === null ?
            i18n.t('people:revokePasskeys.unknown') :
            i18n.t('people:revokePasskeys.count', { count })}
        </Typography>
      </CardContent>

      <CardActions>
        <Button
          fullWidth
          variant="outlined"
          className={hasPasskeys ? classes.destructive : ''}
          disabled={!hasPasskeys}
          onClick={() => {
            setConfirming(true);
          }}
        >
          {i18n.t('people:revokePasskeys.actions.revoke')}
        </Button>
      </CardActions>

      <Dialog
        open={confirming}
        onClose={() => {
          setConfirming(false);
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {i18n.t('people:revokePasskeys.confirm.cTitle')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText variant="body2">
            {i18n.t('people:revokePasskeys.confirm.cDescription', {
              name: person.name,
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            fullWidth
            onClick={() => {
              setConfirming(false);
            }}
          >
            {i18n.t('commons:dismiss')}
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => {
              setConfirming(false);
              handleRevoke();
            }}
          >
            {i18n.t('people:revokePasskeys.actions.revoke')}
          </Button>
        </DialogActions>
      </Dialog>

      <StepUp
        open={stepUpOpen}
        onVerified={onVerified}
        onCancel={onCancel}
      />
    </Card>
  );
};

RevokePasskeys.propTypes = {
  person: PersonType.isRequired,
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

export default connect(
  null,
  mapDispatchToProps,
)(RevokePasskeys);
