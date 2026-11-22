export default {
  newPosts: '{{ count }} publicación nueva',
  newPosts_other: '{{ count }} publicaciones nuevas',
  actions: {
    blockOwner: 'Bloquear a {{name}}',
    unblockOwner: 'Desbloquear a {{name}}',
  },
  thread: {
    show: 'Ver el hilo ({{ count }} nota)',
    show_other: 'Ver el hilo ({{ count }} notas)',
  },
  reposted: 'Reposteado · {{ when }}',
  // Before the profile a post in a list was made on, for a screen reader:
  // "Rastin Mehr, on Sarah Noble" (components/PostedOn.jsx).
  postedOn: 'en',
};
