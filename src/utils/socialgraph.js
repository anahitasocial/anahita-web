// The lists behind the number of followers on a profile: which there are
// for a profile and a viewer, the number on each, and adding a page to one.
//
// Plain functions, so they can be tested without the dialog.

const FOLLOWERS = 'followers';
const LEADERS = 'leaders';
const MUTUALS = 'mutuals';

const isPerson = (actor) => {
  return Boolean(actor && actor.type && actor.type.includes('.person.'));
};

// In the order they are shown. Only a person follows anybody, so only a
// person has leaders. What the viewer has in common with a profile is asked
// by somebody signed in, of a profile that is not their own.
const kinds = (actor, viewer) => {
  const list = [FOLLOWERS];

  if (isPerson(actor)) {
    list.push(LEADERS);
  }

  if (viewer && viewer.id && actor && viewer.id !== actor.id) {
    list.push(MUTUALS);
  }

  return list;
};

// The list to open on: the one asked for when the profile has it, or else
// the first.
const known = (list, asked) => {
  return list.includes(asked) ? asked : list[0];
};

// The number on each tab. What is in common is not counted on the profile,
// so that tab has none.
const counts = (actor = {}) => {
  return {
    [FOLLOWERS]: actor.followerCount || 0,
    [LEADERS]: actor.leaderCount || 0,
  };
};

// One list after a page arrived: the page alone when it is the first, or
// added to what there was, without anybody twice.
const merge = (before, response = {}, start = 0) => {
  const page = Array.isArray(response.data) ? response.data : [];
  const pagination = response.pagination || {};
  const had = start === 0 || !before ? [] : before.rows;

  const seen = {};
  had.forEach((row) => {
    seen[row.id] = true;
  });

  const rows = [...had, ...page.filter((row) => {
    return !seen[row.id];
  })];

  // A list with no total says it is whole, so nothing offers more of it.
  const total = typeof pagination.total === 'number' && pagination.total > 0 ?
    pagination.total :
    rows.length;

  return { rows, total: page.length === 0 ? rows.length : total };
};

// The line under a name in a list: their alias, and that they follow the
// viewer when they do.
const rowNote = (row = {}, followsYou = '') => {
  return [
    row.alias ? `@${row.alias}` : '',
    row.isFollowingViewer ? followsYou : '',
  ].filter(Boolean).join(' · ');
};

export default {
  FOLLOWERS,
  LEADERS,
  MUTUALS,
  kinds,
  known,
  counts,
  merge,
  rowNote,
};
