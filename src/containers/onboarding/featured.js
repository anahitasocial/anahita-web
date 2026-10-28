import { singularize } from 'inflection';

import api from '../../api';
import { Onboarding as ONBOARDING } from '../../constants';

const { STEPS } = ONBOARDING;

// The featured accounts step's list: the inviter first, then the people,
// groups, websites and events the installation features.
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
  websites = [],
  events = [],
  viewer,
}) => {
  const seen = new Set([viewer && viewer.id]);
  const list = [];

  [inviter, ...people, ...groups, ...websites, ...events].forEach((actor) => {
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
  return api[namespace][singularize(namespace)].featured.browse({ limit: LIMIT })
    .then(({ data }) => { return (data && data.data) || []; });
};

// loadFeatured resolves to the list, never rejects.
const loadFeatured = (viewer) => {
  return Promise.allSettled([
    readInviter(),
    browseFeatured('people'),
    browseFeatured('groups'),
    browseFeatured('websites'),
    browseFeatured('events'),
  ]).then(([inviter, people, groups, websites, events]) => {
    return {
      inviterId: (settledValue(inviter, null) || {}).id || null,
      actors: mergeFeatured({
        inviter: settledValue(inviter, null),
        people: settledValue(people, []),
        groups: settledValue(groups, []),
        websites: settledValue(websites, []),
        events: settledValue(events, []),
        viewer,
      }),
    };
  });
};

// Fewer hashtags than this to offer, and the Interests step is left out:
// three is too few to choose among.
const FEWEST_INTERESTS = 3;

// The steps somebody gets, in order, from how much each list step has to
// show. Profile and photo always, the profile first so that the photo's
// circle shows the initials of the name just given; Interests when there are enough hashtags
// to pick from; the featured accounts when there are any; Recommended when
// the installation has the recommendation service (it is asked for its
// list when the step is reached, and moves on by itself when that is
// empty).
const stepsFor = ({ interests = 0, featured = 0, hasRecommendations = false }) => {
  const steps = [STEPS.PROFILE, STEPS.AVATAR];
  if (interests >= FEWEST_INTERESTS) {
    steps.push(STEPS.INTERESTS);
  }
  if (featured > 0) {
    steps.push(STEPS.FEATURED);
  }
  if (hasRecommendations) {
    steps.push(STEPS.RECOMMENDED);
  }
  return steps;
};

export default {
  loadFeatured,
  mergeFeatured,
  stepsFor,
  FEWEST_INTERESTS,
};
