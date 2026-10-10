// Events: turning a time somebody chose on a form into the instant the
// server stores, and an instant back into what a reader should see.
//
// An event is held as two instants in UTC and the name of the zone it was
// planned in. The form works in that zone's wall-clock time ("7 pm in
// Toronto"), whatever zone the browser is in. Nothing here needs a library:
// Intl knows every zone's rules, including when its clocks change.
//
// Plain functions, so they can be tested without a page.

const GOING = 'going';
const MAYBE = 'maybe';

const UPCOMING = 'upcoming';
const INVITED = 'invited';
const HOSTING = 'hosting';
const PAST = 'past';

// The viewer's own lists, in the order of their tabs.
const LISTS = [UPCOMING, INVITED, HOSTING, PAST];

// The zone the browser is in, or UTC where it will not say.
const browserZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch (error) {
    return 'UTC';
  }
};

// Every zone the browser knows, with the given one first among them when it
// is not on the list (an old browser has no list at all).
const zones = (current = '') => {
  let all = [];
  try {
    all = Intl.supportedValuesOf('timeZone');
  } catch (error) {
    all = [];
  }

  const list = all.includes('UTC') ? all : ['UTC', ...all];

  return current && !list.includes(current) ? [current, ...list] : list;
};

const isZone = (zone) => {
  if (!zone) {
    return false;
  }
  try {
    Intl.DateTimeFormat('en-GB', { timeZone: zone });
    return true;
  } catch (error) {
    return false;
  }
};

// The wall-clock parts of an instant in a zone.
const partsIn = (date, zone) => {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: zone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const parts = {};
  formatter.formatToParts(date).forEach((part) => {
    if (part.type !== 'literal') {
      parts[part.type] = Number(part.value);
    }
  });

  return parts;
};

// How far ahead of UTC a zone is at an instant, in minutes.
const offsetAt = (date, zone) => {
  const parts = partsIn(date, zone);
  const asUTC = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return Math.round((asUTC - date.getTime()) / 60000);
};

const pad = (number) => {
  return String(number).padStart(2, '0');
};

// "2026-11-05T19:00", as a datetime-local input holds it, read as that time
// on the clocks of a zone. Gives the instant, or null for something that is
// not a time.
//
// The offset depends on the instant, which is what is being looked for, so
// it is guessed from the time taken as UTC and corrected once. That lands on
// the right side of a clock change. A time the clocks skip (the hour lost
// in spring) comes out an hour later, as a calendar would put it.
const wallToInstant = (wall, zone) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(wall || '');
  if (!match || !isZone(zone)) {
    return null;
  }

  const asUTC = Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
  );

  const first = asUTC - offsetAt(new Date(asUTC), zone) * 60000;
  const second = asUTC - offsetAt(new Date(first), zone) * 60000;

  return new Date(second);
};

// The other way: an instant as a datetime-local input wants it, on the
// clocks of a zone.
const instantToWall = (instant, zone) => {
  const date = instant instanceof Date ? instant : new Date(instant);
  if (Number.isNaN(date.getTime()) || !isZone(zone)) {
    return '';
  }

  const parts = partsIn(date, zone);

  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
};

// A wall-clock time moved on by some minutes: "2026-10-14T19:00" and 60
// give "2026-10-14T20:00". Clock arithmetic only, with no zone: it is for
// filling in an end from a start on the same form, and rolls over midnight
// and month ends as a calendar does. '' for something that is not a time.
const addToWall = (wall, minutes) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(wall || '');
  if (!match) {
    return '';
  }

  const moved = new Date(Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]) + minutes,
  ));

  return [
    `${moved.getUTCFullYear()}-${pad(moved.getUTCMonth() + 1)}-${pad(moved.getUTCDate())}`,
    `${pad(moved.getUTCHours())}:${pad(moved.getUTCMinutes())}`,
  ].join('T');
};

// How long an event is taken to last until somebody says otherwise.
const DEFAULT_MINUTES = 60;

// The end a form should hold after its start was changed: the end there
// was when it is still after the new start, or else an hour after it.
//
// Both are wall-clock times in the same zone, written the same way, so
// comparing them as text is comparing them as times.
const endAfter = (startsWall, endsWall) => {
  if (!startsWall) {
    return endsWall || '';
  }

  if (endsWall && endsWall > startsWall) {
    return endsWall;
  }

  return addToWall(startsWall, DEFAULT_MINUTES);
};

// What the server is sent: RFC 3339 in UTC. '' for something that is not a
// time.
const toServer = (wall, zone) => {
  const instant = wallToInstant(wall, zone);

  return instant ? instant.toISOString().replace(/\.\d{3}Z$/, 'Z') : '';
};

// Why a form's times cannot be sent, as the server would say it, or ''.
const timesError = (startsWall, endsWall, zone) => {
  if (!isZone(zone)) {
    return 'invalid_timezone';
  }

  const starts = wallToInstant(startsWall, zone);
  const ends = wallToInstant(endsWall, zone);
  if (!starts || !ends) {
    return 'invalid_time';
  }
  if (ends.getTime() <= starts.getTime()) {
    return 'ends_before_start';
  }

  return '';
};

// When an event is, for somebody reading in a zone: the day and both times
// when it starts and ends on one day there, or both whole moments.
//
// Returns the pieces, for the wording to put together:
//   { sameDay, date, start, end }
const when = (startsAt, endsAt, zone, locale = 'en-GB') => {
  const starts = new Date(startsAt);
  const ends = new Date(endsAt);
  if (Number.isNaN(starts.getTime()) || Number.isNaN(ends.getTime()) || !isZone(zone)) {
    return null;
  }

  const day = new Intl.DateTimeFormat(locale, {
    timeZone: zone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const time = new Intl.DateTimeFormat(locale, {
    timeZone: zone,
    hour: '2-digit',
    minute: '2-digit',
  });
  const whole = new Intl.DateTimeFormat(locale, {
    timeZone: zone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const sameDay = day.format(starts) === day.format(ends);

  return sameDay ?
    {
      sameDay,
      date: day.format(starts),
      start: time.format(starts),
      end: time.format(ends),
    } :
    {
      sameDay,
      start: whole.format(starts),
      end: whole.format(ends),
    };
};

// The month and the day an event starts on, for the small square that
// stands where an avatar would: { month: 'Oct', day: '14' }. Null when
// there is no time to read.
const dateTile = (startsAt, zone, locale = 'en-GB') => {
  const starts = new Date(startsAt);
  if (!startsAt || Number.isNaN(starts.getTime()) || !isZone(zone)) {
    return null;
  }

  return {
    month: new Intl.DateTimeFormat(locale, { timeZone: zone, month: 'short' }).format(starts),
    day: new Intl.DateTimeFormat(locale, { timeZone: zone, day: 'numeric' }).format(starts),
  };
};

// Whether an actor is an event.
const isEvent = (actor) => {
  return Boolean(actor && actor.type && actor.type.includes('.event.'));
};

// A place as it is read in a list: its name, and where it is when that is
// known and is not the name over again.
const placeLabel = (place) => {
  if (!place) {
    return '';
  }

  const where = [place.geoAddress, place.geoCity, place.geoCountry]
    .filter(Boolean)
    .join(', ');

  if (!where || where === place.name) {
    return place.name || '';
  }

  return place.name ? `${place.name}, ${where}` : where;
};

// The parts of an event's address, in the order they are written.
const ADDRESS_PARTS = ['street', 'city', 'stateProvince', 'postalCode', 'country'];

// An event's address on one line, or '' when it has none.
const addressLine = (address) => {
  if (!address) {
    return '';
  }

  return ADDRESS_PARTS
    .map((part) => {
      return (address[part] || '').trim();
    })
    .filter(Boolean)
    .join(', ');
};

// Whether an address came with where it is on a map: whoever made the event
// asked for one, and the address was found.
const hasPoint = (address) => {
  return Boolean(address) &&
    Number.isFinite(address.latitude) &&
    Number.isFinite(address.longitude) &&
    (address.latitude !== 0 || address.longitude !== 0);
};

// Whether an event has anything to say about where it is held, to the
// viewer: the address itself, or that there is one for people who are going.
const hasWhere = (actor) => {
  const event = (actor && actor.event) || {};

  return Boolean(addressLine(event.address)) || Boolean(event.hasAddress);
};

// The maps an address can be opened in, each with where it opens there.
// The address goes to a map only when somebody picks it, from their own
// browser. With a point the map opens at it, and Apple's and Google's are
// given the address beside it to name the pin; OpenStreetMap needs none.
const MAPS = ['apple', 'google', 'osm'];

const mapLinks = (address) => {
  const line = addressLine(address);

  if (!line) {
    return [];
  }

  const query = encodeURIComponent(line);
  const point = hasPoint(address) ? `${address.latitude},${address.longitude}` : '';

  return [{
    key: 'apple',
    url: point ?
      `https://maps.apple.com/?q=${query}&ll=${point}` :
      `https://maps.apple.com/?q=${query}`,
  }, {
    key: 'google',
    url: `https://www.google.com/maps/search/?api=1&query=${point ? encodeURIComponent(point) : query}`,
  }, {
    key: 'osm',
    url: point ?
      `https://www.openstreetmap.org/?mlat=${address.latitude}&mlon=${address.longitude}#map=16/${address.latitude}/${address.longitude}` :
      `https://www.openstreetmap.org/search?query=${query}`,
  }];
};

// A zone's name as people read it: "America/Toronto" as "Toronto".
const zoneLabel = (zone = '') => {
  const last = zone.split('/').pop() || zone;

  return last.replace(/_/g, ' ');
};

// Whether the viewer can still answer: not once it is over or called off.
const takesAnswers = (event) => {
  return Boolean(event) && (event.state === UPCOMING || event.state === 'happening');
};

// Whether Going is open to this viewer: there is a place, or they have one.
const canGo = (event) => {
  return takesAnswers(event) && (!event.isFull || event.viewerRsvp === GOING);
};

export default {
  GOING,
  MAYBE,
  UPCOMING,
  INVITED,
  HOSTING,
  PAST,
  LISTS,
  browserZone,
  zones,
  isZone,
  wallToInstant,
  instantToWall,
  toServer,
  addToWall,
  endAfter,
  timesError,
  when,
  dateTile,
  isEvent,
  placeLabel,
  addressLine,
  hasPoint,
  hasWhere,
  MAPS,
  mapLinks,
  zoneLabel,
  takesAnswers,
  canGo,
};
