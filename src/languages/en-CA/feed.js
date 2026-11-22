export default {
  newPosts: '{{ count }} new post',
  newPosts_other: '{{ count }} new posts',
  actions: {
    blockOwner: 'Block {{name}}',
    unblockOwner: 'Unblock {{name}}',
  },
  thread: {
    show: 'Show the thread ({{ count }} note)',
    show_other: 'Show the thread ({{ count }} notes)',
  },
  reposted: 'Reposted · {{ when }}',
  // Before the profile a post in a list was made on, for a screen reader:
  // "Rastin Mehr, on Sarah Noble" (components/PostedOn.jsx).
  postedOn: 'on',
};
