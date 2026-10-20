import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import useRulesFirst from '../rules/useRulesFirst';

// Answering an invitation to follow a group: Decline, and Accept.
//
// The invitation is the viewer's own, to the actor given. Once answered the
// buttons give way to what was said. An invitation that is gone by the time
// a button is pressed (taken back, or lapsed) says so.
const ControlsInviteAnswer = ({
  actor,
  onAnswered = null,
  alertError,
}) => {
  const [waiting, setWaiting] = useState(false);
  // '', 'accepted', 'declined' or 'gone'.
  const [answer, setAnswer] = useState('');

  // Accepting is joining: a group's or an event's rules, ticked first
  // (roadmap row 102, part 5b).
  const rules = useRulesFirst(actor);

  const send = (accept) => {
    setWaiting(true);

    const call = accept ?
      api.socialgraph.acceptInvite({ actor }) :
      api.socialgraph.declineInvite({ actor });

    return call.then(() => {
      setAnswer(accept ? 'accepted' : 'declined');
      if (onAnswered) {
        onAnswered(accept);
      }
    }).catch((error) => {
      if (error.response && error.response.status === 404) {
        setAnswer('gone');
        return;
      }
      alertError(i18n.t('socialgraph:invite.failed'));
    }).finally(() => {
      setWaiting(false);
    });
  };

  const handle = (accept) => {
    if (accept) {
      rules.run(() => { return send(true); });
    } else {
      send(false);
    }
  };

  if (answer) {
    return (
      <Typography variant="body2" color="textSecondary">
        {i18n.t(`socialgraph:invite.answered.${answer}`)}
      </Typography>
    );
  }

  return (
    // Side by side, each half the width: the one that says no, then the
    // one that says yes.
    <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
      <Button
        fullWidth
        disabled={waiting}
        onClick={() => {
          handle(false);
        }}
      >
        {i18n.t('socialgraph:invite.decline')}
      </Button>
      <Button
        fullWidth
        variant="contained"
        color="primary"
        disabled={waiting}
        onClick={() => {
          handle(true);
        }}
      >
        {i18n.t('socialgraph:invite.accept')}
      </Button>
      {rules.dialog}
    </Stack>
  );
};

ControlsInviteAnswer.propTypes = {
  // What the viewer was invited to follow. Its id is all that is used.
  actor: PropTypes.object.isRequired,
  // Called with true when accepted, false when declined.
  onAnswered: PropTypes.func,
  alertError: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(null, mapDispatchToProps)(ControlsInviteAnswer);
