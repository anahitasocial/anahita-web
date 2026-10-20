import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import DialogConfirm from '../../components/DialogConfirm';
import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import events from '../../utils/events';
import utils from '../../utils';

// Cancelling an event, in the Danger zone of its settings.
//
// It is here and not on the event's page because it cannot be undone, and
// because it is one of the things to choose between: an event that is not
// going ahead is cancelled, which tells everybody going and leaves the page
// where it is, and is not archived or deleted. It is the first card for
// that reason.
//
// An event that is over, or was cancelled already, says so and has no
// button.
const EventCancelSetting = ({
  actor,
  readActor,
  alertSuccess,
  alertError,
}) => {
  const [waiting, setWaiting] = useState(false);
  const event = actor.event || {};

  const handleCancel = () => {
    setWaiting(true);

    api.eventDetails.cancel(actor).then(() => {
      alertSuccess(i18n.t('events:event.cancel.done'));
      return readActor(utils.node.readIdentifier(actor, 'events'));
    }).catch(() => {
      alertError(i18n.t('events:event.cancel.failed'));
    }).finally(() => {
      setWaiting(false);
    });
  };

  if (!events.takesAnswers(event)) {
    return (
      <CardContent>
        <Typography variant="body2" color="textSecondary">
          {i18n.t(event.state === 'cancelled' ?
            'events:event.cancel.already' :
            'events:event.cancel.over')}
        </Typography>
      </CardContent>
    );
  }

  return (
    <>
      <CardContent>
        <Typography variant="body2" color="textSecondary">
          {i18n.t('events:event.cancel.message')}
        </Typography>
      </CardContent>
      <CardActions>
        <DialogConfirm
          title={i18n.t('events:event.cancel.title')}
          message={i18n.t('events:event.cancel.message')}
          confirm={i18n.t('events:event.cancel.confirm')}
          dismiss={i18n.t('events:event.cancel.keep')}
        >
          <Button
            color="secondary"
            variant="contained"
            disabled={waiting}
            onClick={handleCancel}
          >
            {i18n.t('events:event.cancel.action')}
          </Button>
        </DialogConfirm>
      </CardActions>
    </>
  );
};

EventCancelSetting.propTypes = {
  // The event, as an actor with its `event` block.
  actor: PropTypes.object.isRequired,
  readActor: PropTypes.func.isRequired,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const { events: { current: actor } } = state.events;

  return { actor };
};

const mapDispatchToProps = (dispatch) => {
  return {
    readActor: (id) => {
      return dispatch(actions.events.read(id, 'events'));
    },
    alertSuccess: (message) => {
      return dispatch(actions.app.alert.success(message));
    },
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EventCancelSetting);
