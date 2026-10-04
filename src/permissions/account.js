import utils from '../utils';

const {
  isSuperAdmin,
} = utils.node;

// The accounts list, and removing accounts for good.
//
// Super administrators only, which is what the API enforces on both:
// GET /accounts and every purge route refuse anybody else. An
// administrator can delete an account, which can be undone for thirty
// days. This cannot.
const canBrowse = (viewer) => {
  return isSuperAdmin(viewer);
};

// Whether the viewer may remove this actor for good from its own
// settings page. Never themselves: the API refuses that too.
const canPurge = (viewer, actor) => {
  return isSuperAdmin(viewer) && Boolean(actor) && actor.id !== viewer.id;
};

export default {
  canBrowse,
  canPurge,
};
