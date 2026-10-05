// Who may reply to a post, as its author sets it.
//
// The server keeps one value: "anyone", "nobody", or any of "followers",
// "following" and "mentioned" joined by commas (anahita-services,
// constants/reply_access.go). The groups are measured against the post's
// author, and being in any one of them is enough.
//
// The dialog asks it the way Bluesky does, as two questions: anyone or
// nobody, and then, under nobody, who is let in anyway. So "nobody" with a
// box ticked is that group, and "nobody" with none is nobody. This turns one
// into the other.
//
// It only narrows. The profile's own rule for who may comment is applied
// first, by the server, whatever is chosen here.

const ANYONE = 'anyone';
const NOBODY = 'nobody';

// In the order the server stores them.
const GROUPS = ['followers', 'following', 'mentioned'];

// The name the server reads it under when a post is made.
const FIELD = 'reply_access';

// groupsOf is the groups in a value, in order. None for "anyone" and
// "nobody", and for anything this does not know.
const groupsOf = (value) => {
  const parts = String(value || '').split(',');
  return GROUPS.filter((group) => {
    return parts.includes(group);
  });
};

// normalize is a value as this app holds it. A post that says nothing lets
// anyone reply.
const normalize = (value) => {
  if (value === NOBODY) {
    return NOBODY;
  }
  const groups = groupsOf(value);
  return groups.length > 0 ? groups.join(',') : ANYONE;
};

// toChoice is a value as the dialog shows it.
const toChoice = (value) => {
  const normal = normalize(value);
  const groups = groupsOf(normal);
  return {
    anyone: normal === ANYONE,
    followers: groups.includes('followers'),
    following: groups.includes('following'),
    mentioned: groups.includes('mentioned'),
  };
};

// fromChoice is what the dialog shows as a value.
const fromChoice = (choice) => {
  if (choice.anyone) {
    return ANYONE;
  }
  const groups = GROUPS.filter((group) => {
    return Boolean(choice[group]);
  });
  return groups.length > 0 ? groups.join(',') : NOBODY;
};

const isLimited = (value) => {
  return normalize(value) !== ANYONE;
};

// labelKey is the short name of a value, for a button: one of three.
const labelKey = (value) => {
  const normal = normalize(value);
  if (normal === ANYONE) {
    return 'replies:access.short.anyone';
  }
  return normal === NOBODY ?
    'replies:access.short.nobody' :
    'replies:access.short.some';
};

// summary says who may reply, in a sentence. t is the translator.
const summary = (value, t) => {
  const normal = normalize(value);
  if (normal === ANYONE) {
    return t('replies:access.summary.anyone');
  }
  if (normal === NOBODY) {
    return t('replies:access.summary.nobody');
  }
  const names = groupsOf(normal).map((group) => {
    return t(`replies:access.summary.${group}`);
  });
  return t('replies:access.summary.some', { groups: names.join(t('replies:access.summary.or')) });
};

// toRequest is the field to send with a new post. Nothing for "anyone":
// that is what a post has when nothing is said.
const toRequest = (value) => {
  const normal = normalize(value);
  return normal === ANYONE ? {} : { [FIELD]: normal };
};

export default {
  ANYONE,
  NOBODY,
  GROUPS,
  fromChoice,
  groupsOf,
  isLimited,
  labelKey,
  normalize,
  summary,
  toChoice,
  toRequest,
};
