export default {
  cTitle: 'Events',
  mTitle: 'Events',
  add: {
    cTitle: 'Create event',
    mTitle: 'Create event',
  },
  settings: {
    info: 'Info',
    admins: 'Admins',
    features: 'Features',
    permissions: 'Permissions',
    access: 'Access',
    // Deletion copy, namespace-specific. The shared actor:delete strings told
    // event administrators to "sign in to restore", which an event cannot do,
    // and that their passkeys would be removed, which an event has none of.
    delete: 'Delete',
    // The card title. Its text is in the accounts namespace, shared with
    // the accounts list.
    purge: 'Delete permanently',
    // Archive. The copy does the work here: archive sits next to delete and
    // must never read as the gentler option. Permanence first, then what is
    // preserved — which is the reason to choose it, not a softener.
    archive: 'Archive',
    archivePrompts: {
      permanent: 'Archiving cannot be undone. There is no way to bring this event back.',
      eventDescription: 'Nothing is deleted. Every post, photo and discussion stays exactly where it is and keeps its address, so links people have saved will keep working. What stops is the event being active: it leaves feeds, suggestions and search, and nobody can post to it again.',
      confirmLabel: 'Type {{ alias }} to confirm',
      action: 'Archive permanently',
      archived: 'This event has been archived.',
      errors: {
        nothingToArchive: 'Nothing to archive — this event is already archived or scheduled for deletion.',
        forbidden: 'You do not have permission to archive this event.',
        lastSuperAdmin: 'This is the only super administrator. Promote someone else before archiving this event.',
        generic: 'Could not archive this event. Please try again.',
      },
    },
    // Disable. Deliberately light — it is a switch, and dressing it up like
    // the two below trains people to type confirmations without reading.
    disable: 'Disable',
    disablePrompts: {
      description: 'Disabling hides this event from everyone. Its followers cannot post to it or find it while it is disabled.',
      descriptionDisabled: 'This event is disabled. It does not appear anywhere and nobody can post to it.',
      reversible: 'This can be undone at any time, and nothing is deleted. To remove a profile permanently, archive or delete it instead.',
      action: 'Disable',
      actionEnable: 'Enable',
      disabled: 'This event has been disabled.',
      enabled: 'This event has been enabled.',
      errors: {
        forbidden: 'You do not have permission to change this.',
        lastSuperAdmin: 'This is the only super administrator and cannot be disabled.',
        generic: 'Could not change this. Please try again.',
      },
    },
    deletePrompts: {
      counts: {
        intro: 'In this event right now:',
        posts: '{{ count }} post',
        posts_other: '{{ count }} posts',
        replies: '{{ count }} reply',
        replies_other: '{{ count }} replies',
        followers: '{{ count }} follower',
        followers_other: '{{ count }} followers',
        admins: '{{ count }} administrator',
        admins_other: '{{ count }} administrators',
        memberSince: 'Created {{ date }}.',
      },
      description: 'Deleting removes this event and everything in it: posts, photos, replies and the list of followers. Content its followers contributed goes with it.',
      reversible: 'This is not immediate. The event is hidden straight away and permanently erased after {{ count }} days. Any administrator can restore it from this page before then.',
      revoked: 'Followers lose access immediately, and the event disappears from their profiles and feeds.',
      handle: 'The name {{ alias }} stays reserved afterwards, so no other event can take it.',
      scheduled: 'This event is scheduled for deletion and will be erased on {{ date }}.',
      restore: 'Restore this event',
      restored: 'This event has been restored.',
      errors: {
        restoreFailed: 'Could not restore this event. It may already have been permanently erased.',
      },
    },
    // Labels the tab; the card inside it still reads "Delete".
    sections: {
      danger: 'Danger zone',
    },
    notifications: 'Notification settings',
    followRequests: 'Follow requests',
  },
  notifications: {
    cTitle: 'Notifications',
    cDescription: 'Edit your notification settings',
    mTitle: 'Notifications',
    email: 'Recieve email notifications',
    optionsTitle: 'Get notifications for',
    options: {
      all: 'All the posts',
      following: 'Only the posts that you are following',
    },
  },
  // What only an event has.
  event: {
    mine: {
      upcoming: 'Upcoming',
      invited: 'Invited',
      hosting: 'Hosting',
      past: 'Past',
    },
    none: {
      upcoming: 'Nothing coming up. Events you say you are going to appear here.',
      invited: 'No invitations waiting.',
      hosting: 'You are not hosting any events.',
      past: 'No past events.',
      hosted: 'No events to show.',
    },
    failed: 'The events could not be loaded.',
    form: {
      name: 'What is it called?',
      body: 'Description',
      startsAt: 'Starts',
      endsAt: 'Ends',
      timezone: 'Time zone',
      capacity: 'Places',
      capacityHelp: 'How many people can go. Leave empty for no limit.',
      onlineUrl: 'Link to join online',
      onlineUrlHelp: 'Shown only to people who are going.',
      websiteUrl: 'Website',
      websiteUrlHelp: 'Shown to everyone who can see the event.',
      access: 'Who can see it?',
      accessOptions: {
        public: 'Anyone',
        registered: 'Anyone signed in',
        followers: 'Only people who are going or invited',
      },
      hostedBy: 'Hosted by {{ name }}',
      openToHostFollowers: 'Everyone who follows {{ name }} can see it and answer',
      address: {
        title: 'Where is it?',
        help: 'Shown only to people who are going. It is not added to the site\'s places.',
        street: 'Address',
        city: 'City',
        stateProvince: 'Province or state',
        country: 'Country',
        showMap: 'Show a map',
        showMapHelp: 'The address is sent to a mapping service to find it. The map is shown only to people who are going.',
      },
      create: 'Create event',
      save: 'Save',
      edit: 'Edit event',
      errors: {
        invalid_time: 'Choose when it starts and ends.',
        ends_before_start: 'It has to end after it starts.',
        too_long: 'An event can last a year at most.',
        invalid_timezone: 'Choose a time zone.',
        already_over: 'That time has already passed.',
        host_not_allowed: 'You can only host an event with a group you administer.',
        generic: 'The event could not be saved.',
      },
    },
    when: {
      // The same day: 5 November 2026, 19:00 to 21:00.
      sameDay: '{{ date }}, {{ start }} to {{ end }}',
      // Different days.
      range: '{{ start }} to {{ end }}',
      inZone: 'Times shown in {{ zone }}.',
      eventZone: 'The event is in {{ zone }}: {{ time }} there.',
    },
    state: {
      upcoming: 'Upcoming',
      happening: 'Happening now',
      past: 'This event is over.',
      cancelled: 'This event was cancelled.',
    },
    rsvp: {
      going: 'Going',
      maybe: 'Maybe',
      leave: 'Not going',
      youAreGoing: 'You are going',
      youSaidMaybe: 'You said maybe',
      full: 'Every place is taken',
      closed: 'This event is no longer taking answers.',
      failed: 'That could not be done.',
    },
    counts: {
      going_one: '{{ count }} going',
      going_other: '{{ count }} going',
      maybe_one: '{{ count }} maybe',
      maybe_other: '{{ count }} maybe',
      places: '{{ going }} of {{ capacity }} places taken',
    },
    attendees: {
      title: 'Who is going',
      going: 'Going',
      maybe: 'Maybe',
      none: {
        going: 'Nobody has said they are going yet.',
        maybe: 'Nobody has said maybe.',
      },
    },
    online: {
      join: 'Join online',
      forGoing: 'There is a link to join online. It is shown to people who are going.',
    },
    host: 'Hosted by',
    address: {
      title: 'Where',
      maps: {
        apple: 'Apple Maps',
        google: 'Google Maps',
        osm: 'OpenStreetMap',
      },
      forGoing: 'The address is shown to people who are going.',
    },
    viaHost: 'This event is for the followers of the group hosting it. You follow that group, so you can answer.',
    calendar: 'Add to calendar',
    cancel: {
      action: 'Cancel event',
      title: 'Cancel this event?',
      message: 'Everyone going will see that it was cancelled. The event stays where it is, and this cannot be undone.',
      confirm: 'Cancel event',
      keep: 'Keep it',
      done: 'The event was cancelled.',
      failed: 'The event could not be cancelled.',
    },
    add: 'Add event',
    tab: 'Events',
  },
  confirm: {
    delete: "Do you want to delete {{ name }}'s profile?",
  },
};
