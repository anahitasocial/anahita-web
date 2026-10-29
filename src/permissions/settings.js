import utils from '../utils';

const {
  isAdmin,
  isSuperAdmin,
} = utils.node;

// Site settings: what this installation is, and the OAuth registries
// that decide who can authenticate against it.
//
// Super admin, and only super admin. auth-service checks IsSuperAdmin
// on all eight OAuth methods, and the oauth:read and oauth:write scopes
// that carry them are SuperAdminOnly at token-mint time — an
// administrator's token does not hold them at all.
//
// The approval queue and the invitation list are NOT here, and that is
// why. Both are gated server-side on IsAdminOrSuperAdmin, so keeping
// them behind this predicate would have locked administrators out of
// permissions they hold. They have their own pages and their own
// predicates; see permissions/signupRequest.js and permissions/invite.js.
// One predicate, not two. This replaces a canEdit that the left menu
// called to decide whether to SHOW the link — a read question answered
// by a write permission, which happened to give the right answer only
// because both are super admin. Opening the area and changing things
// in it are the same privilege here, so there is one name for it.
//
// With one opening (the user, 2026-10-29): administrators refuse accounts
// from other networks one by one, so the list of them, the Fediverse tab's
// Accounts, is theirs too. They see Site settings with that tab alone, and
// in it that list alone; everything else stays super administrators'.
const canBrowse = (viewer) => {
  return isAdmin(viewer);
};

// The tabs of Site settings this viewer sees: every one for a super
// administrator, the Fediverse tab alone for an administrator.
const canBrowseTab = (viewer, tab) => {
  if (isSuperAdmin(viewer)) {
    return true;
  }
  return tab === 'fediverse' && isAdmin(viewer);
};

// The servers the installation refuses: super administrators', as the
// server holds them.
const canRefuseServers = (viewer) => {
  return isSuperAdmin(viewer);
};

export default {
  canBrowse,
  canBrowseTab,
  canRefuseServers,
};
