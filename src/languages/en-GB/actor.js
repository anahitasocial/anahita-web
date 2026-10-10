export default {
  about: 'About',
  name: 'Name',
  alias: 'Alias',
  website: 'Website',
  body: 'Description',
  unknown: 'Unknown',
  // A profile the viewer may not see, which lets people ask to follow it.
  limited: {
    private: 'This profile is private. Its followers can see it.',
    request: 'Request to follow',
    requested: 'Requested',
    withdraw: 'Take the request back',
    failed: 'That could not be done.',
  },
  featured: {
    feature: 'Feature this account',
    unfeature: 'Stop featuring',
    errors: {
      generic: 'Could not change whether this account is featured. Please try again.',
      conflict: 'A disabled or archived account cannot be featured.',
    },
  },
  delete: {
    // The card said nothing about what deletion does, whether it is
    // reversible, or when it takes effect — it offered one text field and a
    // red button. These strings are the disclosure.
    prompts: {
      challenge: 'Type {{ alias }} to confirm',
      inProgress: 'Deleting in progress ...',
    },
    errors: {
      generic: 'Could not delete this profile. Please try again.',
      forbidden: 'You do not have permission to delete this profile.',
      // Fallback only. The server sends a message naming the way out, and
      // it is more specific than this can be.
      lastSuperAdmin: 'This is the only super administrator. Promote someone else, or change this account to administrator, before deleting it.',
    },
  },
  access: {
    title: 'Access',
    cDescription: 'Who can see this profile.',
    // One sentence per level, because the label alone does not say who
    // it means — "Mutuals" and "Leaders" are the site's words, not
    // everybody's.
    descriptions: {
      public: 'Anyone, signed in or not.',
      registered: 'Anyone with an account here.',
      followers: 'People who follow this profile.',
      leaders: 'People this profile follows.',
      mutuals: 'People who follow this profile and are followed back.',
      admins: 'Administrators of this group.',
      myself: 'Nobody else.',
    },
    labels: {
      whoCanSee: 'Who can see this profile?',
      othersCanRequestToFollow: 'Others can request to follow',
      whoCanAddFollowers: 'Who can add followers?',
    },
    alerts: {
      success: 'Access was updated',
      error: 'Access could not be updated.',
    },
  },
  permissions: {
    title: 'Permissions',
    cDescription: 'Who can post, reply and like here. Until these are saved, the site defaults apply.',
    empty: 'Nothing here has permissions to set.',
    restoreDefaults: 'Restore defaults',
    // Per actor type, because "Admins" of a person is that person.
    choices: {
      person: {
        registered: 'Anyone signed in',
        followers: 'Followers',
        leaders: 'Leaders',
        mutuals: 'Mutuals',
        admins: 'Only me',
      },
      group: {
        registered: 'Anyone signed in',
        followers: 'Followers',
        admins: 'Admins',
      },
    },
    // Shown under each choice in the open list — "Leaders" and "Mutuals"
    // are the site's words, not everybody's.
    descriptions: {
      person: {
        registered: 'Anyone with an account here.',
        followers: 'People who follow you.',
        leaders: 'People you follow.',
        mutuals: 'People who follow you and whom you follow back.',
        admins: 'Nobody else.',
      },
      group: {
        registered: 'Anyone with an account here.',
        followers: 'People who follow this group.',
        admins: 'Administrators of this group.',
      },
    },
    // Replies on a profile narrower than registered follow its access.
    commentLocked: {
      followers: 'Followers — this profile is visible to followers only.',
      readers: 'Anyone who can see this profile, as set under Access.',
    },
  },
};
