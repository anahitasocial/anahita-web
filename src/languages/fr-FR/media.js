export default {
  medium: {
    description: 'Description',
    title: 'Titre',
  },
  stepper: {
    position: '{{index}} sur {{total}}',
    next: 'Publication suivante',
    previous: 'Publication précédente',
    permalink: 'Ouvrir le lien permanent',
    home: 'Aller à l\'accueil',
    open: 'Ouvrir dans la visionneuse',
    zoomIn: 'Zoomer à la taille réelle',
    zoomOut: 'Dézoomer pour ajuster',
  },
  confirm: {
    delete: 'Voulez-vous supprimer cette publication ?',
  },
  // Épingler une publication au profil où elle se trouve.
  pin: {
    pin: 'Épingler au profil',
    unpin: 'Désépingler',
    label: 'Épinglée',
    pinned: 'Épinglée. Elle apparaît désormais en premier sur le profil.',
    unpinned: 'Désépinglée.',
    failed: 'Cette action n\'a pas pu être effectuée.',
  },
  // Les interactions d'une publication : qui a aimé, repartagé, cité et répondu.
  activity: {
    title: 'Interactions',
    likes: 'J’aime {{ count }}',
    reposts: 'Repartages {{ count }}',
    quotes: 'Citations {{ count }}',
    replies: 'Réponses {{ count }}',
    none: 'Rien ici que vous puissiez voir.',
    failed: 'Cette liste n\'a pas pu être chargée.',
    open: 'Ouvrir',
  },
  // Enregistrer une publication pour la retrouver. Privé.
  saved: {
    title: 'Enregistrements',
    save: 'Enregistrer',
    remove: 'Retirer des enregistrements',
    saved: 'Enregistrée. Elle est sous Enregistrements dans le menu.',
    removed: 'Retirée des enregistrements.',
    failed: 'Cette action n\'a pas pu être effectuée.',
    empty: 'Rien d\'enregistré pour l\'instant.',
    loadFailed: 'Vos enregistrements n\'ont pas pu être chargés.',
  },
  // The language button in the composer.
  language: {
    label: 'Langue : {{ name }}',
  },
};
