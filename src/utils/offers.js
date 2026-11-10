// What the site offers (anahita-services roadmap row 139,
// docs/instance-features.md there): the kinds of profile that may be made
// and of post that may be written, from the instance's instance.json. The
// server publishes them in NodeInfo as `metadata.offers`, `{ profiles,
// posts }`, by their short names ("group", "article"), and refuses the rest.
//
// Plain functions of NodeInfo's metadata, as the components hold it.
// Before NodeInfo answers, and on a server that does not say, everything is
// offered: what decides is the server.

const offersOf = (metadata) => {
  return (metadata && metadata.offers) || null;
};

// Whether a kind of profile may be made here: a person always.
const profile = (metadata, kind) => {
  const offers = offersOf(metadata);
  return !offers || kind === 'person' || (offers.profiles || []).includes(kind);
};

// Whether a kind of post may be written here.
const post = (metadata, kind) => {
  const offers = offersOf(metadata);
  return !offers || (offers.posts || []).includes(kind);
};

export default { profile, post };
