// The items a profile's settings page can hold, and the one rule that says
// whether somebody is offered one.
//
// Shared by the person's sections (sections.js) and a group's, an event's
// or a website's tabs (groupTabs.js). Keys, not elements: the page owns
// rendering (panels.jsx), and these modules own what exists and when, so
// they can be read and tested as plain data.

// Item keys. These double as i18n lookups and as React keys.
export const ITEMS = {
  INFO: 'info',
  ADMINS: 'admins',
  EMAIL: 'email',
  USERNAME: 'username',
  PASSWORD: 'password',
  TOTP: 'totp',
  WEBAUTHN: 'webauthn',
  AUTHLOGS: 'authLogs',
  ACCESS: 'access',
  // Whether reposts show among the posts on the profile.
  REPOSTS: 'reposts',
  // Who can quote this person's posts.
  QUOTES: 'quotes',
  // Whether new photos and videos start out downloadable.
  DOWNLOADS: 'downloads',
  // A copy of everything the viewer put here, as one file.
  DATA_EXPORT: 'dataExport',
  // Who they follow, block and mute, and what they saved, from a file.
  DATA_IMPORT: 'dataImport',
  // The people the viewer has blocked.
  BLOCKED: 'blocked',
  // The people the viewer has muted (roadmap row 133).
  MUTED: 'muted',
  // The servers the viewer has blocked for themselves (roadmap row 152).
  BLOCKED_SERVERS: 'blockedServers',
  // What the viewer chose about suggestions of who to follow.
  SUGGESTIONS: 'suggestions',
  FEDIVERSE: 'fediverse',
  // Moving one's account here from elsewhere, or away (roadmap row 124).
  MOVING: 'moving',
  BLUESKY: 'bluesky',
  // What the person is told about: eight kinds of thing, on or off.
  NOTIFICATIONS: 'notifications',
  // Show, Warn or Hide for each kind of content warning.
  CONTENT_CHOICES: 'contentChoices',
  PERMISSIONS: 'permissions',
  // A group's or an event's rules, ticked before following or answering it
  // (roadmap row 102, part 5).
  RULES: 'rules',
  // A group's or an event's reports against its rules.
  REPORTS: 'reports',
  AGREEMENTS: 'agreements',
  // A person's account type: registered, administrator or super
  // administrator, and changing it.
  ACCOUNT_TYPE: 'accountType',
  METADATA: 'metadata',
  REVOKE_PASSKEYS: 'revokePasskeys',
  REVOKE_TOTP: 'revokeTotp',
  DANGER: 'danger',
  // A website's: the few lines of HTML its site pastes in to lead to it.
  WEBSITE: 'website',
  DISABLE: 'disable',
  // Calling an event off. Events only.
  CANCEL: 'cancel',
  ARCHIVE: 'archive',
  DELETE: 'delete',
  PURGE: 'purge',
};

// Whether an item is offered, given what the viewer may do here. Each flag
// an item carries is one condition, and every one of them must hold:
//
//   viewerOnly          only on the viewer's own profile
//   notViewer           only on somebody else's: the mirror of viewerOnly
//   requiresDelete      the viewer may delete the profile (`canDelete`)
//   requiresAdmin       the viewer is a site administrator (`isAdmin`)
//   requiresSuperAdmin  the viewer is a super administrator (`isSuperAdmin`)
//   requiresCancel      the viewer may call an event off (`canCancel`)
//   requiresArchive     the profile may be archived (`canArchive`)
//
// An item with none of them is always offered.
export const isOffered = (item, {
  isViewer = false,
  canDelete = false,
  isAdmin = false,
  isSuperAdmin = false,
  canCancel = false,
  canArchive = true,
}) => {
  const unmet = [
    item.viewerOnly && !isViewer,
    item.notViewer && isViewer,
    item.requiresDelete && !canDelete,
    item.requiresAdmin && !isAdmin,
    item.requiresSuperAdmin && !isSuperAdmin,
    item.requiresCancel && !canCancel,
    item.requiresArchive && !canArchive,
  ];

  return !unmet.some(Boolean);
};
