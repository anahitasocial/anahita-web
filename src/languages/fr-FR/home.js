export default {
  cTitle: 'Accueil',
  mTitle: 'Accueil',
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
    cDescription: 'Connectez-vous pour lire les publications en entier, les commentaires et tout ce qui suit la première page.',
    signIn: 'Se connecter',
    readMore: 'Connectez-vous pour lire la suite',
    comments: 'Connectez-vous pour lire les commentaires',
    followers: 'Connectez-vous pour voir qui suit qui',
  },
};
