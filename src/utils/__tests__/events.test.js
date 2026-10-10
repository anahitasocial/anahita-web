/**
 * @jest-environment node
 */
/* eslint-env jest */
import events from '../events';

describe('a time chosen on the form, in the event\'s zone', () => {
  it('becomes the instant the server stores, whatever zone the browser is in', () => {
    // 7 pm in Toronto in November is UTC-5: midnight UTC the next day.
    expect(events.toServer('2026-11-05T19:00', 'America/Toronto')).toBe('2026-11-06T00:00:00Z');
    // The same wall time in July is UTC-4.
    expect(events.toServer('2026-07-05T19:00', 'America/Toronto')).toBe('2026-07-05T23:00:00Z');
    expect(events.toServer('2026-11-05T19:00', 'Europe/Paris')).toBe('2026-11-05T18:00:00Z');
    expect(events.toServer('2026-11-05T19:00', 'UTC')).toBe('2026-11-05T19:00:00Z');
    // Half-hour zones.
    expect(events.toServer('2026-11-05T19:00', 'Asia/Kolkata')).toBe('2026-11-05T13:30:00Z');
  });

  it('lands on the right side of a clock change', () => {
    // Toronto's clocks go back at 2 am on 1 November 2026.
    expect(events.toServer('2026-10-31T23:00', 'America/Toronto')).toBe('2026-11-01T03:00:00Z');
    expect(events.toServer('2026-11-01T09:00', 'America/Toronto')).toBe('2026-11-01T14:00:00Z');
    // And forward at 2 am on 8 March 2026.
    expect(events.toServer('2026-03-08T09:00', 'America/Toronto')).toBe('2026-03-08T13:00:00Z');
  });

  it('comes back as it was chosen', () => {
    const cases = [
      ['2026-11-05T19:00', 'America/Toronto'],
      ['2026-07-05T08:30', 'Europe/Paris'],
      ['2026-12-31T23:59', 'Asia/Tokyo'],
      ['2026-11-01T09:00', 'America/Toronto'],
    ];

    cases.forEach(([wall, zone]) => {
      expect(events.instantToWall(events.wallToInstant(wall, zone), zone)).toBe(wall);
    });
  });

  it('gives nothing for what is not a time or not a zone', () => {
    expect(events.toServer('', 'UTC')).toBe('');
    expect(events.toServer('tomorrow', 'UTC')).toBe('');
    expect(events.toServer('2026-11-05T19:00', 'Mars/Olympus')).toBe('');
    expect(events.instantToWall('never', 'UTC')).toBe('');
  });
});

describe('the end a form fills in from its start', () => {
  it('is an hour after a start chosen first', () => {
    expect(events.endAfter('2026-10-14T19:00', '')).toBe('2026-10-14T20:00');
  });

  it('replaces an end that is not after the start', () => {
    // The browser fills in the time it is now when a date is picked.
    expect(events.endAfter('2026-10-14T19:00', '2026-10-14T12:45')).toBe('2026-10-14T20:00');
    expect(events.endAfter('2026-10-14T19:00', '2026-10-14T19:00')).toBe('2026-10-14T20:00');
  });

  it('leaves an end that is already later', () => {
    expect(events.endAfter('2026-10-14T19:00', '2026-10-14T23:30')).toBe('2026-10-14T23:30');
    expect(events.endAfter('2026-10-14T19:00', '2026-10-16T10:00')).toBe('2026-10-16T10:00');
  });

  it('rolls over midnight, a month and a year', () => {
    expect(events.endAfter('2026-10-14T23:30', '')).toBe('2026-10-15T00:30');
    expect(events.endAfter('2026-10-31T23:30', '')).toBe('2026-11-01T00:30');
    expect(events.endAfter('2026-12-31T23:30', '')).toBe('2027-01-01T00:30');
  });

  it('does nothing without a start', () => {
    expect(events.endAfter('', '2026-10-14T12:45')).toBe('2026-10-14T12:45');
    expect(events.endAfter('', '')).toBe('');
    expect(events.addToWall('soon', 60)).toBe('');
  });
});

describe('why a form cannot be sent', () => {
  it('says so in the server\'s words', () => {
    expect(events.timesError('2026-11-05T19:00', '2026-11-05T21:00', 'UTC')).toBe('');
    expect(events.timesError('2026-11-05T19:00', '2026-11-05T19:00', 'UTC')).toBe('ends_before_start');
    expect(events.timesError('2026-11-05T19:00', '2026-11-05T18:00', 'UTC')).toBe('ends_before_start');
    expect(events.timesError('', '2026-11-05T18:00', 'UTC')).toBe('invalid_time');
    expect(events.timesError('2026-11-05T19:00', '2026-11-05T21:00', '')).toBe('invalid_timezone');
  });
});

describe('when an event is, for somebody reading', () => {
  it('is one day and two times when it starts and ends on the same day there', () => {
    const got = events.when('2026-11-06T00:00:00Z', '2026-11-06T02:00:00Z', 'America/Toronto', 'en-GB');

    expect(got.sameDay).toBe(true);
    // The comma after the weekday depends on the browser's data.
    expect(got.date).toMatch(/^Thursday,? 5 November 2026$/);
    expect(got.start).toBe('19:00');
    expect(got.end).toBe('21:00');
  });

  it('is two whole moments when it crosses midnight for the reader', () => {
    // The same event, read in Paris: 1 am to 3 am on the 6th, one day.
    expect(events.when('2026-11-06T00:00:00Z', '2026-11-06T02:00:00Z', 'Europe/Paris').sameDay).toBe(true);
    // Read in Tokyo it is 9 to 11 am on the 6th. A two-day event is not.
    const long = events.when('2026-11-06T00:00:00Z', '2026-11-07T22:00:00Z', 'Europe/Paris');
    expect(long.sameDay).toBe(false);
    expect(long.start).toContain('6 Nov 2026');
    expect(long.end).toContain('7 Nov 2026');
  });

  it('is nothing for times that cannot be read', () => {
    expect(events.when('', '', 'UTC')).toBeNull();
    expect(events.when('2026-11-06T00:00:00Z', '2026-11-06T02:00:00Z', 'Nowhere')).toBeNull();
  });

  it('names a zone the way people do', () => {
    expect(events.zoneLabel('America/Toronto')).toBe('Toronto');
    expect(events.zoneLabel('America/Argentina/Buenos_Aires')).toBe('Buenos Aires');
    expect(events.zoneLabel('UTC')).toBe('UTC');
  });
});

describe('the day on an event\'s tile', () => {
  it('is the month and the day on the reader\'s calendar', () => {
    // 7 pm on the 14th in Vancouver is 2 am on the 15th in UTC.
    expect(events.dateTile('2026-10-15T02:00:00Z', 'America/Vancouver')).toEqual({ month: 'Oct', day: '14' });
    expect(events.dateTile('2026-10-15T02:00:00Z', 'UTC')).toEqual({ month: 'Oct', day: '15' });
  });

  it('is nothing without a time', () => {
    expect(events.dateTile(undefined, 'UTC')).toBeNull();
    expect(events.dateTile('whenever', 'UTC')).toBeNull();
  });

  it('knows an event from any other actor', () => {
    expect(events.isEvent({ type: 'node.actor.actor-service.event.v1' })).toBe(true);
    expect(events.isEvent({ type: 'node.actor.group-service.group.v1' })).toBe(false);
    expect(events.isEvent(undefined)).toBe(false);
  });
});

describe('where an event is', () => {
  it('reads as the name and where that is', () => {
    expect(events.placeLabel({ name: 'Jericho Beach', geoCity: 'Vancouver', geoCountry: 'Canada' }))
      .toBe('Jericho Beach, Vancouver, Canada');
    expect(events.placeLabel({ name: 'Jericho Beach' })).toBe('Jericho Beach');
    expect(events.placeLabel({ name: 'Vancouver', geoCity: 'Vancouver' })).toBe('Vancouver');
    expect(events.placeLabel({ geoAddress: '1 Main St', geoCity: 'Vancouver' })).toBe('1 Main St, Vancouver');
    expect(events.placeLabel(null)).toBe('');
  });

  it('is changed by taking the old place off and putting the new one on', () => {
    const beach = { id: 1 };
    const park = { id: 2 };

    expect(events.placeChange(null, beach)).toEqual({ remove: null, add: beach });
    expect(events.placeChange(beach, park)).toEqual({ remove: beach, add: park });
    expect(events.placeChange(beach, null)).toEqual({ remove: beach, add: null });
    // The same place, or still none: nothing to do.
    expect(events.placeChange(beach, { id: 1 })).toEqual({ remove: null, add: null });
    expect(events.placeChange(null, null)).toEqual({ remove: null, add: null });
  });
});

describe('answering', () => {
  it('is open while the event is to come or on, and closed after', () => {
    expect(events.takesAnswers({ state: 'upcoming' })).toBe(true);
    expect(events.takesAnswers({ state: 'happening' })).toBe(true);
    expect(events.takesAnswers({ state: 'past' })).toBe(false);
    expect(events.takesAnswers({ state: 'cancelled' })).toBe(false);
    expect(events.takesAnswers(undefined)).toBe(false);
  });

  it('offers Going while there is a place, and to somebody who has one', () => {
    expect(events.canGo({ state: 'upcoming', isFull: false })).toBe(true);
    expect(events.canGo({ state: 'upcoming', isFull: true })).toBe(false);
    expect(events.canGo({ state: 'upcoming', isFull: true, viewerRsvp: 'going' })).toBe(true);
    expect(events.canGo({ state: 'past', isFull: false })).toBe(false);
  });
});
