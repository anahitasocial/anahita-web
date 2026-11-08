// Mutes (roadmap row 133): whom the viewer would rather not see, their own
// alone. The server leaves a muted person out of every list it sends; this
// is what the web app does with what it holds already.

// How long a mute lasts: until unmuted, or for a day, a week or a month.
// The server's `for`, but `always`, which is sent as nothing.
export const LENGTHS = ['always', 'day', 'week', 'month'];

// Until when a mute lasts, as the person's own language writes it: the day,
// and the time, which matters for a mute of a day. Empty for one that lasts
// until unmuted.
export const until = (endsAt, language = 'en-CA') => {
  if (!endsAt) {
    return '';
  }
  const date = new Date(endsAt);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleString(language, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const by = (node, actorId) => {
  return Boolean(node && node.author && node.author.id === actorId);
};

const on = (node, actorId) => {
  return Boolean(node && node.owner && node.owner.id === actorId);
};

// Whether a post held in a list is one a mute of `actorId` takes out of it:
// what they wrote, what is on their profile, and a repost by them or of
// theirs.
//
// A profile's feed (`inProfileFeed`) keeps what is on the muted person's own
// profile: there it was opened on purpose, and the server sends it whole.
// On any other profile, a group's among them, what they wrote goes.
export const isMutedOut = (node, actorId, inProfileFeed = false) => {
  if (!node || !actorId) {
    return false;
  }
  const { parent } = node;
  if (inProfileFeed && on(node, actorId)) {
    return false;
  }
  return by(node, actorId) || on(node, actorId) || by(parent, actorId) || on(parent, actorId);
};

export default {
  LENGTHS,
  until,
  isMutedOut,
};
