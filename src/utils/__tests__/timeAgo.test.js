/* eslint-env jest */
import moment from 'moment';

import timeAgo from '../timeAgo';

describe('timeAgo', () => {
  it('says how long ago', () => {
    expect(timeAgo(moment.utc().subtract(2, 'hours').toISOString())).toBe('2 hours ago');
  });

  it('is never in the future', () => {
    expect(timeAgo(moment.utc().add(5, 'seconds').toISOString())).toBe('a few seconds ago');
  });
});
