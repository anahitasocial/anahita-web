export default {
  cTitle: 'Início',
  mTitle: 'Início',
  // The home page of somebody who is not signed in.
  guest: {
    signIn: 'Entrar',
    join: 'Criar um perfil',
    people: '{{ formatted }} pessoa',
    people_other: '{{ formatted }} pessoas',
    posts: '{{ formatted }} publicação',
    posts_other: '{{ formatted }} publicações',
    federated: 'Parte do fediverso',
    bluesky: 'Conectado ao Bluesky',
    reasons: {
      follow: {
        title: 'Pessoas, grupos e eventos',
        body: 'Siga as pessoas, os grupos e os eventos que importam para você, e leia o que publicam em um só lugar.',
      },
      feeds: {
        title: 'Feeds montados por você',
        body: 'Crie seus próprios feeds a partir de hashtags, locais e dos perfis que você escolher. Nada é classificado pelas suas costas: o mais novo vem primeiro.',
      },
      yours: {
        title: 'O que você publica continua sendo seu',
        body: 'Você escolhe quem vê cada publicação, e pode baixar uma cópia de tudo o que criou quando quiser.',
      },
      // On an installation that takes part in other networks: which.
      networks: {
        both: {
          title: 'Parte do fediverso',
          body: 'Siga pessoas no Mastodon e no Bluesky, e deixe que elas sigam e respondam você, sem sair deste site. Ele fala os dois protocolos: ActivityPub e AT Protocol.',
        },
        activitypub: {
          title: 'Parte do fediverso',
          body: 'Siga pessoas no Mastodon e nos outros servidores do fediverso, e deixe que elas sigam e respondam você, sem sair deste site. Ele fala o protocolo delas, o ActivityPub.',
        },
        atproto: {
          title: 'Conectado ao Bluesky',
          body: 'Siga pessoas no Bluesky e responda a elas com sua própria conta do Bluesky, sem sair deste site. Ele fala o protocolo do Bluesky, o AT Protocol.',
        },
      },
    },
    lookAround: 'Dê uma olhada',
    places: {
      people: 'Pessoas',
      groups: 'Grupos',
      hashtags: 'Hashtags',
      about: 'Sobre este site',
    },
    runsOn: 'Este site funciona com',
    runsOnAfter: ', software livre para comunidades.',
  },
  // Shown in place of every page to somebody who is not signed in, on an
  // installation that is members-only (SITE_READ_ACCESS=registered).
  membersOnly: {
    cTitle: 'Este site é para os membros',
    cDescription: 'Entre para ler. Nada aqui é mostrado a quem não está conectado.',
    signIn: 'Entrar',
  },
  // For somebody who is not signed in, on an installation that shows
  // visitors only the start of what is public (SITE_READ_ACCESS=preview).
  preview: {
    cTitle: 'Você está vendo uma prévia',
    cDescription: 'Entre para ler publicações inteiras, respostas e tudo depois da primeira página.',
    signIn: 'Entrar',
    readMore: 'Entre para ler mais',
    comments: 'Entre para ler as respostas',
    followers: 'Entre para ver quem segue quem',
  },
};
