import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import MuteIcon from '@mui/icons-material/VolumeOffOutlined';
import UnmuteIcon from '@mui/icons-material/VolumeUpOutlined';

import actions from '../../actions';
import api from '../../api';
import { Socialgraph as SOCIALGRAPH } from '../../constants';
import i18n from '../../languages';
import actorPermissions from '../../permissions/actor';
import utils from '../../utils';
import { LENGTHS } from '../../utils/mutes';

const { getActorName } = utils.node;

// Muting somebody (roadmap row 133), for a menu: the menu offers Mute or
// Unmute and closes; the dialog that asks how is drawn apart from it, as
// Report's is, so that nothing is left open behind it.
//
//   const mute = useMute(viewer, person);
//   {mute.canMute && <MenuItem onClick={() => { close(); mute.toggle(); }}>
//     <MenuItemLabel icon={mute.icon}>{mute.label}</MenuItemLabel></MenuItem>}
//   {mute.dialog}
//
// Muting asks whether their notifications are hidden too, and for how
// long; unmuting is at once. Nobody is told. Once muted, what they posted
// leaves the feeds already open (reducers/createFeed.js); the server leaves
// them out of every list read after. `onChange` is told whether they are
// muted now.
const useMute = (viewer, actor, onChange = null) => {
  const dispatch = useDispatch();
  const [muted, setMuted] = useState(Boolean(actor && actor.isMutedByViewer));
  const [asking, setAsking] = useState(false);
  const [hideNotifications, setHideNotifications] = useState(true);
  const [length, setLength] = useState('always');
  const [waiting, setWaiting] = useState(false);

  const canMute = Boolean(viewer && viewer.id) && actorPermissions.canMute(actor, viewer);

  // As the profile says, when it is read again.
  useEffect(() => {
    setMuted(Boolean(actor && actor.isMutedByViewer));
  }, [actor && actor.id, actor && actor.isMutedByViewer]);

  const failed = () => {
    dispatch(actions.app.alert.error(i18n.t('socialgraph:mute.failed')));
  };

  const done = (now) => {
    setMuted(now);
    if (onChange) {
      onChange(now);
    }
  };

  const mute = () => {
    setWaiting(true);
    api.socialgraph.mute({
      actor,
      viewer,
      hideNotifications,
      length: length === 'always' ? '' : length,
    }).then(() => {
      setAsking(false);
      dispatch({ type: SOCIALGRAPH.MUTE.SUCCESS, actor });
      done(true);
    }).catch(failed).finally(() => {
      setWaiting(false);
    });
  };

  const unmute = () => {
    setWaiting(true);
    api.socialgraph.unmute({ actor, viewer }).then(() => {
      done(false);
    }).catch(failed).finally(() => {
      setWaiting(false);
    });
  };

  const close = () => {
    if (!waiting) {
      setAsking(false);
    }
  };

  const dialog = canMute && asking ? (
    <Dialog
      open
      onClose={close}
      fullWidth
      maxWidth="xs"
      aria-labelledby={`mute-title-${actor.id}`}
    >
      <DialogTitle id={`mute-title-${actor.id}`}>
        {i18n.t('socialgraph:mute.title', { name: getActorName(actor) })}
      </DialogTitle>
      <DialogContent>
        <DialogContentText variant="body2">
          {i18n.t('socialgraph:mute.help')}
        </DialogContentText>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={hideNotifications}
              onChange={(event) => {
                setHideNotifications(event.target.checked);
              }}
            />
          }
          label={i18n.t('socialgraph:mute.hideNotifications')}
          disabled={waiting}
          sx={{ mt: 1 }}
        />
        <TextField
          select
          size="small"
          label={i18n.t('socialgraph:mute.for')}
          value={length}
          onChange={(event) => {
            setLength(event.target.value);
          }}
          disabled={waiting}
          fullWidth
          sx={{ mt: 2 }}
        >
          {LENGTHS.map((each) => {
            return (
              <MenuItem key={`mute-for-${each}`} value={each}>
                {i18n.t(`socialgraph:mute.lengths.${each}`)}
              </MenuItem>
            );
          })}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button fullWidth onClick={close} disabled={waiting}>
          {i18n.t('actions:cancel')}
        </Button>
        <Button fullWidth variant="contained" onClick={mute} disabled={waiting}>
          {i18n.t('actions:mute')}
        </Button>
      </DialogActions>
    </Dialog>
  ) : null;

  return {
    canMute,
    muted,
    label: i18n.t(muted ? 'actions:unmute' : 'actions:mute'),
    icon: muted ? <UnmuteIcon fontSize="small" /> : <MuteIcon fontSize="small" />,
    // Unmutes at once, or asks how to mute.
    toggle: () => {
      if (muted) {
        unmute();
        return;
      }
      setAsking(true);
    },
    dialog,
  };
};

export default useMute;
