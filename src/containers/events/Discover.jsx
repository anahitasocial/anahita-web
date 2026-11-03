import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import EventIcon from '@mui/icons-material/EventOutlined';

import EmptyList from '../../components/EmptyList';
import Masonry from '../../components/BreakpointMasonry';
import Progress from '../../components/Progress';
import EventCard from './Card';
import EventsList from './List';
import useSuggestions from '../recommendations/useSuggestions';
import api from '../../api';
import i18n from '../../languages';
import events from '../../utils/events';
import recommendations from '../../utils/recommendations';

// The most suggestions asked for, which the recommendation service sends
// whole rather than a page at a time.
const SUGGESTED = 50;

// Events suggested to the viewer by the recommendation service, each with
// why, narrowed in the browser to the same when and where as the list.
const ForYou = ({ span, online, empty }) => {
  const {
    items,
    related,
    isLoading,
    dismiss,
  } = useSuggestions('event', SUGGESTED);

  if (isLoading) {
    return <Progress />;
  }

  const shown = items.filter((item) => {
    const event = (item.actor && item.actor.event) || null;
    return events.isOnIn(event, span) && (!online || Boolean(event && event.hasOnlineUrl));
  });

  if (shown.length === 0) {
    return <EmptyList icon={<EventIcon />}>{empty}</EmptyList>;
  }

  return (
    <Masonry>
      {shown.map((item) => {
        const { actor } = item;
        return (
          <Box key={`suggested-event-${actor.id}`} sx={{ mb: 2 }}>
            <EventCard
              actor={actor}
              note={recommendations.reasonText(item, related, i18n.t.bind(i18n), 'event')}
              action={
                <Button
                  fullWidth
                  onClick={() => {
                    dismiss(actor).catch(() => {
                      // Shown again next time; nothing else to do.
                    });
                  }}
                >
                  {i18n.t('recommendations:dismiss')}
                </Button>
              }
            />
          </Box>
        );
      })}
    </Masonry>
  );
};

ForYou.propTypes = {
  span: PropTypes.shape({
    from: PropTypes.instanceOf(Date),
    to: PropTypes.instanceOf(Date),
  }),
  online: PropTypes.bool.isRequired,
  empty: PropTypes.string.isRequired,
};

// What is on: every event still to come that the viewer may see, soonest
// first, whoever hosts it (GET /events/). Three choices over it, kept in the
// address so a list can be linked to: when, from today to this month, on
// the reader's own calendar; where, anywhere or online; and whose, for
// somebody signed in: everyone's, the ones somebody they follow hosts or is
// going to, or the ones suggested to them, each with why.
//
// Everyone's is in date order, never ranked: For you is a choice somebody
// makes, and says why each one is there.
const DiscoverEvents = ({ isAuthenticated }) => {
  const [params, setParams] = useSearchParams();
  const pick = (name, options) => {
    const asked = params.get(name);
    return options.includes(asked) ? asked : options[0];
  };
  const whoOptions = isAuthenticated ? events.WHO : [events.WHO[0]];
  const when = pick('when', events.WHEN);
  const where = pick('where', events.WHERE);
  const who = pick('who', whoOptions);

  const online = where === 'online';
  const span = events.windowOf(when);
  const narrowed = when !== events.WHEN[0] || online || who !== events.WHO[0];
  const empty = i18n.t(narrowed ? 'events:discover.noneMatching' : 'events:discover.none');

  const read = useCallback(({ start, limit }) => {
    return api.eventDetails.discover({
      start,
      limit,
      from: span ? span.from : null,
      to: span ? span.to : null,
      online,
      following: who === 'following',
    });
  }, [when, where, who]);

  const choose = (name, options) => {
    return (event) => {
      const next = new URLSearchParams(params);
      if (event.target.value === options[0]) {
        next.delete(name);
      } else {
        next.set(name, event.target.value);
      }
      setParams(next, { replace: true });
    };
  };

  const select = (name, value, options) => {
    return (
      <TextField
        select
        size="small"
        fullWidth
        label={i18n.t(`events:discover.${name}.label`)}
        value={value}
        onChange={choose(name, options)}
      >
        {options.map((option) => {
          return (
            <MenuItem key={option} value={option}>
              {i18n.t(`events:discover.${name}.${option}`)}
            </MenuItem>
          );
        })}
      </TextField>
    );
  };

  return (
    <section aria-label={i18n.t('events:discover.title')}>
      <Stack direction="row" spacing={1} sx={{ mb: 2, pt: 1 }}>
        {select('when', when, events.WHEN)}
        {select('where', where, events.WHERE)}
        {isAuthenticated && select('who', who, whoOptions)}
      </Stack>
      {who === 'forYou' ?
        <ForYou span={span} online={online} empty={empty} /> :
        <EventsList key={`discover-${when}-${where}-${who}`} read={read} empty={empty} />}
    </section>
  );
};

DiscoverEvents.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
};

export default DiscoverEvents;
