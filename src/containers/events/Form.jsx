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
import Checkbox from '@mui/material/Checkbox';
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
    openToHostFollowers: Boolean(event.openToHostFollowers),
    // Where it is held. Sent back to whoever may change the event, who
    // is among those shown it.
    street: (event.address && event.address.street) || '',
    city: (event.address && event.address.city) || '',
    stateProvince: (event.address && event.address.stateProvince) || '',
    country: (event.address && event.address.country) || '',
    // Ticked when the event has a point on a map already. Off for a new
    // one: finding an address sends it to a mapping service.
    showMap: events.hasPoint(event.address),
  };
};

// Making an event, or changing one.
//
// The times are chosen as they will be on the clocks where the event is:
// "7 pm" with the zone beside it, whatever zone the browser is in. They are
// sent as instants with the zone's name, which is how they are kept.
//
// Where it is held is an address typed here and kept on the event. It is
// not a place on the site's map, which anybody can see: an event at
// somebody's home should not put their home on it. It is shown to whoever
// is going. A public venue can still be tagged from the event's Locations
// tab.
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
  // The group hosting it: given for a new event, and on one being changed
  // its own, when the viewer may see that group.
  const hostGroup = host || (actor && actor.event && actor.event.host) || null;

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
      // Always sent: left out, the server would take it for no.
      openToHostFollowers: Boolean(hostGroup) && values.openToHostFollowers,
      // Where it is held, every part of it, so one emptied is taken off.
      address: values.street.trim(),
      city: values.city.trim(),
      stateProvince: values.stateProvince.trim(),
      country: values.country.trim(),
      showMap: values.showMap,
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
              // Choosing when it starts also says when it ends, an hour
              // later, unless a later end was chosen already. Left empty,
              // the end is filled in by the browser with the time it is
              // now, which is usually before the start.
              onChange={(event) => {
                const startsAt = event.target.value;
                setValues({
                  ...values,
                  startsAt,
                  endsAt: events.endAfter(startsAt, values.endsAt),
                });
                setError('');
              }}
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
              // No `min` on it: the browser would refuse an earlier end
              // with a bubble of its own, in its own words, over the
              // field below. The form says it instead.
              helperText={error === 'ends_before_start' ?
                i18n.t('events:event.form.errors.ends_before_start') :
                undefined}
              slotProps={{ inputLabel: { shrink: true } }}
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
          {error && error !== 'ends_before_start' &&
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
          <Typography variant="subtitle2" component="h3">
            {i18n.t('events:event.form.address.title')}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: '0 !important' }}>
            {i18n.t('events:event.form.address.help')}
          </Typography>
          <TextField
            fullWidth
            label={i18n.t('events:event.form.address.street')}
            value={values.street}
            onChange={set('street')}
            disabled={isSaving}
            autoComplete="off"
            slotProps={{ htmlInput: { maxLength: 255 } }}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label={i18n.t('events:event.form.address.city')}
              value={values.city}
              onChange={set('city')}
              disabled={isSaving}
              autoComplete="off"
              slotProps={{ htmlInput: { maxLength: 100 } }}
            />
            <TextField
              fullWidth
              label={i18n.t('events:event.form.address.stateProvince')}
              value={values.stateProvince}
              onChange={set('stateProvince')}
              disabled={isSaving}
              autoComplete="off"
              slotProps={{ htmlInput: { maxLength: 100 } }}
            />
          </Stack>
          <TextField
            fullWidth
            label={i18n.t('events:event.form.address.country')}
            value={values.country}
            onChange={set('country')}
            disabled={isSaving}
            autoComplete="off"
            slotProps={{ htmlInput: { maxLength: 100 } }}
          />
          <div>
            <FormControlLabel
              control={
                <Checkbox
                  checked={values.showMap}
                  disabled={isSaving}
                  onChange={(event) => {
                    setValues({ ...values, showMap: event.target.checked });
                  }}
                />
              }
              label={i18n.t('events:event.form.address.showMap')}
            />
            <Typography variant="body2" color="textSecondary" sx={{ pl: 4 }}>
              {i18n.t('events:event.form.address.showMapHelp')}
            </Typography>
          </div>
          {hostGroup &&
            <FormControlLabel
              control={
                <Checkbox
                  checked={values.openToHostFollowers}
                  disabled={isSaving}
                  onChange={(event) => {
                    setValues({ ...values, openToHostFollowers: event.target.checked });
                  }}
                />
              }
              label={i18n.t('events:event.form.openToHostFollowers', { name: getActorName(hostGroup) })}
            />}
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
