import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import api from '../../api';
import i18n from '../../languages';
import events from '../../utils/events';

// Where an event is: one of the places this installation knows, found by
// name as it is typed.
//
// A place is a location tagged on the event, the way one is tagged on a
// post. This picks among the ones there are. A place nobody has added yet
// is added from the event's Locations tab, which has the map for it.
const EventPlaceField = ({
  value = null,
  onChange,
  disabled = false,
}) => {
  const [typed, setTyped] = useState('');
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // The list follows what is typed, a moment after the typing stops.
  useEffect(() => {
    let current = true;
    setIsLoading(true);

    const timer = setTimeout(() => {
      api.locations.browse({ q: typed, start: 0, limit: 20 }).then((result) => {
        if (current) {
          setOptions(result.data.data || []);
        }
      }).catch(() => {
        if (current) {
          setOptions([]);
        }
      }).finally(() => {
        if (current) {
          setIsLoading(false);
        }
      });
    }, 300);

    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [typed]);

  return (
    <Autocomplete
      options={options}
      value={value}
      disabled={disabled}
      loading={isLoading}
      // What matches is the server's to say, by name and by address.
      filterOptions={(all) => {
        return all;
      }}
      isOptionEqualToValue={(option, chosen) => {
        return option.id === chosen.id;
      }}
      getOptionLabel={events.placeLabel}
      onChange={(event, place) => {
        onChange(place);
      }}
      onInputChange={(event, text, reason) => {
        // Not when a place is chosen: that would search for its whole
        // label and find nothing.
        if (reason === 'input' || reason === 'clear') {
          setTyped(text);
        }
      }}
      noOptionsText={i18n.t('events:event.form.placeNone')}
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            label={i18n.t('events:event.form.place')}
            helperText={i18n.t('events:event.form.placeHelp')}
          />
        );
      }}
    />
  );
};

EventPlaceField.propTypes = {
  // The place chosen, a location, or null.
  value: PropTypes.object,
  // Called with the place chosen, or null when it is cleared.
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default EventPlaceField;
