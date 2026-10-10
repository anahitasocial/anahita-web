import React from 'react';
import PropTypes from 'prop-types';

import Typography from '@mui/material/Typography';

import i18n from '../../languages';
import events from '../../utils/events';

// When an event is, as the reader's own clocks have it.
//
// The times are stored as instants, so they are shown in the zone of
// whoever is reading. When that is not the zone the event was planned in,
// a second line says what time it is there: somebody travelling to it
// wants that one.
const EventWhen = ({ event, dense = false }) => {
  const zone = events.browserZone();
  const locale = i18n.language || 'en-GB';
  const here = events.when(event.startsAt, event.endsAt, zone, locale);

  if (!here) {
    return null;
  }

  const text = here.sameDay ?
    i18n.t('events:event.when.sameDay', here) :
    i18n.t('events:event.when.range', here);

  const there = event.timezoneName && event.timezoneName !== zone ?
    events.when(event.startsAt, event.endsAt, event.timezoneName, locale) :
    null;

  return (
    <>
      <Typography variant={dense ? 'body2' : 'body1'}>
        {text}
      </Typography>
      {!dense && there &&
        <Typography variant="body2" color="textSecondary">
          {i18n.t('events:event.when.eventZone', {
            zone: events.zoneLabel(event.timezoneName),
            time: there.sameDay ?
              i18n.t('events:event.when.sameDay', there) :
              i18n.t('events:event.when.range', there),
          })}
        </Typography>}
    </>
  );
};

EventWhen.propTypes = {
  // The `event` block of an event actor.
  event: PropTypes.object.isRequired,
  // One smaller line, for a card in a list.
  dense: PropTypes.bool,
};

export default EventWhen;
