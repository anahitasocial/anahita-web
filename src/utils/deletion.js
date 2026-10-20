// A profile scheduled for deletion: deleted, and purged for good when its
// grace period runs out. The days are the site's (ACCOUNT_GRACE_DAYS, NodeInfo's
// accountGraceDays): the services' sweeper erases it that long after
// deleted_at. 30 while the site has not said.
export const GRACE_DAYS = 30;

// The days a deleted profile can be brought back on this site.
export const graceDays = (nodeInfo) => {
  const days = Number(nodeInfo && nodeInfo.metadata && nodeInfo.metadata.accountGraceDays);
  return days > 0 ? days : GRACE_DAYS;
};

const DAY_MS = 24 * 60 * 60 * 1000;

// When it will be purged, or null when it is not scheduled for deletion.
const purgeDate = (actor, days = GRACE_DAYS) => {
  if (!actor || !actor.deletedAt) {
    return null;
  }
  const deleted = new Date(actor.deletedAt).getTime();
  if (Number.isNaN(deleted)) {
    return null;
  }
  return new Date(deleted + (days * DAY_MS));
};

// Whole days left before it is purged, counting part of a day as a day, and
// never below 0; null when it is not scheduled for deletion.
const daysLeft = (actor, now = Date.now(), days = GRACE_DAYS) => {
  const purge = purgeDate(actor, days);
  if (!purge) {
    return null;
  }
  return Math.max(0, Math.ceil((purge.getTime() - now) / DAY_MS));
};

export default {
  GRACE_DAYS,
  graceDays,
  purgeDate,
  daysLeft,
};
