import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import events from '../../utils/events';

// Answering an event from outside its page: Maybe, and Going.
//
// For somebody who is let in as a follower of the group hosting it and has
// not answered yet. They are shown what the event is and when, and these.
// Once they answer they follow the event, and its page opens to them like
// anybody else's who is going.
const EventAnswer = ({
  actor,
  onAnswered = null,
  alertError,
}) => {
  const [waiting, setWaiting] = useState(false);
  const event = actor.event || {};

  const answer = (rsvp) => {
    setWaiting(true);
    api.eventDetails.rsvp(actor, rsvp).then(() => {
      if (onAnswered) {
        onAnswered(rsvp);
      }
    }).catch((failure) => {
      const reason = failure.response && failure.response.data && failure.response.data.error;
      if (reason === 'event_full') {
        alertError(i18n.t('events:event.rsvp.full'));
      } else if (reason === 'event_closed') {
        alertError(i18n.t('events:event.rsvp.closed'));
      } else {
        alertError(i18n.t('events:event.rsvp.failed'));
      }
    }).finally(() => {
      setWaiting(false);
    });
  };

  if (!events.takesAnswers(event)) {
    return null;
  }

  return (
    // Side by side, each half the width.
    <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
      <Button
        fullWidth
        variant="outlined"
        disabled={waiting}
        onClick={() => {
          answer(events.MAYBE);
        }}
      >
        {i18n.t('events:event.rsvp.maybe')}
      </Button>
      <Button
        fullWidth
        variant="contained"
        color="primary"
        disabled={waiting || !events.canGo(event)}
        onClick={() => {
          answer(events.GOING);
        }}
      >
        {i18n.t('events:event.rsvp.going')}
      </Button>
    </Stack>
  );
};

EventAnswer.propTypes = {
  // The event, as the server sent it: whole, or its name, time and
  // description for somebody let in through its host.
  actor: PropTypes.object.isRequired,
  // Called with the answer once it is recorded.
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

export default connect(null, mapDispatchToProps)(EventAnswer);
