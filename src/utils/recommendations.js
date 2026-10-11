// Suggestions of who to follow: saying why somebody is suggested, in words.
//
// The service sends each suggestion with its reasons, the one that counted
// most first, and with what the reasons name (`related`): the people who
// follow somebody, the hashtags shared. Nothing is suggested without a
// reason, and the reason is always shown.

const KINDS = ['person', 'group'];

// What the reasons name, by id.
const relatedById = (related) => {
  const byId = {};

  (Array.isArray(related) ? related : []).forEach((node) => {
    byId[node.id] = node;
  });

  return byId;
};

const nameOf = (node) => {
  return (node && (node.name || node.alias)) || '';
};

// Why a suggestion is one, as a line to read under its name: its first
// reason. `t` is the translator.
//
// The names a reason gives are the ones the viewer may see. Where it has
// more than it names, or names none that can be shown, it counts instead:
// "Followed by Ana and 2 others", "Followed by 3 people you follow".
const reasonText = (suggestion, related, t) => {
  const reason = ((suggestion && suggestion.reasons) || [])[0];

  if (!reason) {
    return '';
  }

  const byId = relatedById(related);
  const names = (reason.ids || []).map((id) => {
    return nameOf(byId[id]);
  }).filter(Boolean);
  const count = reason.count || names.length;

  switch (reason.type) {
    case 'followed_by_leaders': {
      if (names.length === 0) {
        return t('recommendations:reasons.followedByCount', { count });
      }
      if (count <= 1) {
        return t('recommendations:reasons.followedByOne', { name: names[0] });
      }
      if (count === 2 && names.length >= 2) {
        return t('recommendations:reasons.followedByTwo', { first: names[0], second: names[1] });
      }
      return t('recommendations:reasons.followedByMore', { name: names[0], count: count - 1 });
    }
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
    case 'inviter':
      return t('recommendations:reasons.inviter');
    case 'you_engaged':
      return t('recommendations:reasons.youEngaged');
    case 'featured':
      return t('recommendations:reasons.featured');
    case 'popular':
      return t('recommendations:reasons.popular');
    default:
      return '';
  }
};

// Whether a failed request says there is no recommendation service here:
// the gateway could not reach one, or nothing answers that path. Anything
// else is an error like any other.
const isAbsent = (error) => {
  const status = error && error.response && error.response.status;

  return !status || status === 404 || status >= 502;
};

export default {
  KINDS,
  relatedById,
  reasonText,
  isAbsent,
};
