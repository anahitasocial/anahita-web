export default {
  public: 'Público',
  registered: 'Miembros registrados',
  followers: 'Seguidores',
  leaders: 'Seguidos',
  mutuals: 'Mutuos',
  admins: 'Admins',
  myself: 'Solo yo',
  // Choosing who can see a post while writing it. Its own wording, not
  // the bare level names above: here each one has to say whose followers
  // and whose administrators are meant.
  audience: {
    label: 'Quién puede ver esto: {{ name }}',
    names: {
      public: 'Público',
      registered: 'Miembros con sesión iniciada',
      followers: 'Seguidores',
      leaders: 'Seguidos',
      mutuals: 'Mutuos',
      admins: 'Admins',
      myself: 'Solo yo',
    },
    descriptions: {
      public: 'Cualquiera, con o sin sesión iniciada',
      registered: 'Cualquiera que haya iniciado sesión',
      own: {
        followers: 'Las personas que te siguen',
        leaders: 'Las personas que sigues',
        mutuals: 'Las personas que sigues y que te siguen',
        myself: 'Nadie más',
      },
      person: {
        followers: 'Las personas que siguen a {{ name }}',
        leaders: 'Las personas a quienes sigue {{ name }}',
        mutuals: 'Las personas a quienes sigue {{ name }} y que le siguen también',
        myself: 'Solo {{ name }}',
      },
      group: {
        followers: 'Las personas que siguen a {{ name }}',
        admins: 'La administración de {{ name }}',
      },
    },
    capped: 'No disponible aquí: {{ name }} no es visible tan ampliamente, así que una publicación ahí tampoco puede serlo.',
  },
};
