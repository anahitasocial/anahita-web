// A profile scheduled for deletion: deleted, and purged for good when its
// grace period runs out. The services' sweeper erases it GRACE_DAYS after
// deleted_at (graph-grpc-service/sweeper, GraceDays); the two must agree.
export const GRACE_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

// When it will be purged, or null when it is not scheduled for deletion.
const purgeDate = (actor) => {
  if (!actor || !actor.deletedAt) {
    return null;
  }
  const deleted = new Date(actor.deletedAt).getTime();
  if (Number.isNaN(deleted)) {
    return null;
  }
  return new Date(deleted + (GRACE_DAYS * DAY_MS));
};

// Whole days left before it is purged, counting part of a day as a day, and
// never below 0; null when it is not scheduled for deletion.
const daysLeft = (actor, now = Date.now()) => {
  const purge = purgeDate(actor);
  if (!purge) {
    return null;
  }
  return Math.max(0, Math.ceil((purge.getTime() - now) / DAY_MS));
};

export default {
  GRACE_DAYS,
  purgeDate,
  daysLeft,
};
