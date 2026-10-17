/**
 * @jest-environment node
 */
/* eslint-env jest */
import i18n from '../../languages';
import recommendations from '../recommendations';

const t = (key, options) => {
  return i18n.t(key, { lng: 'en-CA', ...options });
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

  it('says who is going to an event, and who hosts it', () => {
    const forEvent = (reason) => {
      return recommendations.reasonText({ reasons: [reason] }, related, t, 'event');
    };

    expect(forEvent({ type: 'followed_by_leaders', count: 1, ids: [2] })).toBe('Ana is going');
    expect(forEvent({ type: 'followed_by_leaders', count: 2, ids: [2, 3] })).toBe('Ana and Bo are going');
    expect(forEvent({ type: 'followed_by_leaders', count: 4, ids: [2, 3] }))
      .toBe('Ana and 3 others are going');
    expect(forEvent({ type: 'followed_by_leaders', count: 2, ids: [9] }))
      .toBe('2 people you follow are going');
    expect(forEvent({ type: 'hosted_by_leader', count: 1, ids: [3] })).toBe('Hosted by Bo');
    expect(forEvent({ type: 'hosted_by_leader', count: 1, ids: [9] }))
      .toBe('Hosted by a group you follow');
    expect(forEvent({ type: 'popular', count: 9 })).toBe('Many people answered lately');
  });

  it('knows a reason by the name its weight is sent under', () => {
    expect(recommendations.weightKey('follows_you')).toBe('followsYou');
    expect(recommendations.weightKey('followed_by_leaders')).toBe('followedByLeaders');
    expect(recommendations.weightKey('popular')).toBe('popular');
    expect(i18n.exists('recommendations:weights.hostedByLeader', { lng: 'en-CA' })).toBe(true);
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

describe('putting Who to follow away', () => {
  const kept = {};

  beforeEach(() => {
    Object.keys(kept).forEach((key) => {
      delete kept[key];
    });
    global.window = {
      localStorage: {
        getItem: (key) => {
          return key in kept ? kept[key] : null;
        },
        setItem: (key, value) => {
          kept[key] = String(value);
        },
        removeItem: (key) => {
          delete kept[key];
        },
      },
    };
  });

  afterEach(() => {
    delete global.window;
  });

  it('hides it for a week and then shows it again', () => {
    const now = Date.UTC(2026, 9, 11);
    const day = 24 * 60 * 60 * 1000;

    expect(recommendations.isHidden(now)).toBe(false);
    expect(recommendations.hide(now)).toBe(now + (7 * day));
    expect(recommendations.isHidden(now + day)).toBe(true);
    expect(recommendations.isHidden(now + (7 * day) - 1)).toBe(true);
    expect(recommendations.isHidden(now + (7 * day) + 1)).toBe(false);
  });

  it('comes back at once when recommendations are reset', () => {
    const now = Date.UTC(2026, 9, 11);

    recommendations.hide(now);
    expect(recommendations.isHidden(now + 1000)).toBe(true);
    recommendations.unhide();
    expect(recommendations.isHidden(now + 1000)).toBe(false);
  });

  it('is shown where the browser keeps nothing', () => {
    global.window = {
      localStorage: {
        getItem: () => {
          throw new Error('blocked');
        },
        setItem: () => {
          throw new Error('blocked');
        },
      },
    };
    expect(recommendations.isHidden()).toBe(false);
    expect(() => {
      return recommendations.hide();
    }).not.toThrow();
  });
});
