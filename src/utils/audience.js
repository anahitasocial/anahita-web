// Who can see a post, chosen while writing it.
//
// The server decides which audiences a post may have where it is going
// (anahita-services, permissions.MediumAudiences) and refuses the rest
// with 422. This mirrors that rule, so the composer only offers what
// will be accepted, and adds what the server has no opinion on: which
// one to start from, and which are pointless here.
//
// Every level is judged against the profile the post is ON, not against
// its author: "followers" are that profile's followers, "admins" its
// administrators, "only me" its owner.

const PUBLIC = 'public';
const REGISTERED = 'registered';
const FOLLOWERS = 'followers';
const LEADERS = 'leaders';
const MUTUALS = 'mutuals';
const ADMINS = 'admins';
const MYSELF = 'myself';

// Widest first. A profile's own access caps its posts: on a
// followers-only profile a "public" post is still only seen by
// followers, because a reader has to get past the profile first.
const WIDTH = [PUBLIC, REGISTERED, FOLLOWERS, LEADERS, MUTUALS, ADMINS, MYSELF];

// The three kinds of place a post can go. A choice is remembered per
// kind: somebody who posts to their followers on their own profile has
// not thereby decided anything about a group.
const PLACE = {
  OWN: 'own',
  PERSON: 'person',
  GROUP: 'group',
};

const STORAGE_KEY = 'composer.audience';

const isPersonActor = (actor) => {
  return Boolean(actor && actor.type && actor.type.split('.')[3] === 'person');
};

const placeOf = (actor, viewer) => {
  if (!isPersonActor(actor)) {
    return PLACE.GROUP;
  }
  return actor.id === viewer.id ? PLACE.OWN : PLACE.PERSON;
};

const administers = (actor) => {
  return Boolean(actor && actor.authorized && actor.authorized.administration);
};

// The levels the server will accept here, widest first.
//
// "Leaders" is accepted on a person's profile and deliberately not
// offered: "the people this profile follows" is not an audience anybody
// picks while writing, and a post that already has it keeps it.
const levelsFor = (actor, viewer) => {
  switch (placeOf(actor, viewer)) {
    case PLACE.OWN:
      return [PUBLIC, REGISTERED, FOLLOWERS, MUTUALS, MYSELF];
    case PLACE.PERSON:
      // No "only me": on somebody else's profile that would be a post
      // only the two of you could see, which is a private message.
      return [PUBLIC, REGISTERED, FOLLOWERS, MUTUALS];
    default:
      return administers(actor) ?
        [PUBLIC, REGISTERED, FOLLOWERS, ADMINS] :
        [PUBLIC, REGISTERED, FOLLOWERS];
  }
};

const widthOf = (level) => {
  const index = WIDTH.indexOf(level);
  return index === -1 ? 0 : index;
};

// The options to show: each level the server accepts, and whether it is
// worth choosing. One that is wider than the profile itself is shown
// disabled, not hidden, so it is clear why "Public" is missing on a
// followers-only group.
const optionsFor = (actor, viewer) => {
  const cap = widthOf(actor && actor.access);

  return levelsFor(actor, viewer).map((level) => {
    return {
      level,
      disabled: widthOf(level) < cap,
    };
  });
};

const read = () => {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    // Private browsing, storage turned off, or something else's value
    // under this key. The picker works without a memory.
    return {};
  }
};

// The last choice for this kind of place, kept per person: a shared
// browser must not hand one person's habit to the next.
const remembered = (actor, viewer) => {
  const byPerson = read()[viewer.id] || {};
  return byPerson[placeOf(actor, viewer)] || '';
};

const remember = (actor, viewer, level) => {
  try {
    const all = read();
    all[viewer.id] = {
      ...(all[viewer.id] || {}),
      [placeOf(actor, viewer)]: level,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    // Nothing to do: it will simply not be remembered.
  }
};

// Where the picker starts: the last choice for this kind of place if it
// can still be chosen here, otherwise the widest thing that can.
//
// The widest, not a fixed "public": on a followers-only group the widest
// is "followers", and starting on a disabled option would be a choice
// nobody made.
const defaultFor = (actor, viewer) => {
  const options = optionsFor(actor, viewer).filter((option) => {
    return !option.disabled;
  });

  if (options.length === 0) {
    return PUBLIC;
  }

  const last = remembered(actor, viewer);
  const stillThere = options.some((option) => {
    return option.level === last;
  });

  return stillThere ? last : options[0].level;
};

export default {
  PLACE,
  placeOf,
  levelsFor,
  optionsFor,
  defaultFor,
  remember,
  remembered,
};
