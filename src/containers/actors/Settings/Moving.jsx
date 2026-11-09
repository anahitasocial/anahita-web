import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import MoveInIcon from '@mui/icons-material/LoginOutlined';
import MoveOutIcon from '@mui/icons-material/LogoutOutlined';

import DialogConfirm from '../../../components/DialogConfirm';
import StepUp from '../../auth/StepUp';
import actions from '../../../actions';
import api from '../../../api';
import federation from '../../../utils/federation';
import i18n from '../../../languages';

// Why a handle was not taken, as the server says it; anything else is
// "That did not work".
const ERRORS = [
  'lookup_not_found',
  'lookup_is_here',
  'lookup_not_a_person',
  'lookup_refused',
  'lookup_unreadable',
  'lookup_failed',
  'not_named_there',
  'moved_lately',
  'too_many_aliases',
];

const ALIASES_MAX = 5;

const codeOf = (error) => {
  const code = error && error.response && error.response.data && error.response.data.error;
  return ERRORS.includes(code) ? code : 'failed';
};

const dayOf = (at) => {
  return at ? new Date(at).toLocaleDateString(i18n.language, { dateStyle: 'long' }) : '';
};

const handleOf = (account) => {
  return account ? `@${account.handle || account.uri}` : '';
};

// Moving one's account (roadmap row 124, part 3), under Settings ›
// Fediverse, in two cards.
//
// Moving here: the old accounts this one also is, which the old server
// checks before it lets the person move from there; their followers then
// follow them here.
//
// Moving away: to an account elsewhere that names this one, after proving
// who one is again. The followers follow the new account, the posts stay,
// and this account becomes a signpost that posts, follows and likes no
// more. Not to an account here: a username is changed instead.
//
// For somebody on the fediverse; on an installation with no fediverse
// service nothing is drawn.
const ActorsSettingsMoving = ({ alertSuccess }) => {
  const [isAbsent, setIsAbsent] = useState(false);
  const [enabled, setEnabled] = useState(null);
  const [aliases, setAliases] = useState([]);
  const [status, setStatus] = useState(null);
  const [newAlias, setNewAlias] = useState('');
  const [aliasError, setAliasError] = useState('');
  const [moveTo, setMoveTo] = useState('');
  const [moveError, setMoveError] = useState('');
  const [isWorking, setIsWorking] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [stepUpOpen, setStepUpOpen] = useState(false);

  const load = () => {
    return Promise.all([
      api.federation.settings(),
      api.federation.aliases(),
      api.federation.moveStatus(),
    ]).then(([settings, named, moved]) => {
      setEnabled(Boolean(settings.data.enabled));
      setAliases(named.data.alsoKnownAs || []);
      setStatus(moved.data || {});
    }).catch((error) => {
      // No fediverse service, or the viewer not a person here: nothing
      // to move, and nothing drawn.
      setIsAbsent(federation.isAbsent(error) || Boolean(error));
    });
  };

  useEffect(() => {
    load();
  }, []);

  if (isAbsent || enabled === null || !status) {
    return null;
  }

  const saveAliases = (handles) => {
    setIsWorking(true);
    setAliasError('');
    return api.federation.setAliases(handles).then((result) => {
      setAliases(result.data.alsoKnownAs || []);
      setNewAlias('');
    }).catch((error) => {
      setAliasError(i18n.t(`settings:moving.errors.${codeOf(error)}`));
    }).finally(() => {
      setIsWorking(false);
    });
  };

  const addAlias = () => {
    const handle = newAlias.trim();
    if (!handle) {
      return;
    }
    saveAliases([...aliases.map((a) => { return a.uri; }), handle]);
  };

  const move = () => {
    setIsWorking(true);
    setMoveError('');
    api.federation.move(moveTo.trim()).then((result) => {
      setStatus(result.data || {});
      alertSuccess(i18n.t('settings:moving.away.done'));
    }).catch((error) => {
      const code = error && error.response && error.response.data && error.response.data.error;
      if (error && error.response && error.response.status === 403 && code === 'step_up_required') {
        setStepUpOpen(true);
        return;
      }
      setMoveError(i18n.t(`settings:moving.errors.${codeOf(error)}`));
    }).finally(() => {
      setIsWorking(false);
    });
  };

  const comeBack = () => {
    setIsWorking(true);
    api.federation.comeBack().then((result) => {
      setStatus(result.data || {});
      alertSuccess(i18n.t('settings:moving.away.back'));
    }).catch(() => {
      setMoveError(i18n.t('settings:moving.errors.failed'));
    }).finally(() => {
      setIsWorking(false);
    });
  };

  const { movedTo } = status;
  const { mayMoveAt } = status;

  return (
    <Stack spacing={2}>
      <Card>
        {/* Opposite arrows, in and out, as the cards beside them have their
            pictures. */}
        <CardHeader
          avatar={<Avatar><MoveInIcon /></Avatar>}
          title={i18n.t('settings:moving.here.title')}
        />
        <Divider />
        <CardContent>
          <Typography variant="body2" color="textSecondary">
            {i18n.t('settings:moving.here.about')}
          </Typography>
          {!enabled &&
            <Alert severity="info" sx={{ mt: 2 }}>
              {i18n.t('settings:moving.notOnFediverse')}
            </Alert>}
          {aliases.length > 0 &&
            <List dense sx={{ mt: 1 }}>
              {aliases.map((alias) => {
                return (
                  <ListItem
                    key={`alias-${alias.uri}`}
                    disableGutters
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label={i18n.t('actions:remove')}
                        disabled={isWorking}
                        onClick={() => {
                          const kept = aliases.filter((a) => { return a.uri !== alias.uri; });
                          saveAliases(kept.map((a) => { return a.uri; }));
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={handleOf(alias)} sx={{ overflowWrap: 'anywhere' }} />
                  </ListItem>
                );
              })}
            </List>}
          {enabled && aliases.length < ALIASES_MAX &&
            <TextField
              size="small"
              fullWidth
              label={i18n.t('settings:moving.here.label')}
              placeholder="ana@old.example"
              value={newAlias}
              disabled={isWorking}
              error={Boolean(aliasError)}
              helperText={aliasError || ' '}
              onChange={(event) => { setNewAlias(event.target.value); }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addAlias();
                }
              }}
              sx={{ mt: 2 }}
            />}
        </CardContent>
        {enabled && aliases.length < ALIASES_MAX &&
          <CardActions>
            <Button
              fullWidth
              variant="contained"
              disabled={isWorking || !newAlias.trim()}
              onClick={addAlias}
            >
              {i18n.t('actions:add')}
            </Button>
          </CardActions>}
      </Card>

      <Card>
        <CardHeader
          avatar={<Avatar><MoveOutIcon /></Avatar>}
          title={i18n.t('settings:moving.away.title')}
        />
        <Divider />
        <CardContent>
          {movedTo ?
            <Typography variant="body2" color="textSecondary">
              {i18n.t('settings:moving.away.moved', { handle: handleOf(movedTo), day: dayOf(status.movedAt) })}
            </Typography> :
            <>
              <Typography variant="body2" color="textSecondary">
                {i18n.t('settings:moving.away.about')}
              </Typography>
              {!enabled &&
                <Alert severity="info" sx={{ mt: 2 }}>
                  {i18n.t('settings:moving.notOnFediverse')}
                </Alert>}
              {enabled &&
                <TextField
                  size="small"
                  fullWidth
                  label={i18n.t('settings:moving.away.label')}
                  placeholder="ana@new.example"
                  value={moveTo}
                  disabled={isWorking || Boolean(mayMoveAt)}
                  error={Boolean(moveError)}
                  helperText={moveError ||
                    (mayMoveAt ? i18n.t('settings:moving.away.again', { day: dayOf(mayMoveAt) }) : ' ')}
                  onChange={(event) => { setMoveTo(event.target.value); }}
                  sx={{ mt: 2 }}
                />}
            </>}
        </CardContent>
        {/* Moved: the one thing left to do here is to take it back. */}
        {movedTo &&
          <CardActions>
            <Button fullWidth disabled={isWorking} onClick={comeBack}>
              {i18n.t('settings:moving.away.comeBack')}
            </Button>
          </CardActions>}
        {enabled && !movedTo &&
          <CardActions>
            <Button
              fullWidth
              variant="contained"
              disabled={isWorking || Boolean(mayMoveAt) || !moveTo.trim()}
              onClick={() => { setConfirmOpen(true); }}
            >
              {i18n.t('settings:moving.away.move')}
            </Button>
          </CardActions>}
      </Card>

      <DialogConfirm
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); }}
        onConfirm={() => {
          setConfirmOpen(false);
          move();
        }}
        title={i18n.t('settings:moving.away.confirmTitle', { handle: `@${moveTo.trim().replace(/^@/, '')}` })}
        message={i18n.t('settings:moving.away.confirm')}
        confirm={i18n.t('settings:moving.away.move')}
      />
      <StepUp
        open={stepUpOpen}
        onVerified={() => {
          setStepUpOpen(false);
          move();
        }}
        onCancel={() => {
          return setStepUpOpen(false);
        }}
      />
    </Stack>
  );
};

ActorsSettingsMoving.propTypes = {
  alertSuccess: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertSuccess: (message) => {
      return dispatch(actions.app.alert.success(message));
    },
  };
};

export default connect(null, mapDispatchToProps)(ActorsSettingsMoving);
