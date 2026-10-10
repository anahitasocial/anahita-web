import React from 'react';
import PropTypes from 'prop-types';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';

import EventIcon from '@mui/icons-material/Event';

import i18n from '../languages';
import events from '../utils/events';

// The edge of the tile, the month's size and the day's, for each size.
const SIZES = {
  small: { edge: 24, month: 0, day: 12 },
  default: { edge: 48, month: 10, day: 20 },
  large: { edge: 160, month: 28, day: 72 },
};

// What stands where an avatar would, for an event: the day it is on.
//
// An event has no picture of its own (its cover is its image). Who it is
// matters less than when, so the small square says that: the month over the
// day, on the reader's own calendar, like the times on the event's page.
//
// Where an event is named without its times, as in a notification, the tile
// is a calendar icon.
const EventDateTile = ({ actor, size = 'default' }) => {
  const { edge, month, day } = SIZES[size] || SIZES.default;
  const tile = events.dateTile(
    actor.event && actor.event.startsAt,
    events.browserZone(),
    i18n.language || 'en-GB',
  );

  return (
    <Avatar
      variant="rounded"
      aria-label={actor.name}
      sx={{
        width: edge,
        height: edge,
        // The secondary colour, so it is not taken for a button: those
        // are the primary one.
        bgcolor: 'secondary.main',
        color: 'secondary.contrastText',
        flexDirection: 'column',
        lineHeight: 1,
      }}
    >
      {!tile && <EventIcon sx={{ fontSize: edge * 0.6 }} />}
      {tile && month > 0 &&
        <Box component="span" sx={{ fontSize: month, fontWeight: 600, textTransform: 'uppercase' }}>
          {tile.month}
        </Box>}
      {tile &&
        <Box component="span" sx={{ fontSize: day, fontWeight: 600 }}>
          {tile.day}
        </Box>}
    </Avatar>
  );
};

EventDateTile.propTypes = {
  // An event, as an actor. With no `event` block the tile is an icon.
  actor: PropTypes.object.isRequired,
  size: PropTypes.oneOf(['small', 'large', 'default']),
};

export default EventDateTile;
