/* eslint-env jest */
import _ from 'lodash';

import { Notifications as NOTIFICATIONS } from '../../../constants';
import strings from '../../../languages/en-CA/notifications';

// Every kind the services send has its words (roadmap row 96, part 4):
// seven of them had none, and showed as their links run together. The other
// bases have the same keys as this one (languages.test.js).
describe('the words for each kind of notification', () => {
  it('has words for every kind the services send', () => {
    const missing = NOTIFICATIONS.KINDS.filter((kind) => {
      return !strings[_.camelCase(kind)];
    });
    expect(missing).toEqual([]);
  });

  it('has words for a kind it does not know', () => {
    expect(strings.other).toBeTruthy();
  });
});
