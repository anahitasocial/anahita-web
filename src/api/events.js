import axios from 'axios';

// What only an event has, beside what every actor has (api/create.js and
// api/actor serve those for the `events` namespace like any other).

// The viewer's own events: upcoming, invited, hosting or past.
const mine = ({ filter, start = 0, limit = 20 }) => {
  return axios.get('/events/mine', {
    params: { filter, start, limit },
  });
};

// The events a group hosts: upcoming or past.
const hostedBy = ({
  group,
  filter,
  start = 0,
  limit = 20,
}) => {
  return axios.get(`/groups/${group.id}/events/`, {
    params: { filter, start, limit },
  });
};

// Making and changing one. The times are RFC 3339 in UTC; the zone they
// were chosen in goes beside them.
const add = (fields) => {
  return axios.post('/events/', fields);
};

const edit = (event, fields) => {
  return axios.patch(`/events/${event.id}`, fields);
};

// Going, maybe, and not after all.
const rsvp = (event, answer) => {
  return axios.put(`/events/${event.id}/rsvp`, { rsvp: answer });
};

const unrsvp = (event) => {
  return axios.delete(`/events/${event.id}/rsvp`);
};

const cancel = (event) => {
  return axios.post(`/events/${event.id}/cancel`);
};

// Who is going, or who said maybe.
const attendees = ({
  event,
  rsvp: answer,
  start = 0,
  limit = 20,
}) => {
  return axios.get(`/events/${event.id}/attendees/`, {
    params: { rsvp: answer, start, limit },
  });
};

// The event as a calendar file, as text.
const calendar = (event) => {
  return axios.get(`/events/${event.id}/ics`, { responseType: 'text' });
};

export default {
  mine,
  hostedBy,
  add,
  edit,
  rsvp,
  unrsvp,
  cancel,
  attendees,
  calendar,
};
