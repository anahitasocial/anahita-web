export default {
  cTitle: 'Accueil',
  mTitle: 'Accueil',
  // La page d'accueil d'une personne non connectée.
  guest: {
    signIn: 'Se connecter',
    join: 'Créer un profil',
    people: '{{ formatted }} personne',
    people_plural: '{{ formatted }} personnes',
    posts: '{{ formatted }} publication',
    posts_plural: '{{ formatted }} publications',
    federated: 'Fait partie du fédivers',
    reasons: {
      follow: {
        title: 'Personnes, groupes et événements',
        body: 'Suivez les personnes, les groupes et les événements qui comptent pour vous, et lisez ce qu’ils publient au même endroit.',
      },
      feeds: {
        title: 'Des fils que vous composez',
        body: 'Composez vos propres fils à partir de hashtags, de lieux et des profils que vous choisissez. Rien n’est classé à votre insu : le plus récent vient en premier.',
      },
      yours: {
        title: 'Ce que vous publiez reste à vous',
        body: 'Vous choisissez qui voit chaque publication, et vous pouvez emporter une copie de tout ce que vous avez créé quand vous le voulez.',
      },
      networks: {
        both: {
          title: 'Fait partie du fédivers',
          body: 'Suivez des personnes sur Mastodon et Bluesky, et soyez suivi et lu par elles, sans quitter ce site. Il parle leurs deux protocoles : ActivityPub et le protocole AT.',
        },
        activitypub: {
          title: 'Fait partie du fédivers',
          body: 'Suivez des personnes sur Mastodon et les autres serveurs du fédivers, et soyez suivi et lu par elles, sans quitter ce site. Il parle leur protocole, ActivityPub.',
        },
        atproto: {
          title: 'Relié à Bluesky',
          body: 'Suivez des personnes sur Bluesky, et répondez-leur avec votre propre compte Bluesky, sans quitter ce site. Il parle le protocole de Bluesky, le protocole AT.',
        },
      },
    },
    lookAround: 'Jetez un coup d’œil',
    places: {
      people: 'Personnes',
      groups: 'Groupes',
      hashtags: 'Hashtags',
      about: 'À propos de ce site',
    },
    runsOn: 'Ce site fonctionne avec',
    runsOnAfter: ', un logiciel libre pour les communautés.',
  },
  // Shown in place of every page to somebody who is not signed in, on an
  // installation that is members-only (SITE_READ_ACCESS=registered).
  membersOnly: {
    cTitle: 'Ce site est réservé à ses membres',
    cDescription: 'Connectez-vous pour le lire. Rien n’est affiché aux personnes non connectées.',
    signIn: 'Se connecter',
  },
  // For somebody who is not signed in, on an installation that shows
  // visitors only the start of what is public (SITE_READ_ACCESS=preview).
  preview: {
    cTitle: 'Vous voyez un aperçu',
    cDescription: 'Connectez-vous pour lire les publications en entier, les réponses et tout ce qui suit la première page.',
    signIn: 'Se connecter',
    readMore: 'Connectez-vous pour lire la suite',
    comments: 'Connectez-vous pour lire les réponses',
    followers: 'Connectez-vous pour voir qui suit qui',
  },
};
