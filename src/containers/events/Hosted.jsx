import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import EventsList from './List';
import api from '../../api';
import i18n from '../../languages';
import events from '../../utils/events';

const FILTERS = [events.UPCOMING, events.PAST];

// The events a group hosts, on the group's page: the ones to come, or the
// ones that are over. Whoever administers the group can add one from here,
// which makes it the group's.
const EventsHosted = ({ group, canAdd = false }) => {
  const [filter, setFilter] = useState(events.UPCOMING);

  const read = useCallback(({ start, limit }) => {
    return api.eventDetails.hostedBy({
      group,
      filter,
      start,
      limit,
    });
  }, [group.id, filter]);

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ mb: 2, justifyContent: 'space-between' }}>
        <ToggleButtonGroup
          size="small"
          color="primary"
          exclusive
          value={filter}
          aria-label={i18n.t('events:cTitle')}
          onChange={(event, value) => {
            if (value) {
              setFilter(value);
            }
          }}
        >
          {FILTERS.map((each) => {
            return (
              <ToggleButton key={each} value={each} sx={{ px: 2 }}>
                {i18n.t(`events:event.mine.${each}`)}
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>
        {canAdd &&
          <Button
            variant="contained"
            component={RouterLink}
            to={`/events/add?host=${group.id}`}
          >
            {i18n.t('events:event.add')}
          </Button>}
      </Stack>
      <Box>
        <EventsList
          key={`hosted-${group.id}-${filter}`}
          read={read}
          empty={i18n.t('events:event.none.hosted')}
        />
      </Box>
    </>
  );
};

EventsHosted.propTypes = {
  group: PropTypes.object.isRequired,
  // Whether the viewer administers the group, and may add an event to it.
  canAdd: PropTypes.bool,
};

export default EventsHosted;
