export default {
  cTitle: 'Administration',
  cDescription: 'Les signalements, les demandes d’inscription et les invitations dont s’occupent les administrateurs.',
  mTitle: 'Administration',
  tabWithCount: '{{title}} ({{count}})',
  waiting_one: '{{count}} élément en attente',
  waiting_other: '{{count}} éléments en attente',
  restricted: {
    cTitle: 'L’administration est restreinte',
    cDescription: 'Réservé aux administrateurs.',
  },
  scheduled: {
    title: 'Suppressions prévues',
    description: 'Tous les profils sur le départ, les plus proches d’abord. Chacun peut être restauré ou supprimé définitivement depuis ses réglages tant qu’il lui reste des jours.',
    empty: 'Aucune suppression n’est prévue.',
    settings: 'Réglages',
    loadError: 'Impossible de charger les suppressions prévues.',
    kinds: {
      person: 'Personne',
      group: 'Groupe',
      event: 'Événement',
      website: 'Site web',
    },
  },
};
