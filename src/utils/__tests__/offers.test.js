import offers from '../offers';
import actor from '../../permissions/actor';

const coffeehouse = { offers: { profiles: ['person', 'group'], posts: ['note', 'photo'] } };

describe('what the site offers', () => {
  it('is everything before the server says, or where it does not', () => {
    expect(offers.profile(null, 'event')).toBe(true);
    expect(offers.post({}, 'article')).toBe(true);
  });

  it('is what the server says', () => {
    expect(offers.profile(coffeehouse, 'group')).toBe(true);
    expect(offers.profile(coffeehouse, 'event')).toBe(false);
    expect(offers.post(coffeehouse, 'article')).toBe(false);
    expect(offers.post(coffeehouse, 'photo')).toBe(true);
  });

  it('always offers a person', () => {
    expect(offers.profile({ offers: { profiles: [], posts: [] } }, 'person')).toBe(true);
  });

  it('offers no + for a kind the site does not, whoever may make one', () => {
    const admin = { id: 1, type: 'super-administrator', personType: 'super-administrator' };
    const settings = { ...coffeehouse, eventsFrom: 'registered', websitesFrom: 'registered' };
    expect(actor.canAddEvent(admin, settings)).toBe(false);
    expect(actor.canConnect(admin, settings)).toBe(false);
  });
});
