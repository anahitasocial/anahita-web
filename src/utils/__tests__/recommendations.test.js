/**
 * @jest-environment node
 */
/* eslint-env jest */
import i18n from '../../languages';
import recommendations from '../recommendations';

const t = (key, options) => {
  return i18n.t(key, { lng: 'en-GB', ...options });
};

const related = [
  { id: 2, name: 'Ana' },
  { id: 3, name: 'Bo' },
  { id: 100, name: 'garden' },
];

const why = (reason) => {
  return recommendations.reasonText({ reasons: [reason] }, related, t);
};

describe('why somebody is suggested', () => {
  it('names who follows them, and counts the rest', () => {
    expect(why({ type: 'followed_by_leaders', count: 1, ids: [2] })).toBe('Followed by Ana');
    expect(why({ type: 'followed_by_leaders', count: 2, ids: [2, 3] })).toBe('Followed by Ana and Bo');
    expect(why({ type: 'followed_by_leaders', count: 5, ids: [2, 3, 9] }))
      .toBe('Followed by Ana and 4 others');
    expect(why({ type: 'followed_by_leaders', count: 2, ids: [2, 9] }))
      .toBe('Followed by Ana and 1 other');
  });

  it('counts when it may name nobody', () => {
    expect(why({ type: 'followed_by_leaders', count: 3, ids: [8, 9] }))
      .toBe('Followed by 3 people you follow');
    expect(why({ type: 'followed_by_leaders', count: 1, ids: [9] }))
      .toBe('Followed by 1 person you follow');
  });

  it('names the hashtags shared', () => {
    expect(why({ type: 'shared_interest', count: 1, ids: [100] })).toBe('Posts about #garden');
    expect(why({ type: 'shared_interest', count: 1, ids: [999] }))
      .toBe('Posts about things you post about');
  });

  it('has words for every other reason', () => {
    expect(why({ type: 'follows_you', count: 1 })).toBe('Follows you');
    expect(why({ type: 'inviter', count: 1 })).toBe('You invited each other here');
    expect(why({ type: 'you_engaged', count: 2 })).toBe('You liked their posts');
    expect(why({ type: 'featured', count: 1 })).toBe('Featured on this site');
    expect(why({ type: 'popular', count: 9 })).toBe('Many people followed them lately');
  });

  it('gives the first reason, and nothing for none or one it does not know', () => {
    expect(recommendations.reasonText({
      reasons: [{ type: 'follows_you', count: 1 }, { type: 'popular', count: 9 }],
    }, related, t)).toBe('Follows you');
    expect(recommendations.reasonText({ reasons: [] }, related, t)).toBe('');
    expect(recommendations.reasonText(undefined, related, t)).toBe('');
    expect(why({ type: 'something_new', count: 1 })).toBe('');
  });
});

describe('an installation without the service', () => {
  it('is told from an error', () => {
    expect(recommendations.isAbsent({ response: { status: 502 } })).toBe(true);
    expect(recommendations.isAbsent({ response: { status: 503 } })).toBe(true);
    expect(recommendations.isAbsent({ response: { status: 404 } })).toBe(true);
    expect(recommendations.isAbsent({})).toBe(true);
    expect(recommendations.isAbsent({ response: { status: 500 } })).toBe(false);
    expect(recommendations.isAbsent({ response: { status: 403 } })).toBe(false);
  });
});
