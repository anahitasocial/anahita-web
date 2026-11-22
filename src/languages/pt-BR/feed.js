export default {
  newPosts: '{{ count }} nova publicação',
  newPosts_other: '{{ count }} novas publicações',
  actions: {
    blockOwner: 'Bloquear {{name}}',
    unblockOwner: 'Desbloquear {{name}}',
  },
  thread: {
    show: 'Ver o fio ({{ count }} nota)',
    show_other: 'Ver o fio ({{ count }} notas)',
  },
  reposted: 'Repostado · {{ when }}',
  // Before the profile a post in a list was made on, for a screen reader:
  // "Rastin Mehr, on Sarah Noble" (components/PostedOn.jsx).
  postedOn: 'em',
};
