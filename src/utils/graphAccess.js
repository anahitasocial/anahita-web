import ACCESS from '../constants/access';

// Who may see a profile's followers and whom it follows (roadmap row 151):
// the access levels the Access card offers, with their names, and "Same as
// this profile" first. Only the levels narrower than the profile's own are
// offered: a wider one would change nothing, since the lists are never
// shown to more people than the profile is.

// How narrow each level is. People it follows and mutuals are narrower than
// its followers only in part; offered after followers, they are counted as
// narrower than followers and registered, and so is "only me".
const RANK = {
  public: 0,
  registered: 1,
  followers: 2,
  leaders: 3,
  mutuals: 4,
  admins: 5,
  myself: 5,
};

// The server keeps a person's "only me" as admins, as a profile's access is
// kept; the Access card calls it myself.
const toServer = (level) => {
  return level === ACCESS.PEOPLE.MYSELF ? 'admins' : level;
};

const fromServer = (level, isPerson) => {
  return isPerson && level === 'admins' ? ACCESS.PEOPLE.MYSELF : (level || '');
};

// The choices for a profile: '' (the same as the profile), then each level
// of its kind narrower than the profile's own access.
const choicesFor = (access, isPerson) => {
  const levels = Object.values(isPerson ? ACCESS.PEOPLE : ACCESS.ACTORS);
  const own = RANK[access || 'public'] || 0;
  return [''].concat(levels.filter((level) => {
    return RANK[level] > own;
  }));
};

export default {
  toServer,
  fromServer,
  choicesFor,
};
