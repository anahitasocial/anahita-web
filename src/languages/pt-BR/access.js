export default {
  public: 'Público',
  registered: 'Pessoas conectadas',
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
      admins: 'Admins',
      myself: 'Só eu',
    },
    descriptions: {
      public: 'Qualquer pessoa, conectada ou não',
      registered: 'Qualquer pessoa conectada',
      own: {
        followers: 'Pessoas que seguem você',
        leaders: 'Pessoas que você segue',
        mutuals: 'Vocês se seguem mutuamente',
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
        admins: 'Os admins de {{ name }}',
      },
    },
    capped: 'Indisponível aqui: {{ name }} não tem uma visibilidade tão ampla, então uma publicação nele também não pode ter.',
  },
  // The access dialog's reasons a level cannot be chosen (roadmap row 155).
  dialog: {
    notOnSite: 'Este site reserva o que é novo a pessoas conectadas',
    notNarrower: 'Não mais restrito que este perfil',
  },
  // Whether search engines may index a profile and its posts (anahita-services
  // roadmap row 174): `noindex` when not, which hides nothing.
  searchEngines: {
    title: 'Mecanismos de busca',
    label: 'Permitir que mecanismos de busca indexem este perfil',
    help: 'Mecanismos de busca como o Google podem incluir este perfil e suas publicações. Desativado, pedimos que não o façam. Quem pode vê-los continua como definido acima.',
    saved: 'Salvo',
    notSaved: 'Não foi possível salvar. Tente de novo em um instante.',
  },
};
