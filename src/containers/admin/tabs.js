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
//
// Site settings are deliberately not here. They are for super
// administrators alone and have a menu entry of their own (/settings):
// they configure the installation, and this area looks after the people
// on it.
const TABS = [
  {
    // First, because it is the tab where waiting costs the most.
    key: 'reports',
    title: 'abuseReports:mTitle',
    count: 'reports',
    canView: (viewer) => {
      return isAdmin(viewer);
    },
  },
  {
    key: 'signup-requests',
    title: 'signupRequests:mTitle',
    count: 'signupRequests',
    canView: (viewer) => {
      return permissions.signupRequest.canBrowse(viewer);
    },
  },
  {
    // An administrator's own invitations. Where members may invite too
    // (INVITES_FROM), they keep the page at /invites: this area is not
    // theirs to open.
    key: 'invites',
    title: 'invites:mTitle',
    canView: (viewer) => {
      return isAdmin(viewer);
    },
  },
  {
    // Every person and group, for clearing out the ones nobody uses.
    // Super administrators only: what this tab is for is removing
    // accounts for good, which an administrator may not do. Last, because
    // it is the one tab most administrators never see.
    key: 'accounts',
    title: 'accounts:mTitle',
    canView: (viewer) => {
      return permissions.account.canBrowse(viewer);
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
