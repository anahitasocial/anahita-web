// Inviting people to follow a group: what the server said became of each
// person, and which of the viewer's followers can still be ticked.
//
// Plain functions, so they can be tested without the dialog.

const INVITED = 'invited';

// Every answer the server gives for one person. Each has its wording under
// socialgraph:invite.results.
const RESULTS = [
  INVITED,
  'already_follower',
  'not_follower',
  'blocked',
  'cooldown',
  'pending',
  'requested',
  'unavailable',
  'full',
];

// The answers by person: { [personId]: result }.
const byPerson = (rows = []) => {
  return (rows || []).reduce((all, row) => {
    return { ...all, [row.personId]: row.result };
  }, {});
};

// The key of the wording for an answer, with one for an answer this version
// does not know.
const resultKey = (result) => {
  return RESULTS.includes(result) ?
    `socialgraph:invite.results.${result}` :
    'socialgraph:invite.results.unavailable';
};

// How many of the people named were invited.
const invitedCount = (rows = []) => {
  return (rows || []).filter((row) => {
    return row.result === INVITED;
  }).length;
};

// Ticking and unticking, up to the most one request may name. Returns the
// same list when a tick would go over.
const toggle = (chosen = [], id, max) => {
  if (chosen.includes(id)) {
    return chosen.filter((each) => {
      return each !== id;
    });
  }

  return chosen.length >= max ? chosen : [...chosen, id];
};

export default {
  INVITED,
  byPerson,
  resultKey,
  invitedCount,
  toggle,
};
