import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { makeStyles } from 'tss-react/mui';

import TotpIcon from '@mui/icons-material/PhonelinkLock';

import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';
import PersonType from '../../../proptypes/Person';

const useStyles = makeStyles()((theme) => {
  return {
    destructive: {
      color: theme.palette.error.main,
    },
    chip: {
      marginLeft: theme.spacing(1),
    },
  };
});

// Removing somebody else's authenticator.
//
// Administrator or super administrator, and deliberately NO step-up,
// unlike the passkey card beside it. That asymmetry is the server's and
// it is reasoned: this is the undo for a person locked out of their own
// account — a lost phone with no recovery codes left — and routing
// every one of those through a fresh proof makes the recovery slower
// than the problem it fixes.
//
// Enabled and expired come from the server rather than being assumed.
// A card that offered to remove a factor without knowing whether one
// exists would be a button whose effect nobody could predict.
const RevokeTotp = ({
  person,
  alertError,
  alertSuccess,
}) => {
  const { classes } = useStyles();
  const [status, setStatus] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api.totp.readForPerson(person.id)
      .then(({ data }) => {
        if (!cancelled) {
          setStatus((data && data.data) || null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus(null);
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
    return api.totp.deleteItem(person)
      .then(() => {
        setStatus({ enabled: false, expired: false });
        alertSuccess(i18n.t('people:revokeTotp.alerts.revoked', {
          name: person.name,
        }));
      })
      .catch(() => {
        alertError(i18n.t('people:revokeTotp.errors.revoke'));
      });
  };

  const enabled = Boolean(status && status.enabled);
  const expired = Boolean(status && status.expired);

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar>
            <TotpIcon />
          </Avatar>
        }
        title={
          <Typography variant="h5">
            {i18n.t('people:revokeTotp.cTitle')}
          </Typography>
        }
        subheader={i18n.t('people:revokeTotp.cDescription')}
      />
      <Divider />

      {isFetching && <LinearProgress />}

      <CardContent>
        <Typography variant="body2" color="textSecondary" component="span">
          {status === null && i18n.t('people:revokeTotp.unknown')}
          {status !== null && (enabled ?
            i18n.t('people:revokeTotp.enabled') :
            i18n.t('people:revokeTotp.disabled'))}
        </Typography>
        {/* Enrolled but not verified in a long time. Worth surfacing
            because it changes what removing it means: the factor is
            already failing the freshness checks elsewhere, so this is
            tidying rather than weakening. */}
        {expired &&
          <Chip
            size="small"
            variant="outlined"
            className={classes.chip}
            label={i18n.t('people:revokeTotp.expired')}
          />}
      </CardContent>

      <CardActions>
        <Button
          fullWidth
          variant="outlined"
          className={enabled ? classes.destructive : ''}
          disabled={!enabled}
          onClick={() => {
            setConfirming(true);
          }}
        >
          {i18n.t('people:revokeTotp.actions.revoke')}
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
          {i18n.t('people:revokeTotp.confirm.cTitle')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText variant="body2">
            {i18n.t('people:revokeTotp.confirm.cDescription', {
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
            {i18n.t('people:revokeTotp.actions.revoke')}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

RevokeTotp.propTypes = {
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
)(RevokeTotp);
