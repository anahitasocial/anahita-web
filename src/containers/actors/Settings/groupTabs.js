// The tabs of a group's, an event's or a website's settings page, and the
// actions inside their Danger zone.
//
// Not sections: a handful of tabs does not need grouping, and a group has
// none of a person's account or security items. The shape matches a
// section's items so both kinds of page share one renderer, which is what
// makes a group's Danger zone identical to a person's — the alternative was
// one tab on the page drawn differently from its neighbours, which reads as a
// bug.
//
// `bare` follows the same rule as everywhere else: true when the component
// does not render its own Card. Verified per component — Access brings one,
// Info, Admins and Delete do not.

import { ITEMS, isOffered } from './items';

// A group's and an event's tabs, in order.
const GROUP_TABS = [
  // An event's Info is the event form, which brings its own Card: see
  // `infoHasCard` below.
  { key: ITEMS.INFO, bare: true },
  { key: ITEMS.ADMINS, bare: true },
  { key: ITEMS.ACCESS, bare: false },
  // Brings its own Card, like Access.
  { key: ITEMS.PERMISSIONS, bare: false },
  // What somebody agrees to before following it or answering it. A form
  // of its own, in the Card the page supplies.
  { key: ITEMS.RULES, bare: true },
  // What was reported against those rules, for its administrators to act
  // on where it is.
  { key: ITEMS.REPORTS, bare: true },
  // ONE Danger zone tab holding the three lifecycle actions, rather than
  // three tabs of their own.
  //
  // A tab strip reads as a list of equals, so "Disable" sitting between
  // "Access" and "Archive" made a suspension look like another setting. It
  // also spread the three actions that need comparing across three places:
  // choosing between disable, archive and delete means weighing what each
  // does to the content, and you cannot weigh things you cannot see at once.
  //
  // Matches the person page, which has had a Danger section from the start.
  { key: ITEMS.DANGER, bare: true, requiresDanger: true },
];

// A channel (roadmap row 147, phase 2) has a group's privacy: who sees it
// and may ask to follow it, who sees its followers, and whom it blocked.
// Nobody but it posts on it, so no rules, and its Posts tab says what it
// posts (phase 3) rather than who may; then the lines its site pastes in
// to lead people to it.
const CHANNEL_TABS = [
  { key: ITEMS.INFO, bare: true },
  { key: ITEMS.ADMINS, bare: true },
  { key: ITEMS.ACCESS, bare: false },
  { key: ITEMS.PERMISSIONS, bare: false },
  // Its feed and the lines for its site, each a Card of its own.
  { key: ITEMS.WEBSITE, bare: false },
  // Named and laid out as a person's network tab is: whether it is on
  // the fediverse, off until turned on, and its own Bluesky account,
  // where its notes are posted too. Both bring their own Card.
  { key: ITEMS.FEDIVERSE, bare: false },
  { key: ITEMS.DANGER, bare: true, requiresDanger: true },
];

// The lifecycle actions inside the Danger zone, in the same order and by the
// same rules as the person page: the reversible one first, then the two that
// are not. An event has one more, first: calling it off, for whoever looks
// after it.
const DANGER_ITEMS = [
  { key: ITEMS.CANCEL, bare: true, requiresCancel: true },
  { key: ITEMS.DISABLE, bare: true, requiresAdmin: true },
  {
    key: ITEMS.ARCHIVE, bare: true, requiresDelete: true, requiresArchive: true,
  },
  { key: ITEMS.DELETE, bare: true, requiresDelete: true },
  // Delete permanently, with no thirty days. Super administrators only.
  { key: ITEMS.PURGE, bare: true, requiresSuperAdmin: true },
];

// getGroupTabs returns the flat tabs for a group, an event or a website.
//
// The Danger tab earns its place if ANY of the actions inside it does.
// Hiding it when only one applies would leave that action unreachable. A
// website has nothing to call off, so only deleting and disabling count
// there.
export const getGroupTabs = ({
  canDelete,
  isAdmin,
  infoHasCard = false,
  canCancel = false,
  isChannel = false,
}) => {
  const tabs = isChannel ? CHANNEL_TABS : GROUP_TABS;
  const hasDanger = canDelete || isAdmin || (!isChannel && canCancel);

  return tabs
    .filter((item) => {
      return !item.requiresDanger || hasDanger;
    })
    .map((item) => {
      if (!isChannel && item.key === ITEMS.INFO) {
        return { ...item, bare: !infoHasCard };
      }
      return { ...item };
    });
};

// The actions inside a Danger zone that this viewer is offered.
export const getGroupDangerItems = ({
  canDelete,
  isAdmin,
  isSuperAdmin = false,
  canCancel = false,
  // Not a website: one is deleted, not archived, since its posts are a
  // website's and the site keeps them.
  canArchive = true,
  // Scheduled for deletion: only the way back is offered, the Delete card
  // showing Restore, and removing it for good (the user, 2026-10-18).
  // Calling it off, disabling it and archiving it are for a live one, and
  // its Disable card would read "disabled" with an Enable that is refused.
  isDeleted = false,
}) => {
  const can = {
    canDelete, isAdmin, isSuperAdmin, canCancel, canArchive,
  };

  return DANGER_ITEMS
    .filter((item) => {
      if (isDeleted && item.key !== ITEMS.DELETE && item.key !== ITEMS.PURGE) {
        return false;
      }
      return isOffered(item, can);
    })
    .map((item) => {
      return { ...item };
    });
};
