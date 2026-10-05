import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import PrivacyIcon from '@mui/icons-material/Policy';
import ConvertIcon from '@mui/icons-material/LockPerson';

import StepUp from '../auth/StepUp';
import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';

import useStepUp from './useStepUp';

// The privacy of the installation: what it is set to, and the one thing
// about it that is done from here.
//
// The two settings are the server's (SITE_READ_ACCESS and
// MIN_CONTENT_ACCESS) and are shown, not edited: changing either means
// restarting every service, which is not something a page should offer.
// They are read from NodeInfo, like every other instance setting.
//
// The second card converts what is already public. Stopping new public
// content does not reach back, on purpose: an installation may want its
// old posts to stay readable. One that does not presses this, once.
//
// It is as final as a purge and gets the same three steps: what it will
// change, the number typed out, and a proof of identity. The number is
// what is public at that moment; if it has moved by the time the request
// arrives the server refuses, and the new number is shown.
const SettingsPrivacy = ({
  readAccess = 'public',
  minContentAccess = 'public',
  alertSuccess,
  alertError,
}) => {
  const [counts, setCounts] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [confirmation, setConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    stepUpOpen,
    runGuarded,
    onVerified,
    onCancel,
  } = useStepUp();

  const canConvert = minContentAccess === 'registered';

  const load = useCallback(() => {
    setIsFetching(true);

    return api.accounts.publicContent()
      .then(({ data }) => {
        setCounts(data);
      })
      .catch(() => {
        alertError(i18n.t('settings:privacy.convert.errors.load'));
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [alertError]);

  // Only counted where the answer can be acted on.
  useEffect(() => {
    if (canConvert) {
      load();
    } else {
      setIsFetching(false);
    }
  }, [canConvert, load]);

  const total = counts ? counts.total : 0;
  const phrase = `CONVERT ${total}`;
  const confirmed = confirmation.trim() === phrase;

  const convert = () => {
    setSubmitting(true);

    return runGuarded(
      () => {
        return api.accounts.makeRegistered(total).then(({ data }) => {
          alertSuccess(i18n.t('settings:privacy.convert.done', {
            people: data.people,
            groups: data.groups,
            posts: data.posts,
          }));
          setConfirmation('');
          return load();
        });
      },
      (err) => {
        const status = err && err.response && err.response.status;
        const body = (err && err.response && err.response.data) || {};

        // Somebody posted, or changed a profile, since the count was
        // read. Show the new number; the old confirmation no longer
        // matches it, which is the point.
        if (status === 400 && body.error === 'confirmation_mismatch') {
          alertError(i18n.t('settings:privacy.convert.errors.mismatch'));
          setConfirmation('');
          load();
          return;
        }

        if (status === 403) {
          alertError(i18n.t('settings:privacy.convert.errors.forbidden'));
          return;
        }

        alertError(body.message || i18n.t('settings:privacy.convert.errors.generic'));
      },
    ).finally(() => {
      setSubmitting(false);
    });
  };

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Card>
          <CardHeader
            avatar={
              <Avatar>
                <PrivacyIcon />
              </Avatar>
            }
            title={
              <Typography variant="h6">
                {i18n.t('settings:privacy.cTitle')}
              </Typography>
            }
            subheader={i18n.t('settings:privacy.cDescription')}
          />
          <Divider />
          <List>
            <ListItem divider>
              <ListItemText
                primary={i18n.t('settings:privacy.readAccess.label')}
                secondary={i18n.t(`settings:privacy.readAccess.${readAccess}`, {
                  defaultValue: readAccess,
                })}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={i18n.t('settings:privacy.minContentAccess.label')}
                secondary={i18n.t(`settings:privacy.minContentAccess.${minContentAccess}`, {
                  defaultValue: minContentAccess,
                })}
              />
            </ListItem>
          </List>
          <Divider />
          <CardContent>
            <Typography variant="body2" color="textSecondary">
              {i18n.t('settings:privacy.howToChange')}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Card>
        <CardHeader
          avatar={
            <Avatar>
              <ConvertIcon />
            </Avatar>
          }
          title={
            <Typography variant="h6">
              {i18n.t('settings:privacy.convert.cTitle')}
            </Typography>
          }
        />
        <Divider />
        {isFetching && <LinearProgress />}

        {!canConvert &&
          <CardContent>
            <Typography variant="body2" color="textSecondary">
              {i18n.t('settings:privacy.convert.notYet')}
            </Typography>
          </CardContent>}

        {canConvert && counts &&
          <>
            <CardContent>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {i18n.t('settings:privacy.convert.description')}
              </Typography>

              {total === 0 &&
                <Typography variant="body2">
                  {i18n.t('settings:privacy.convert.nothing')}
                </Typography>}

              {total > 0 &&
                <>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {i18n.t('settings:privacy.convert.counts', {
                      people: counts.people,
                      groups: counts.groups,
                      posts: counts.posts,
                    })}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    <strong>{i18n.t('settings:privacy.convert.permanent')}</strong>
                  </Typography>
                  <TextField
                    name="convertConfirmation"
                    label={i18n.t('settings:privacy.convert.confirmLabel', { phrase })}
                    value={confirmation}
                    onChange={(event) => {
                      setConfirmation(event.target.value);
                    }}
                    autoComplete="off"
                    variant="outlined"
                    margin="normal"
                    fullWidth
                  />
                </>}
            </CardContent>
            {total > 0 &&
              <CardActions>
                <Button
                  color="secondary"
                  variant="contained"
                  disabled={!confirmed || submitting}
                  onClick={convert}
                  fullWidth
                >
                  {submitting ?
                    i18n.t('settings:privacy.convert.working') :
                    i18n.t('settings:privacy.convert.action')}
                </Button>
              </CardActions>}
          </>}
      </Card>

      <StepUp
        open={stepUpOpen}
        onVerified={onVerified}
        onCancel={onCancel}
      />
    </>
  );
};

SettingsPrivacy.propTypes = {
  // 'public' or 'registered', both from NodeInfo.
  readAccess: PropTypes.string,
  minContentAccess: PropTypes.string,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const { nodeInfo } = state.app;
  const metadata = (nodeInfo && nodeInfo.metadata) || {};

  return {
    readAccess: metadata.readAccess,
    minContentAccess: metadata.minContentAccess,
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

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPrivacy);
