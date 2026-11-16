// Avertissements de contenu (anahita-services, ligne 122).
export default {
  label: 'Avertissement',
  none: 'Aucun',
  title: 'Avertissement de contenu',
  help: 'On verra votre contenu flouté, et derrière un avertissement.',
  kinds: {
    adult: 'Contenu pour adultes',
    suggestive: 'Contenu suggestif',
    graphic: 'Images choquantes',
    nudity: 'Nudité non sexuelle',
    other: 'Autre',
    ai: 'Fait avec l’IA',
  },
  lines: {
    adult: 'Images sexuelles explicites',
    suggestive: 'Sexuel, sans nudité',
    graphic: 'Violence, sang ou images troublantes',
    nudity: 'Nus artistiques, par exemple',
    other: 'Avec vos propres mots : divulgâcheurs, deuil…',
    ai: 'Images ou vidéo faites ou modifiées par l’IA',
  },
  words: 'Ce qu’elle contient',
  wordsNeeded: 'Dites ce que contient la publication.',
  remove: 'Retirer l’avertissement',
  view: 'Afficher',
  byModerator: 'Les administrateurs ont donné cet avertissement à la publication : il ne peut pas être changé ici.',
  // In the dialog, for an administrator giving one as the site's.
  moderatorHelp: 'Donné par les administrateurs : son auteur en est informé, et ne peut pas le retirer.',
  // A file chosen in the composer says it was made with AI.
  aiFound: 'Ce fichier dit avoir été fait avec l’IA : la publication est marquée Fait avec l’IA.',
  saved: 'Avertissement enregistré.',
  notSaved: 'L’avertissement n’a pas pu être enregistré.',
  // A post the reader chose to hide, as one line in a list.
  hidden: 'Masqué : {{ warning }}',
  // What each reader chooses, in their settings (row 122, phase 2).
  choices: {
    title: 'Avertissements',
    help: 'Ce que vous voyez d’une publication avec un avertissement',
    show: 'Afficher',
    warn: 'Avertir',
    hide: 'Masquer',
    // Other's line, for a reader: the kinds' own lines say the rest.
    otherLine: 'Avec les mots de son auteur : divulgâcheurs, deuil…',
  },
};
