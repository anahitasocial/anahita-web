import permissions from '../../permissions';
import utils from '../../utils';

const { isAdmin } = utils.node;

// The administration area's tabs, in the order they are shown.
//
// Each tab says who may see it, reusing the rule its page already
// enforces, so the tab bar and the page cannot disagree. A tab somebody
// may not see is not rendered at all, and typing its address lands on
// the first tab they may.
//
// `count` names the entry in the admin counts (state.admin.counts) that
// says how many things on that tab are waiting for somebody.
//
// The key is the last part of the address: /admin/<key>.
const TABS = [
  {
    key: 'signup-requests',
    title: 'signupRequests:mTitle',
    count: 'signupRequests',
    canView: (viewer) => {
      return permissions.signupRequest.canBrowse(viewer);
    },
  },
  {
    // Invitations are here for administrators, who see everybody's.
    // Where members may invite too (INVITES_FROM), they keep their own
    // page at /invites: this area is not theirs to open.
    key: 'invites',
    title: 'invites:mTitle',
    canView: (viewer) => {
      return isAdmin(viewer);
    },
  },
  {
    key: 'settings',
    title: 'settings:mTitle',
    canView: (viewer) => {
      return permissions.settings.canBrowse(viewer);
    },
  },
];

const visibleTabs = (viewer) => {
  return TABS.filter((tab) => {
    return tab.canView(viewer);
  });
};

// Whether the viewer has an administration area at all.
const canBrowse = (viewer) => {
  return visibleTabs(viewer).length > 0;
};

// How many things are waiting across the tabs this viewer may see. This
// is the number on the menu entry.
const waitingCount = (viewer, counts = {}) => {
  return visibleTabs(viewer).reduce((total, tab) => {
    const count = tab.count ? Number(counts[tab.count]) || 0 : 0;
    return total + count;
  }, 0);
};

export default {
  TABS,
  visibleTabs,
  canBrowse,
  waitingCount,
};
