// Who can see a post, chosen while writing it.
//
// The server decides which audiences a post may have where it is going,
// and sends the answer with every person and group as
// `authorized.audiences` (anahita-services, permissions.PostAudiences).
// It refuses anything else with 422. This reads that answer, so the
// composer only offers what will be accepted, and adds what the server
// has no opinion on: which one to start from, and which are pointless
// here.
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

// What to offer when a response does not say: the server's rule as it
// stood when this was written. A fallback only. If the two ever
// disagree the server's list wins wherever it is sent, and where it is
// not, the worst a stale copy does is offer something that is then
// refused.
const fallbackLevels = (actor, viewer) => {
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

// The levels to offer here, widest first: the server's answer for this
// profile.
//
// "Leaders" is accepted on a person's profile and deliberately not
// offered: "the people this profile follows" is not an audience anybody
// picks while writing, and a post that already has it keeps it.
const levelsFor = (actor, viewer) => {
  const answered = actor && actor.authorized && actor.authorized.audiences;

  if (Array.isArray(answered) && answered.length > 0) {
    return answered.filter((level) => {
      return level !== LEADERS;
    });
  }

  return fallbackLevels(actor, viewer);
};

const widthOf = (level) => {
  const index = WIDTH.indexOf(level);
  return index === -1 ? 0 : index;
};

// Turns levels into options: each one, and whether it is worth choosing.
// One that is wider than the profile itself is shown disabled, not
// hidden, so it is clear why "Public" is missing on a followers-only
// group.
const capped = (levels, actor) => {
  const cap = widthOf(actor && actor.access);

  return levels.map((level) => {
    return {
      level,
      disabled: widthOf(level) < cap,
    };
  });
};

// The options for a post being written on this profile.
const optionsFor = (actor, viewer) => {
  return capped(levelsFor(actor, viewer), actor);
};

// The options for a post that exists, for somebody who may change who
// sees it.
//
// The server sends them with the post (`authorized.audiences`), and they
// are not quite the ones for a new post: whether "only me" is possible
// depends on who WROTE it, not on who is changing it. An administrator
// tidying somebody's post sees that person's choices.
//
// The audience the post has now is always among them, even one that is
// no longer offered ("leaders") or no longer allowed, so the menu can
// show where things stand. Choosing it again changes nothing.
const optionsForMedium = (medium) => {
  const owner = medium.owner || {};
  const answered = medium.authorized && medium.authorized.audiences;

  let levels;
  if (Array.isArray(answered) && answered.length > 0) {
    levels = answered.filter((level) => {
      return level !== LEADERS;
    });
  } else {
    // Not said. Judge "own profile" by the author, as the server does.
    const author = medium.author || {};
    levels = fallbackLevels(owner, { id: author.id });
  }

  if (medium.access && !levels.includes(medium.access)) {
    levels = [...levels, medium.access].sort((a, b) => {
      return widthOf(a) - widthOf(b);
    });
  }

  return capped(levels, owner).map((option) => {
    return option.level === medium.access ?
      { ...option, disabled: false } :
      option;
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
  optionsForMedium,
  defaultFor,
  remember,
  remembered,
};
