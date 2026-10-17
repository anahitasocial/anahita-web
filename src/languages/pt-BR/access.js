export default {
  public: 'Público',
  registered: 'Membros conectados',
  followers: 'Seguidores',
  leaders: 'Seguindo',
  mutuals: 'Mútuos',
  admins: 'Admins',
  myself: 'Só eu',
  // Choosing who can see a post while writing it. Its own wording, not
  // the bare level names above: here each one has to say whose followers
  // and whose administrators are meant.
  audience: {
    label: 'Quem pode ver: {{ name }}',
    names: {
      public: 'Público',
      registered: 'Pessoas conectadas',
      followers: 'Seguidores',
      leaders: 'Seguindo',
      mutuals: 'Mútuos',
      admins: 'Administração',
      myself: 'Só eu',
    },
    descriptions: {
      public: 'Qualquer pessoa, conectada ou não',
      registered: 'Qualquer pessoa conectada',
      own: {
        followers: 'Pessoas que seguem você',
        leaders: 'Pessoas que você segue',
        mutuals: 'Pessoas que você segue e que também seguem você',
        myself: 'Mais ninguém',
      },
      person: {
        followers: 'Pessoas que seguem {{ name }}',
        leaders: 'Pessoas que {{ name }} segue',
        mutuals: 'Pessoas que {{ name }} segue e que também seguem esse perfil',
        myself: 'Só {{ name }}',
      },
      group: {
        followers: 'Pessoas que seguem {{ name }}',
        admins: 'A administração de {{ name }}',
      },
    },
    capped: 'Indisponível aqui: {{ name }} não tem uma visibilidade tão ampla, então uma publicação nele também não pode ter.',
  },
};
