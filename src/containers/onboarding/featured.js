import api from '../../api';

// The featured accounts step's list: the inviter first, then the people and
// groups the installation features.
//
// Each source can fail on its own and counts as empty when it does. Blocks and
// disabled accounts are the server's business — browse leaves them out, and
// /people/:alias does not answer for them — so nothing here re-checks them.

const LIMIT = 20;

// mergeFeatured orders and de-duplicates. The inviter may well be featured
// too, and is shown once, first. The viewer is never offered to themselves.
const mergeFeatured = ({
  inviter = null,
  people = [],
  groups = [],
  viewer,
}) => {
  const seen = new Set([viewer && viewer.id]);
  const list = [];

  [inviter, ...people, ...groups].forEach((actor) => {
    if (!actor || !actor.id || seen.has(actor.id)) {
      return;
    }

    seen.add(actor.id);
    list.push(actor);
  });

  return list;
};

const settledValue = (result, fallback) => {
  return result.status === 'fulfilled' ? result.value : fallback;
};

const readInviter = () => {
  return api.onboarding.read()
    .then(({ data }) => {
      if (!data || !data.invitedBy) {
        return null;
      }

      return api.people.read(data.invitedBy).then((response) => { return response.data; });
    });
};

const browseFeatured = (namespace) => {
  return api[namespace].browse({ featured: true, limit: LIMIT })
    .then(({ data }) => { return (data && data.data) || []; });
};

// loadFeatured resolves to the list, never rejects.
const loadFeatured = (viewer) => {
  return Promise.allSettled([
    readInviter(),
    browseFeatured('people'),
    browseFeatured('groups'),
  ]).then(([inviter, people, groups]) => {
    return {
      inviterId: (settledValue(inviter, null) || {}).id || null,
      actors: mergeFeatured({
        inviter: settledValue(inviter, null),
        people: settledValue(people, []),
        groups: settledValue(groups, []),
        viewer,
      }),
    };
  });
};

export default {
  loadFeatured,
  mergeFeatured,
};
