export default {
  public: 'Público',
  registered: 'Miembros con sesión iniciada',
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
        mutuals: 'Se siguen mutuamente',
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
        admins: 'Los admins de {{ name }}',
      },
    },
    capped: 'No disponible aquí: {{ name }} no es visible tan ampliamente, así que una publicación ahí tampoco puede serlo.',
  },
  // The access dialog's reasons a level cannot be chosen (roadmap row 155).
  dialog: {
    notOnSite: 'Este sitio reserva lo nuevo a quienes iniciaron sesión',
    notNarrower: 'No más restringido que este perfil',
  },
  // Whether search engines may index a profile and its posts (anahita-services
  // roadmap row 174): `noindex` when not, which hides nothing.
  searchEngines: {
    title: 'Motores de búsqueda',
    label: 'Permitir que los motores de búsqueda indexen este perfil',
    help: 'Los motores de búsqueda como Google pueden incluir este perfil y sus publicaciones. Desactivado, se les pide que no lo hagan. Quién puede verlos sigue como se configuró arriba.',
    saved: 'Guardado',
    notSaved: 'No se pudo guardar. Inténtalo de nuevo en un momento.',
  },
};
