export default {
  newPosts: '{{ count }} neuer Beitrag',
  newPosts_other: '{{ count }} neue Beiträge',
  actions: {
    blockOwner: '{{name}} blockieren',
    unblockOwner: '{{name}} nicht mehr blockieren',
  },
  thread: {
    show: 'Thread anzeigen ({{ count }} Notiz)',
    show_other: 'Thread anzeigen ({{ count }} Notizen)',
  },
  reposted: 'Repostet · {{ when }}',
  // Before the profile a post in a list was made on, for a screen reader:
  // "Rastin Mehr, on Sarah Noble" (components/PostedOn.jsx).
  postedOn: 'bei',
};
