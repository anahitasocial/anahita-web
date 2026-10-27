export default {
  cTitle: 'Inicio',
  mTitle: 'Inicio',
  // The home page of somebody who is not signed in.
  guest: {
    signIn: 'Iniciar sesión',
    join: 'Unirse',
    people: '{{ formatted }} persona',
    people_other: '{{ formatted }} personas',
    posts: '{{ formatted }} publicación',
    posts_other: '{{ formatted }} publicaciones',
    federated: 'Parte del fediverso',
    bluesky: 'Conectado a Bluesky',
    reasons: {
      follow: {
        title: 'Personas, grupos y eventos',
        body: 'Sigue a las personas, los grupos y los eventos que te importan, y lee lo que publican en un solo lugar.',
      },
      feeds: {
        title: 'Feeds a tu medida',
        body: 'Crea tus propios feeds con hashtags, lugares y los perfiles que elijas. Nada se ordena a tus espaldas: lo más nuevo va primero.',
      },
      yours: {
        title: 'Lo que publicas sigue siendo tuyo',
        body: 'Tú eliges quién ve cada publicación, y puedes llevarte una copia de todo lo que has creado cuando quieras.',
      },
      // On an installation that takes part in other networks: which.
      networks: {
        both: {
          title: 'Parte del fediverso',
          body: 'Sigue a personas de Mastodon y Bluesky, y deja que te sigan y te respondan, sin salir de este sitio. Habla los protocolos de ambas: ActivityPub y AT Protocol.',
        },
        activitypub: {
          title: 'Parte del fediverso',
          body: 'Sigue a personas de Mastodon y de los otros servidores del fediverso, y deja que te sigan y te respondan, sin salir de este sitio. Habla su protocolo, ActivityPub.',
        },
        atproto: {
          title: 'Conectado a Bluesky',
          body: 'Sigue a personas de Bluesky y respóndeles con tu propia cuenta de Bluesky, sin salir de este sitio. Habla el protocolo de Bluesky, AT Protocol.',
        },
      },
    },
    lookAround: 'Echa un vistazo',
    places: {
      people: 'Personas',
      groups: 'Grupos',
      hashtags: 'Hashtags',
      about: 'Acerca de este sitio',
    },
    runsOn: 'Este sitio funciona con',
    runsOnAfter: ', software de código abierto para comunidades.',
  },
  // Shown in place of every page to somebody who is not signed in, on an
  // installation that is members-only (SITE_READ_ACCESS=registered).
  membersOnly: {
    cTitle: 'Este sitio es para sus miembros',
    cDescription: 'Inicia sesión para leerlo. Aquí no se muestra nada a quienes no han iniciado sesión.',
    signIn: 'Iniciar sesión',
  },
  // For somebody who is not signed in, on an installation that shows
  // visitors only the start of what is public (SITE_READ_ACCESS=preview).
  preview: {
    cTitle: 'Estás viendo una vista previa',
    cDescription: 'Inicia sesión para leer las publicaciones completas, las respuestas y todo lo que va después de la primera página.',
    signIn: 'Iniciar sesión',
    readMore: 'Inicia sesión para leer más',
    comments: 'Inicia sesión para leer las respuestas',
    followers: 'Inicia sesión para ver quién sigue a quién',
  },
};
