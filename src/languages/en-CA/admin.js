export default {
  cTitle: 'Administration',
  cDescription: 'Reports, signup requests and invitations that administrators look after.',
  mTitle: 'Administration',
  tabWithCount: '{{title}} ({{count}})',
  waiting_one: '{{count}} item waiting',
  waiting_other: '{{count}} items waiting',
  restricted: {
    cTitle: 'Administration is restricted',
    cDescription: 'Administrators only.',
  },
  // The Scheduled for deletion tab: admin/Scheduled.
  scheduled: {
    title: 'Scheduled for deletion',
    description: 'Every profile on its way out, soonest first. Each can be restored, or removed for good, from its settings until its days run out.',
    empty: 'Nothing is scheduled for deletion.',
    settings: 'Settings',
    loadError: 'Could not load what is scheduled for deletion.',
    kinds: {
      person: 'Person',
      group: 'Group',
      event: 'Event',
      website: 'Website',
    },
  },
};
