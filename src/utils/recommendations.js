// Suggestions of who to follow: saying why somebody is suggested, in words.
//
// The service sends each suggestion with its reasons, the one that counted
// most first, and with what the reasons name (`related`): the people who
// follow somebody, the hashtags shared. Nothing is suggested without a
// reason, and the reason is always shown.

// Websites since 2026-10-28 (roadmap row 111): a site's feed to follow, for
// the reasons that fit a site.
const KINDS = ['person', 'group', 'event', 'website'];

// What the reasons name, by id.
const relatedById = (related) => {
  const byId = {};

  (Array.isArray(related) ? related : []).forEach((node) => {
    byId[node.id] = node;
  });

  return byId;
};

const nameOf = (node) => {
  return (node && (node.name || node.title || node.alias)) || '';
};

// Why a suggestion is one, as a line to read under its name: its first
// reason. `t` is the translator, and `kind` what is suggested: an event is
// gone to, where a person or a group is followed.
//
// The names a reason gives are the ones the viewer may see. Where it has
// more than it names, or names none that can be shown, it counts instead:
// "Followed by Ana and 2 others", "Followed by 3 people you follow".
const reasonText = (suggestion, related, t, kind = 'person') => {
  const reason = ((suggestion && suggestion.reasons) || [])[0];

  if (!reason) {
    return '';
  }

  const byId = relatedById(related);
  const names = (reason.ids || []).map((id) => {
    return nameOf(byId[id]);
  }).filter(Boolean);
  const count = reason.count || names.length;

  // "Followed by", or for an event "going".
  const by = kind === 'event' ? 'going' : 'followedBy';

  switch (reason.type) {
    case 'followed_by_leaders': {
      if (names.length === 0) {
        return t(`recommendations:reasons.${by}Count`, { count });
      }
      if (count <= 1) {
        return t(`recommendations:reasons.${by}One`, { name: names[0] });
      }
      if (count === 2 && names.length >= 2) {
        return t(`recommendations:reasons.${by}Two`, { first: names[0], second: names[1] });
      }
      return t(`recommendations:reasons.${by}More`, { name: names[0], count: count - 1 });
    }
    // Cited by people the viewer follows, named where they can be.
    case 'cited_by_leaders': {
      if (names.length === 0) {
        return t('recommendations:reasons.citedByCount', { count });
      }
      if (count <= 1) {
        return t('recommendations:reasons.citedByOne', { name: names[0] });
      }
      return t('recommendations:reasons.citedByMore', { name: names[0], count: count - 1 });
    }
    case 'cited':
      return t('recommendations:reasons.cited', { count });
    case 'hosted_by_leader':
      return names.length > 0 ?
        t('recommendations:reasons.hostedBy', { name: names[0] }) :
        t('recommendations:reasons.hostedByPlain');
    case 'shared_interest': {
      if (names.length === 0) {
        return t('recommendations:reasons.sharedInterestPlain');
      }
      return t('recommendations:reasons.sharedInterest', {
        tags: names.slice(0, 2).map((name) => {
          return `#${name}`;
        }).join(', '),
      });
    }
    case 'follows_you':
      return t('recommendations:reasons.followsYou');
    // Never who, nor which photo (roadmap row 104).
    case 'pictured_with_you':
      return t('recommendations:reasons.picturedWithYou');
    case 'pictured_with_leaders':
      return t('recommendations:reasons.picturedWithLeaders');
    case 'inviter':
      return t('recommendations:reasons.inviter');
    case 'you_engaged':
      return t('recommendations:reasons.youEngaged');
    case 'featured':
      return t('recommendations:reasons.featured');
    case 'popular':
      return t(kind === 'event' ? 'recommendations:reasons.popularEvent' : 'recommendations:reasons.popular');
    default:
      return '';
  }
};

// A reason's name as the app has it in the keys of what it is sent: the
// server says "follows_you", and the keys of an answer are put in camel
// case on the way in and back in snake case on the way out.
const weightKey = (reason = '') => {
  return reason.replace(/_([a-z])/g, (match, letter) => {
    return letter.toUpperCase();
  });
};

// Whether a failed request says there is no recommendation service here:
// the gateway could not reach one, or nothing answers that path. Anything
// else is an error like any other.
const isAbsent = (error) => {
  const status = error && error.response && error.response.status;

  return !status || status === 404 || status >= 502;
};

// "Who to follow" on the home page can be put away for a while. How long,
// and until when for this person, which is kept in their browser: it is
// about how one screen looks, not a choice about being suggested people,
// which is in their settings.
const HIDE_DAYS = 7;
const HIDDEN_KEY = 'whoToFollow.hiddenUntil';

// Whether the card is put away at this moment.
const isHidden = (now = Date.now()) => {
  try {
    return Number(window.localStorage.getItem(HIDDEN_KEY)) > now;
  } catch (e) {
    return false;
  }
};

// Puts it away from now, and answers with when it comes back.
const hide = (now = Date.now()) => {
  const until = now + (HIDE_DAYS * 24 * 60 * 60 * 1000);
  try {
    window.localStorage.setItem(HIDDEN_KEY, String(until));
  } catch (e) {
    // Not kept: it is back on the next visit.
  }
  return until;
};

// Brings it back before its time: what Reset in the recommendations
// settings does, with the weights.
const unhide = () => {
  try {
    window.localStorage.removeItem(HIDDEN_KEY);
  } catch (e) {
    // Nothing was kept, so there is nothing to take back.
  }
};

export default {
  HIDE_DAYS,
  isHidden,
  hide,
  unhide,
  KINDS,
  relatedById,
  reasonText,
  weightKey,
  isAbsent,
};
