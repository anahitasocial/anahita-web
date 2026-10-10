import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import CalendarIcon from '@mui/icons-material/CalendarMonthOutlined';
import OnlineIcon from '@mui/icons-material/VideocamOutlined';
import PlaceIcon from '@mui/icons-material/PlaceOutlined';

import DialogConfirm from '../../components/DialogConfirm';
import EventAttendees from './Attendees';
import EventWhen from './When';
import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import events from '../../utils/events';
import utils from '../../utils';

const { getActorName, getURL } = utils.node;

// What an event's page has that a group's does not: when it is, who hosts
// it, how many are going, the viewer's own answer, and the way to put it in
// a calendar.
//
// Answering is Going or Maybe. Whichever the viewer chose is the filled
// button, and "Not going" beside them takes the answer back. Going is closed
// when every place is taken, unless the viewer has one. Nothing is offered
// once the event is over or was called off.
const EventPanel = ({
  actor,
  onChanged,
  isAuthenticated,
  alertError,
  alertSuccess,
}) => {
  const { event } = actor;
  const [waiting, setWaiting] = useState(false);
  const [showAttendees, setShowAttendees] = useState(false);
  // Where it is: the first place tagged on it. The rest, and the map, are
  // under its Locations tab.
  const [place, setPlace] = useState(null);

  useEffect(() => {
    let current = true;

    api.locations.browse({ source_id: actor.id, start: 0, limit: 1 }).then((result) => {
      if (current) {
        setPlace((result.data.data || [])[0] || null);
      }
    }).catch(() => {
      // Left unsaid: the Locations tab still has it.
    });

    return () => {
      current = false;
    };
  }, [actor.id]);

  if (!event) {
    return null;
  }

  const takesAnswers = events.takesAnswers(event);
  const canEdit = Boolean(actor.authorized && actor.authorized.edit);

  const answer = (rsvp) => {
    setWaiting(true);

    const call = rsvp ? api.eventDetails.rsvp(actor, rsvp) : api.eventDetails.unrsvp(actor);

    call.then(() => {
      onChanged();
    }).catch((failure) => {
      const reason = failure.response && failure.response.data && failure.response.data.error;
      if (reason === 'event_full') {
        alertError(i18n.t('events:event.rsvp.full'));
      } else if (reason === 'event_closed') {
        alertError(i18n.t('events:event.rsvp.closed'));
      } else {
        alertError(i18n.t('events:event.rsvp.failed'));
      }
      // What is on the page may be out of date: read it again.
      onChanged();
    }).finally(() => {
      setWaiting(false);
    });
  };

  const handleCalendar = () => {
    api.eventDetails.calendar(actor).then((result) => {
      const blob = new Blob([result.data], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${actor.alias || `event-${actor.id}`}.ics`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }).catch(() => {
      alertError(i18n.t('events:event.rsvp.failed'));
    });
  };

  const handleCancel = () => {
    api.eventDetails.cancel(actor).then(() => {
      alertSuccess(i18n.t('events:event.cancel.done'));
      onChanged();
    }).catch(() => {
      alertError(i18n.t('events:event.cancel.failed'));
    });
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack spacing={2}>
          {(event.state === 'cancelled' || event.state === 'past') &&
            <Alert severity={event.state === 'cancelled' ? 'error' : 'info'}>
              {i18n.t(`events:event.state.${event.state}`)}
            </Alert>}
          <Box>
            <EventWhen event={event} />
          </Box>
          {/* The address it is held at is in the About card, with its map.
              This is a place of the site's tagged on it. */}
          {place &&
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PlaceIcon fontSize="small" />
              <Link href={getURL(place)} underline="hover">
                {events.placeLabel(place)}
              </Link>
            </Typography>}
          {event.host &&
            <Typography variant="body2">
              {`${i18n.t('events:event.host')} `}
              <Link href={getURL(event.host)} underline="hover">
                {getActorName(event.host)}
              </Link>
            </Typography>}
          <Box>
            <Button
              onClick={() => {
                setShowAttendees(true);
              }}
              sx={{ px: 1, ml: -1 }}
            >
              {`${i18n.t('events:event.counts.going', { count: event.goingCount || 0 })} · ${i18n.t('events:event.counts.maybe', { count: event.maybeCount || 0 })}`}
            </Button>
            {event.capacity > 0 &&
              <Typography variant="body2" color="textSecondary">
                {i18n.t('events:event.counts.places', {
                  going: event.goingCount || 0,
                  capacity: event.capacity,
                })}
              </Typography>}
          </Box>
          {event.onlineUrl &&
            <Box>
              <Button
                variant="outlined"
                startIcon={<OnlineIcon />}
                href={event.onlineUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {i18n.t('events:event.online.join')}
              </Button>
            </Box>}
          {!event.onlineUrl && event.hasOnlineUrl &&
            <Typography variant="body2" color="textSecondary">
              {i18n.t('events:event.online.forGoing')}
            </Typography>}
          {isAuthenticated && takesAnswers &&
            <Box>
              {/* Side by side, each half the width. */}
              <Stack direction="row" spacing={1}>
                <Button
                  fullWidth
                  variant={event.viewerRsvp === events.MAYBE ? 'contained' : 'outlined'}
                  disabled={waiting}
                  onClick={() => {
                    answer(events.MAYBE);
                  }}
                >
                  {i18n.t('events:event.rsvp.maybe')}
                </Button>
                <Button
                  fullWidth
                  variant={event.viewerRsvp === events.GOING ? 'contained' : 'outlined'}
                  color="primary"
                  disabled={waiting || !events.canGo(event)}
                  onClick={() => {
                    answer(events.GOING);
                  }}
                >
                  {i18n.t('events:event.rsvp.going')}
                </Button>
              </Stack>
              {event.isFull && event.viewerRsvp !== events.GOING &&
                <Typography variant="body2" color="textSecondary" sx={{ pt: 1 }}>
                  {i18n.t('events:event.rsvp.full')}
                </Typography>}
            </Box>}
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <Button startIcon={<CalendarIcon />} onClick={handleCalendar}>
              {i18n.t('events:event.calendar')}
            </Button>
            {isAuthenticated && event.viewerRsvp &&
              <Button
                color="inherit"
                disabled={waiting}
                onClick={() => {
                  answer('');
                }}
              >
                {i18n.t('events:event.rsvp.leave')}
              </Button>}
            {canEdit &&
              <Button component={RouterLink} to={`${getURL(actor)}edit`} color="inherit">
                {i18n.t('events:event.form.edit')}
              </Button>}
            {canEdit && takesAnswers &&
              <DialogConfirm
                title={i18n.t('events:event.cancel.title')}
                message={i18n.t('events:event.cancel.message')}
                confirm={i18n.t('events:event.cancel.confirm')}
                dismiss={i18n.t('events:event.cancel.keep')}
              >
                <Button color="error" onClick={handleCancel}>
                  {i18n.t('events:event.cancel.action')}
                </Button>
              </DialogConfirm>}
          </Stack>
        </Stack>
      </CardContent>
      <EventAttendees
        actor={actor}
        open={showAttendees}
        onClose={() => {
          setShowAttendees(false);
        }}
      />
    </Card>
  );
};

EventPanel.propTypes = {
  // The event, as an actor with its `event` block.
  actor: PropTypes.object.isRequired,
  // Called when something about it changed, to read it again.
  onChanged: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  alertError: PropTypes.func.isRequired,
  alertSuccess: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    isAuthenticated: state.session.isAuthenticated,
  };
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

export default connect(mapStateToProps, mapDispatchToProps)(EventPanel);
