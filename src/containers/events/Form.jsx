import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import events from '../../utils/events';
import utils from '../../utils';

const { getURL, getActorName } = utils.node;

const ACCESS = ['public', 'registered', 'followers'];

// What the form starts from: an event being changed, or an empty one in the
// browser's own zone.
const startingValues = (actor) => {
  const event = (actor && actor.event) || {};
  const zone = event.timezoneName || events.browserZone();

  return {
    name: (actor && actor.name) || '',
    body: (actor && actor.body) || '',
    timezoneName: zone,
    // Shown on the clocks of the event's zone, which is where it was
    // chosen.
    startsAt: event.startsAt ? events.instantToWall(event.startsAt, zone) : '',
    endsAt: event.endsAt ? events.instantToWall(event.endsAt, zone) : '',
    capacity: event.capacity ? String(event.capacity) : '',
    onlineUrl: event.onlineUrl || '',
    access: 'public',
  };
};

// Making an event, or changing one.
//
// The times are chosen as they will be on the clocks where the event is:
// "7 pm" with the zone beside it, whatever zone the browser is in. They are
// sent as instants with the zone's name, which is how they are kept.
//
// Who can see it is asked when it is made. Afterwards that is under the
// event's settings, with the rest of its access, as for a group.
const EventForm = ({
  actor = null,
  host = null,
  alertError,
}) => {
  const navigate = useNavigate();
  const isNew = !actor;
  const [values, setValues] = useState(startingValues(actor));
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const set = (name) => {
    return (event) => {
      setValues({ ...values, [name]: event.target.value });
      setError('');
    };
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const timesError = events.timesError(values.startsAt, values.endsAt, values.timezoneName);
    if (timesError) {
      setError(timesError);
      return;
    }

    const fields = {
      name: values.name.trim(),
      body: values.body,
      startsAt: events.toServer(values.startsAt, values.timezoneName),
      endsAt: events.toServer(values.endsAt, values.timezoneName),
      timezoneName: values.timezoneName,
      capacity: Number(values.capacity) || 0,
      onlineUrl: values.onlineUrl.trim(),
    };

    if (isNew) {
      fields.access = values.access;
      if (host) {
        fields.hostGroupId = host.id;
      }
    }

    setIsSaving(true);

    const call = isNew ? api.eventDetails.add(fields) : api.eventDetails.edit(actor, fields);

    call.then((result) => {
      navigate(getURL(result.data));
    }).catch((failure) => {
      const reason = failure.response && failure.response.data && failure.response.data.error;
      const known = i18n.exists(`events:event.form.errors.${reason}`);
      if (known) {
        setError(reason);
      } else {
        alertError(i18n.t('events:event.form.errors.generic'));
      }
      setIsSaving(false);
    });
  };

  const timeError = ['invalid_time', 'ends_before_start', 'too_long', 'already_over'].includes(error);

  return (
    <Card component="form" onSubmit={handleSubmit}>
      <CardHeader
        title={isNew ? i18n.t('events:add.cTitle') : i18n.t('events:event.form.edit')}
        subheader={host ?
          i18n.t('events:event.form.hostedBy', { name: getActorName(host) }) :
          null}
      />
      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={2}>
          <TextField
            required
            fullWidth
            label={i18n.t('events:event.form.name')}
            value={values.name}
            onChange={set('name')}
            disabled={isSaving}
            slotProps={{ htmlInput: { maxLength: 100 } }}
          />
          <TextField
            fullWidth
            multiline
            minRows={3}
            label={i18n.t('events:event.form.body')}
            value={values.body}
            onChange={set('body')}
            disabled={isSaving}
            slotProps={{ htmlInput: { maxLength: 10000, dir: 'auto' } }}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              required
              fullWidth
              type="datetime-local"
              label={i18n.t('events:event.form.startsAt')}
              value={values.startsAt}
              onChange={set('startsAt')}
              disabled={isSaving}
              error={timeError}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              required
              fullWidth
              type="datetime-local"
              label={i18n.t('events:event.form.endsAt')}
              value={values.endsAt}
              onChange={set('endsAt')}
              disabled={isSaving}
              error={timeError}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { min: values.startsAt || undefined },
              }}
            />
          </Stack>
          <Autocomplete
            disableClearable
            options={events.zones(values.timezoneName)}
            value={values.timezoneName}
            disabled={isSaving}
            onChange={(event, zone) => {
              setValues({ ...values, timezoneName: zone });
              setError('');
            }}
            getOptionLabel={(zone) => {
              return zone.replace(/_/g, ' ');
            }}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  required
                  label={i18n.t('events:event.form.timezone')}
                  error={error === 'invalid_timezone'}
                />
              );
            }}
          />
          {error &&
            <Typography variant="body2" color="error" role="alert">
              {i18n.t(`events:event.form.errors.${error}`)}
            </Typography>}
          <TextField
            fullWidth
            type="number"
            label={i18n.t('events:event.form.capacity')}
            helperText={i18n.t('events:event.form.capacityHelp')}
            value={values.capacity}
            onChange={set('capacity')}
            disabled={isSaving}
            slotProps={{ htmlInput: { min: 0, max: 100000, step: 1 } }}
          />
          <TextField
            fullWidth
            type="url"
            label={i18n.t('events:event.form.onlineUrl')}
            helperText={i18n.t('events:event.form.onlineUrlHelp')}
            value={values.onlineUrl}
            onChange={set('onlineUrl')}
            disabled={isSaving}
            slotProps={{ htmlInput: { maxLength: 512 } }}
          />
          {isNew &&
            <FormControl disabled={isSaving}>
              <FormLabel id="event-access">
                {i18n.t('events:event.form.access')}
              </FormLabel>
              <RadioGroup
                aria-labelledby="event-access"
                name="event-access"
                value={values.access}
                onChange={set('access')}
              >
                {ACCESS.map((access) => {
                  return (
                    <FormControlLabel
                      key={access}
                      value={access}
                      control={<Radio />}
                      label={i18n.t(`events:event.form.accessOptions.${access}`)}
                    />
                  );
                })}
              </RadioGroup>
            </FormControl>}
          {/* Side by side, each half the width: Cancel, then the one that
              does it. */}
          <Stack direction="row" spacing={1}>
            <Button
              fullWidth
              disabled={isSaving}
              onClick={() => {
                navigate(actor ? getURL(actor) : '/events');
              }}
            >
              {i18n.t('actions:cancel')}
            </Button>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSaving || !values.name.trim()}
            >
              {!isSaving && (isNew ?
                i18n.t('events:event.form.create') :
                i18n.t('events:event.form.save'))}
              {isSaving && <CircularProgress size={24} />}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

EventForm.propTypes = {
  // The event being changed. Left out to make a new one.
  actor: PropTypes.object,
  // A group that is to host a new event.
  host: PropTypes.object,
  alertError: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(null, mapDispatchToProps)(EventForm);
